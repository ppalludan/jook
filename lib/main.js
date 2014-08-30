/*
   Jooks
   Copyright : 2014
   Contributor : ppalludan
*/
(function() {
	// references
	var options = require('./options');

	function main(args) {
		var program = require('commander');
		
		// Process program arguments
		program.version('0.0.1')
	      .option('-p, --port [number]', 'Port Number (default: ' + options.port)
	      .option('-c, --config [filename]', 'Configuration Filename (default: ' + options.files.config);

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
			options.port = parseInt(program.port, 10); 		
	 	}   

	 	if (program.config && program.config!=true) {
	 		options.files.config = program.config;
	 	}

   	 	readConfig(options)

		startServer(options);
	}

	function startServer(options) {
		var http = require('http');
	}

	function readConfig(options) {
		var fs = require('fs');
		var path = require('path');

		var file = path.join(path.dirname(fs.realpathSync(__filename)), options.files.config);
		console.log(file);

		if (!fs.existsSync(file)) {
			throw 'Config File not found: ' + options.files.config;
		}


		var data = fs.readFileSync(file);
    	var json = JSON.parse(data);

    	if (json.repositories == null || json.repositories.length == 0) {
    		throw 'Repositories not defined in config';
    	}

    	json.repositories.map(function(repository) {
    		console.log(repository.git);
    	})
	} 

	main(process.argv);

}).call(this);