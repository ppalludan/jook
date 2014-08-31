var winston = require('winston');

var logger = new winston.Logger({
    transports: [
      new (winston.transports.Console)(),
      new (winston.transports.File)({ filename: 'jook.log' })
    ]
  });

module.exports = logger;