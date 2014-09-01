/*
   Jooks
   contributor: @ppalludan
*/
var jook = this,
    http = require('http');

// references
jook.logger = require('./logger');
jook.repositories = new Array();
jook.options = require('./options');

jook.main = function() {
	var pjson = require('../package.json');

	jook.logger.info('Jook v ' + pjson.version 
		+ ' running, Port: ' + jook.options.port + ', config: ' + jook.options.files.config);

	// process the configuration
 	jook.readConfig(jook.options, process.cwd());

	// writing out the status for the repositories
	jook.repositories.map(function(rep) {
		jook.logger.info('Repository: ' + rep.name);
	});
	
 	// Start the webserver to handle the webhooks
	jook.startServer();
}

jook.startServer = function(options) {
	var server = http.createServer(jook.handleRequest).listen(jook.options.port);
}

jook.handleRequest = function(req, res) {
	if (req.method == 'POST') {
		var payLoad = '';

		req.on('data', function(chunk) {
			payLoad += chunk;
		});

		req.on('end', function() {
			jook.offLoad(JSON.parse(payLoad), function(err) {

				if (err) {
					res.writeHead(500, {'Content-Type':'application/json'});
					res.write('err: ' + err);
				} else {
					res.writeHead(200, {'Content-Type':'application/json'});
					res.write('ok');
				}
				res.end();					
			});
		});
	} else {
		if (req.url == '/') {
			jook.index(req, res);
		} else if (req.url == '/logo.png') {
			jook.logo(req, res);
		} else {
			res.writeHead(404, {'Content-Type':'text/html'});
		}
		res.end();
	}
}

jook.auth = function(req, res) {
	var auth = req.headers['authorization']; 
	
	if(!auth) {
		res.statusCode = 401;
		res.setHeader('WWW-Authenticate', 'Basic realm="Jook"');
		res.end('<html><body>Access Denied To Jook</body></html>');
		return false;
	}

	auth = new Buffer( auth.split(' ')[1], 'base64').toString().split(':');
	var username = auth[0];
	var password = auth[1];

	if (username != jook.options.username || password != jook.options.password) {
		res.statusCode = 401;
		res.setHeader('WWW-Authenticate', 'Basic realm="Jook"');
		res.end('<html><body>Access Denied To Jook</body></html>');
		return false;
	}

	return true;
}

jook.index = function(req, res) {

	if (!jook.auth(req, res))
		return;

	res.writeHead(200, {'Content-Type':'text/html'});
	var logger = this.logger.transports.MemoryLogger;

	var html = '<table border="1">';

	var header = false;

	logger.buffer.map(function(entry) {
		if (!header) {
			html += '<tr>';
			for (var p in entry) {
				html += '<th>' + p + '</th>';
			}
			html += '<tr>\n';
			header = true;
		}

		html += '<tr class="level-' + entry.level + '">';
		for (var p in entry) {
			html += '<td>' + entry[p] + '</td>';
		}
		html += '<tr>\n';

	});

	html += '</table>';

	res.write(this.options.template.replace('$contents', html));
}

// ehh need a logo 
jook.logo = function(req, res) {
	res.writeHead(200, {'Content-Type':'image/png'});	
	var fs = require('fs');
	var path = require('path');

	var file = path.join(path.dirname(fs.realpathSync(__filename)), 'logo.png');
	res.write(fs.readFileSync(file));
}

// Handle the webhook payload
// callback = function(err)
jook.offLoad = function(payLoad, callback) {
	var exec = require('child_process').exec;

	function cbError(err) {
		jook.logger.error(err);
		callback(err);
	}

	if (payLoad == null || payLoad.repository == null) {
		cbError('missing repository in payload');
		return;
	}


	var repository = jook.getRepositoryByName(payLoad.repository.full_name);
	if (repository == null) {
		jook.logger.info('dont know repository payload name: "' + payLoad.repository.full_name + '"')
		callback(null);			
		return;
	}

	for (var i=0;i<repository.process.length;i++) {
		var p = repository.process[i];
		if (p == null) {
			jook.logger.info('Empty Process: ' + i);
			continue;
		}

		jook.logger.info('Executing: ' + p.name + '[' + i + ']');

		try {
			var pos = i;
			exec(p.exec, function (error, stdout, stderr) {
			  	if (error) {
			  		cbError('Error invoking exec: ' + error);
			  		return;
			  	}

			  	if (stderr) {
			  		cbError('Error with exec: ' + stderr);
			  		return;	
			  	}

			  	jook.logger.info('Process Out [' + pos + ']: ');
			  	jook.logger.debug(stdout);
			});
		} catch (err) {
			cbError('Unknown err: ' + err);
			return;
		}
	}

	callback(null);
}

jook.getRepositoryByName = function(name) {
	var rep = null;
	this.repositories.map(function(repository) {
		if (repository.name == name) {
			rep = repository;
			return;
		}
	});
	return rep;
}

jook.readConfig = function(options, cwd) {
	var fs = require('fs');
	var path = require('path');

	var file = path.join(cwd, jook.options.files.config);
	
	if (!fs.existsSync(file)) {
		throw 'Config File not found: ' + jook.options.files.config;
	}

	var data = fs.readFileSync(file);
	var json = JSON.parse(data);

	if (!isNaN(parseInt(json.port,10))) {
		jook.options.port = parseInt(json.port, 10); 		
 	}

	if (json.repositories == null || json.repositories.length == 0) {
		throw 'Repositories not defined in config';
	}

	json.repositories.map(function(rep) {
		if (rep == null || rep.name == null || rep.process==null)
			return;

		var process = new Array();

		var repository = {
			name : rep.name,
			process : new Array()
		};

		rep.process.map(function(p) {
			repository.process.push({
				name : p.name,
				exec : p.exec
			});
		});

		jook.repositories.push(repository);
	});


	var file = path.join(path.dirname(fs.realpathSync(__filename)), 'template.html');
	options.template = fs.readFileSync(file).toString();
} 

jook.main();
