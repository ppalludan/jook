/*
   Jooks
   Copyright : 2014
   Contributor : ppalludan
*/
(function() {
	var jook = this;

	// references
	jook.logger = require('./logger');
	jook.options = require('./options');
	jook.repositories = new Array();

	jook.main = function(args, cwd) {
		var program = require('commander');
		var colors = require('colors');
		var pjson = require('../package.json');
		
		// Process program arguments
		program.version(pjson.version)
	      .option('-p, --port [number]', 'Port Number (default: ' + jook.options.port)
	      .option('-c, --config [filename]', 'Configuration Filename (default: ' + jook.options.files.config);

		program.on('--help', function(){
	      console.log('  Examples:');
	      console.log('');
	      console.log('    jook --help');
	      console.log('    jook --p 9001');
	      console.log('');
	    });
	    program.parse(args);

	 	if (program.config && program.config!=true) {
	 		jook.options.files.config = program.config;
	 	}

   	 	jook.readConfig(jook.options, cwd);

	 	// Set the port if none present
	 	if (!isNaN(parseInt(program.port,10))) {
			jook.options.port = parseInt(program.port, 10); 		
	 	}

	 	// Start the webserver to handle the webhooks
		jook.startServer();

		// writing out the status for the repositories
		console.log('['.grey +('Jook v ' + program._version + ' running').cyan + ']'.grey + ' ' + 
			'['.grey + ('Port: ' + jook.options.port + ', config: ' + jook.options.files.config).cyan + ']'.grey);

		jook.repositories.map(function(rep) {
			jook.logger.info('Repository: ' + rep.name);
		});

		jook.logger.info('hehe');
	}

	jook.startServer = function(options) {
		var http = require('http');

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
			res.writeHead(200, {'Content-Type':'application/json'});
            res.write('yes hello?');
			res.end();
		}
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
	} 

	jook.main(process.argv, process.cwd());

}).call(this);
