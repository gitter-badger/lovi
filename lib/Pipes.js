'use strict';

var ps = require('./default_pipes.js');
var Reading = require('./Models').Reading;

function Pipes(lovi, logger) {
  this.lovi = lovi;
  this.logger = logger;
  this.logger.debug('Start');
  this.pipes = {
    'scale' : ps.scale,
    'read' : ps.read,
    'write' : ps.write,
    'static' : ps.static
  };
}

module.exports = Pipes;

Pipes.prototype.register = function(id, pipe) {
  if (this.pipes[id] !== undefined) {
    throw {name: 'TypeError',
      message: 'Pipe operation with specified id already exist'};
  }

  this.logger.debug('Registered pipe ' + id);
  this.pipes[id] = pipe;
}

Pipes.prototype.unregister = function(id) {
  delete this.pipes[id];
}

Pipes.prototype.pipe = function(config, input) {
  if (!config.operation) {
    throw {name: 'TypeError', message: 'config.operation need be defined'};
  }

  if (this.pipes[config.operation.name] === undefined) {
    throw {name: 'NotFoundException',
      message: 'No operation found with id ' + config.operation.name};
  }

  this.pipes[config.operation.name](this.lovi, config.operation, input,
    function(outputValue, outputUnit) {
    var unit = config.unit !== undefined ? config.unit : outputUnit;
    if (config.hasOwnProperty('output')) {
      this.logger.debug('config.output:', config.output);
      this.logger.debug('outputValue:', outputValue);
      this.logger.debug('unit:', unit);
      var outputUri = 'lovi:' + config.operation.name + ':' + config.output;
      var reading = new Reading(outputUri, config.output, outputValue, unit);
      this.lovi.emitReading(reading);
      this.logger.debug('Reading:', reading);
    }

    if (config.pipeTo) {
      if (!config.pipeTo.unit || typeof config.pipeTo.unit !== 'string') {
        config.pipeTo.unit = unit;
      }

      this.logger.debug('Piping through output ' +
        outputValue + ' with config ', config.pipeTo);
      this.pipe(config.pipeTo, outputValue);
    } // Else end of pipe

  }.bind(this));

}
