'use strict';

var C = require('./Constants');
var addLogger = require('./util').addLogger;

var loadBindings = function(lovi) {
  var bindingFiles = fs.readdirSync(C.DIR_BINDINGS_CONFIG);
  bindingFiles.forEach(function(file) {
    if (file.endsWith('.json')) {
      var configList = JSON.parse(fs.readFileSync(C.DIR_BINDINGS_CONFIG + file,
        'utf8'));
      configList.forEach(function(config) {
        try {
          var lib = require(config.binding);
          if (lib === undefined) {
            lovi.logger.error('Could not load binding ' + config.binding);
          } else {
            var logger = addLogger(config.binding);
            var binding = lib.createBinding(lovi, config, logger);
            lovi.emit(config.name + '-init');
            lovi.logger.debug('Created binding ' + config.name);
          }
        } catch (err) {
          lovi.logger.error('Could not find or load binding ' + config.binding,
            err);
        }

      });
    }
  });
}

exports.scale = pipeScale;
