var util = require('util'),
	winston = require('winston');


// a memory logger, just used to store the latest entries in a buffer we can display
var MemoryLogger = winston.transports.MemoryLogger =  function(options) {
	this.name = 'MemoryLogger';
	this.buffer = new Array();
	this.limit = 256;
	this.level = options.level;
}

util.inherits(MemoryLogger, winston.Transport);

MemoryLogger.prototype.log = function (level, msg, meta, callback) {
	var t = new Date();
	t = t.toLocaleDateString() + ' ' + t.toLocaleTimeString();

	this.buffer.unshift({
		time : t,
		level : level,
		repository : meta.repository,
		msg : msg
	});

	if (this.buffer.length>this.limit) {
		this.buffer = this.buffer.splice(0, this.limit);
	}

	callback(null, true);
};

// Add the loggers
var logger = new winston.Logger({
    transports: [
      new (winston.transports.MemoryLogger)({level:'debug'}),
//      new (winston.transports.Console)({level:'debug'}),
      new (winston.transports.File)({ filename: 'jook.log' })
    ]
  });

module.exports = logger;