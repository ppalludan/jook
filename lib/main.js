/*
   Jooks
   Copyright : 2014
   Contributor : ppalludan
*/
(function() {
	// references
	this.options = require('./options');

	this.main = function(args) {
		var program = require('commander');
		var colors = require('colors');
		
		// Process program arguments
		program.version('0.0.1')
	      .option('-p, --port [number]', 'Port Number (default: ' + this.options.port)
	      .option('-c, --config [filename]', 'Configuration Filename (default: ' + this.options.files.config);

		program.on('--help', function(){
	      console.log('  Examples:');
	      console.log('');
	      console.log('    jook --help');
	      console.log('    jook --p 9001');
	      console.log('');
	    });
	    program.parse(args);

	 	// Set the port if none present
	 	if (!isNaN(parseInt(program.port,10))) {
			this.options.port = parseInt(program.port, 10); 		
	 	}   

	 	if (program.config && program.config!=true) {
	 		this.options.files.config = program.config;
	 	}

   	 	this.readConfig()

		this.startServer();

				console.log('['.grey +('Jook v ' + program._version + ' running').cyan + ']'.grey + ' ' + 
					'['.grey + ('Port: ' + this.options.port + ', config: ' + this.options.files.config).cyan + ']'.grey);
	}

	this.startServer = function(options) {
		var http = require('http');

		var server = http.createServer(this.handleRequest).listen(this.options.port);
	}

	this.handleRequest = function(req, res) {
		var jook = this;

		if (req.method == 'POST') {
			var payLoad = '';

			req.on('data', function(chunk) {
				console.log('data');
				payLoad += chunk;
			});

			req.on('end', function() {
				jook.handlePayload(JSON.parse(payLoad), function(err) {

					if (err) {
						res.writeHead(500, {'Content-Type':'application/json'});
						res.write(err);
					} else {
						res.writeHead(200, {'Content-Type':'application/json'});
						res.write((JSON.stringify(payLoad)));
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

	this.handkePayload = function(payLoad, callback) {

	}

	this.readConfig = function(options) {
		var fs = require('fs');
		var path = require('path');

		var file = path.join(path.dirname(fs.realpathSync(__filename)), this.options.files.config);
		
		if (!fs.existsSync(file)) {
			throw 'Config File not found: ' + this.options.files.config;
		}

		var data = fs.readFileSync(file);
    	var json = JSON.parse(data);

    	if (json.repositories == null || json.repositories.length == 0) {
    		throw 'Repositories not defined in config';
    	}

    	json.repositories.map(function(repository) {
    	//	console.log(repository.git);
    	})
	} 

	this.main(process.argv);

}).call(this);