var util = require('util'),
	winston = require('winston');


var MemoryLogger = winston.transports.MemoryLogger =  function(options) {
	this.name = 'MemoryLogger';
	this.buffer = new Array();
	this.limit = 1000;
}

util.inherits(MemoryLogger, winston.Transport);

MemoryLogger.prototype.log = function (level, msg, meta, callback) {
	var t = new Date();
	t = t.toLocaleDateString() + ' ' + t.toLocaleTimeString();

	this.buffer.push({
		time : t,
		level : level,
		msg : msg
	});

	if (this.buffer.length>this.limit) {
		this.buffer.splice(0, this.buffer.length-this.limit);
	}

	callback(null, true);
};

var logger = new winston.Logger({
    transports: [
      new (winston.transports.MemoryLogger)(),
//      new (winston.transports.Console)(),
      new (winston.transports.File)({ filename: 'jook.log' })
    ]
  });

module.exports = logger;