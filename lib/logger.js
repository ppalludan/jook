var util = require('util'),
	winston = require('winston');


var MemoryLogger = winston.transports.MemoryLogger =  function(options) {
	this.name = 'MemoryLogger';
	this.buffer = new Array();
	this.limit = 1000;
}

util.inherits(MemoryLogger, winston.Transport);

MemoryLogger.prototype.log = function (level, msg, meta, callback) {
	
	console.log(msg);

	var t = new Date();
	t = t.toLocaleDateString() + ' ' + t.toLocaleTimeString();

	this.buffer.push({
		time : t,
		level : level,
		msg : msg
	});

	callback(null, true);
};

var logger = new winston.Logger({
    transports: [
      new (winston.transports.MemoryLogger)(),
//      new (winston.transports.Console)(),
      new (winston.transports.File)({ filename: 'jook.log' })
    ]
  });

logger.getTransporter = function(name) {
	var transporter = null;
	
	console.log(this);

/*	this.transports.map(function(t) {
		if (t.name == name) {
			transporter = t;
		}
	});*/
	return transporter;
}

module.exports = logger;