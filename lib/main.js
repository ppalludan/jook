(function() {
	var daemon = require("daemonize2").setup({
	    main: "jook.js",
	    name: "Jook",
	    pidfile: "jookapp.pid",
	    cwd : process.cwd()
	});

	var program = require('commander'),
		colors = require('colors'),
		pjson = require('../package.json'),
		options = require('./options'),
		fs = require('fs'),
		path = require('path');

	// Process program arguments
	program.version(pjson.version)
		.option('-p, --port [number]', 'Port Number (default: ' + options.port)
		.option('-c, --config [filename]', 'Configuration Filename (default: ' + options.files.config)
		.option('-g, --genconfig [filename]', 'Generate a sample of the config')
		.option('--start', 'Start daemon')
		.option('--stop', 'Stop daemon');

	program.on('--help', function(){
      console.log('  Examples:');
      console.log('');
      console.log('    jook --help');
      console.log('    jook --p 9001');
      console.log('');
    });
    program.parse(process.argv);

    if (program.genconfig) {
    	console.log('Generating config: ' + program.genconfig);
		fs.createReadStream(path.join(process.cwd(), './lib/configtemplate.config')).pipe(fs.createWriteStream(program.genconfig));
    	return;
    }

	if (program.start) {
		console.log('starting');
		daemon.start();
		return;
	}

	if (program.stop) {
		console.log('stopping');
		daemon.stop();
		return;
	}

 	if (program.config && program.config!=true) {
 		options.files.config = program.config;
 	}

 	// Set the port if none present
 	if (!isNaN(parseInt(program.port,10))) {
		options.port = parseInt(program.port, 10);
 	}
 	require('./jook');

}).call(this);
