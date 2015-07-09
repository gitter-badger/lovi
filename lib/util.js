'use strict';

var fs = require('fs');
var winston = require('winston');

if (typeof String.prototype.endsWith != 'function') {
  String.prototype.endsWith = function(str) {
    return this.substring(this.length - str.length, this.length) === str;
  }
};

exports.addLogger = function(name) {
  winston.loggers.add(name, {
    console: {
      level: 'error',
      colorize: true,
      label: name
    }
  });
  var logger = winston.loggers.get(name);
  logger.setLevels(winston.config.syslog.levels);
  return logger;
}

exports.readFolder = function(folder, callback) {
  var files = fs.readdirSync(folder);
  files.forEach(function(file) {
    if (file.endsWith('.json')) {
      callback(JSON.parse(fs.readFileSync(folder + file, 'utf8')));
    }
  }.bind(this));
}
