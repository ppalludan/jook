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

// Main method for reading configuration and starting webserver
jook.main = function() {
	var pjson = require('../package.json');

	// process the configuration
 	jook.readConfig(jook.options, process.cwd());

    jook.logger.info('Jook v ' + pjson.version
		+ ' running, Port: ' + jook.options.port + ', config: ' + jook.options.files.config);

	// writing out the status for the repositories
	jook.repositories.map(function(rep) {
		jook.logger.info('Repository Loaded', { repository : rep.name });
	});

 	// Start the webserver to handle the webhooks
	jook.startServer();
}

// Start a given server
jook.startServer = function(options) {
	try {
		jook.server = http.createServer(jook.handleRequest).listen(jook.options.port);
	} catch (ex) {
		console.log('Error starting jook server on port ' + jook.options.port + ', could it be port conflicts?');
	}
}

// Handle the requests
jook.handleRequest = function(req, res) {
	if (req.method == 'POST') {
		var payLoad = '';

		req.on('data', function(chunk) {
			payLoad += chunk;
		});

		req.on('end', function() {
            jook.offLoad(payLoad, function(response) {
                if (response.status != 200) {
                    jook.logger.error(response.message);
                    console.log(response.message);
                }

				res.writeHead(response.status, {'Content-Type':'application/json'});
				res.write(response.message);
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

// basic authentication
jook.auth = function(req, res) {
	var auth = req.headers['authorization'];

	// Not authenticated, request the basic authentication form
	if(!auth) {
		res.statusCode = 401;
		res.setHeader('WWW-Authenticate', 'Basic realm="Jook"');
		res.end('<html><body>Access Denied To Jook</body></html>');
		return false;
	}

	// decode the authentication
	auth = new Buffer( auth.split(' ')[1], 'base64').toString().split(':');
	var username = auth[0];
	var password = auth[1];

	// Does password match the configured
	if (username != jook.options.username || password != jook.options.password) {
		res.statusCode = 401;
		res.setHeader('WWW-Authenticate', 'Basic realm="Jook"');
		res.end('<html><body>Access Denied To Jook</body></html>');
		return false;
	}

	return true;
}

// write out the log using the template
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
			var val = entry[p];
			val = val == null ? '' : val;
            if (p=='msg') {
                val = '<pre>' + val + '</pre>';
            };
			html += '<td>' + val + '</td>';
		}
		html += '<tr>\n';

	});

	html += '</table>';

	res.write(this.options.template.replace('$contents', html));
}

// ehh need a logo  :)
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
    var json = null;
    try {
        json = JSON.parse(payLoad)
    } catch (ex) {
        return callback({
            status : 400,
            message : 'Invalid json'
        });
    }

	jook.getRepository(json, function(repository) {
        if (repository == null) {
            return callback({
                status : 404,
                message : 'repository not found'
            });
        }

        jook.invokeProcesses(repository);

        return callback({
            status : 200,
            message : 'ok'
        });
    });
}

// For a given repository invoke its connected processes
jook.invokeProcesses = function(repository) {
	var exec = require('child_process').exec;

	if (repository == null || repository.process == null)
	{
		jook.logger.error('Invalid Repository');
		return;
	}

	var name = repository.name + (repository.branch != null ? ('{' + repository.branch + '}') : '');

	for (var i=0;i<repository.process.length;i++) {
		var proc = repository.process[i];
		if (proc == null) {
			jook.logger.info(lbl + ' is empty, skipping', { repository : repository.name });
			continue;
		}
		var lbl = 'Process ' + proc.name + '[' + i + ']';

		jook.logger.info(lbl + ' invoking process', { repository : repository.name });

		try {
			exec(proc.exec, function (error, stdout, stderr) {
			  	jook.logger.debug(lbl + ': ' + stdout, { repository : repository.name });

			  	if (error) {
				  	jook.logger.error(lbl + ' error: ' + error, { repository : repository.name });
			  	}

			  	if (error || stderr) {
				  	jook.logger.error(lbl + ' std error: ' + stderr, { repository : repository.name });
				  	return;
			  	}
			});
		} catch (err) {
			jook.logger.error(lbl + ' experience unknown err: ' + err);
		}

		jook.logger.info(lbl + ' invoked succesfully', { repository : repository.name });
	}

	return null;
}

//
jook.getRepository = function(payLoad, callback) {
    if (payLoad == null || payLoad.repository == null || payLoad.repository.full_name == null) {
        jook.logger.error('invalid or empty payload');
        return callback(null);
    }

	var name = payLoad.repository.full_name;
	var branch = payLoad.ref.replace('refs/heads/', '');
	var repository = null;
	this.repositories.map(function(rep) {
		if (rep.name == name && (rep.branch == null || rep.branch == branch)) {
			repository = rep;
			return;
		}
	});


	// Validate the key of the payLoad
	if (repository != null && repository.secret != null) {

	}

    return callback(repository);
}

// Read the Configuration File
jook.readConfig = function(options, cwd) {
	var fs = require('fs');
	var path = require('path');

	var file = path.join(cwd, jook.options.files.config);

	if (!fs.existsSync(file)) {
		throw 'Config File not found: ' + jook.options.files.config;
	}

	var data = fs.readFileSync(file);
	var json = JSON.parse(data);

	if (jook.options.port==null && !isNaN(parseInt(json.port,10))) {
		jook.options.port = parseInt(json.port, 10);
 	}

	if (jook.options.port == null || jook.options.port<=0) {
		jook.options.port = 8080;
	}

 	if (json.username != null) {
 		jook.options.username = json.username;
 	}

 	if (json.password != null) {
 		jook.options.password = json.password;
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
			branch : rep.branch,
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
