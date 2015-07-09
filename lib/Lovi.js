'use strict';

var EventEmitter = require('events').EventEmitter
var uri = require('./uri');
var inherits = require('util').inherits;
var addLogger = require('./util').addLogger;
var readFolder = require('./util').readFolder;
var Scheduler = require('./Scheduler');
var Pipes = require('./Pipes');
var C = require('./Constants');
var M = require('./Models');
var path = require('path');

var bindingRequestListeners = {};

function Lovi() {
  EventEmitter.call(this);
  this.logger = addLogger('lovi');
  this.pipes = new Pipes(this, addLogger('pipes'));
  this.scheduler = new Scheduler(this, addLogger('schedules'));
}

inherits(Lovi, EventEmitter);

module.exports = Lovi;

Lovi.prototype.start = function() {
  this.logger.debug('Start');

  this.on(C.EVENT_BINDING_INITIALIZED, bindingInitialized);

  // DEBUG PURPOSE
  this.on(C.EVENT_RESOURCE_VALUE_READING, function(reading) {
    this.logger.debug('Reading:', reading);
  });

  // Read bindings
  readFolder(C.DIR_BINDINGS_CONFIG, function(content) {
    content.forEach(function(binding) {
      try {
        this.logger.debug('Trying to load binding ', binding.name);
        var lib;
        if (binding.module === 'dummy') {
          lib = require('./lovi-dummy/index')
        } else {
          lib = require(binding.module);
        }

        if (lib === undefined) {
          this.logger.error('Could not load binding ' + binding.module);
        } else {
          var logger = addLogger(binding.module);
          var bindingUri = 'lovi:' + binding.name;
          this.logger.debug('Uri of new binding: ' + bindingUri);
          var configuration = prepareConfiguration(binding.settings);
          var bindingInstance = lib.createBinding(this, bindingUri,
            configuration, logger);
          this.emit(C.BINDING_REQUEST, new M.BindingRequest(
            uri.uriToLocalUrl(bindingUri), C.BINDING_REQUEST_INIT));
          this.logger.debug('Created binding ' + binding.name);
        }
      } catch (err) {
        this.logger.error('Could not find or load binding ' + binding.module,
        err);
      }
    }.bind(this));
  }.bind(this));

  // Read schedules
  readFolder(C.DIR_SCHEDULES_CONFIG, function(content) {
    content.forEach(function(schedule) {
      this.logger.debug('Scheduling cron ' + schedule.id + ': ', schedule.cron);
      this.scheduler.schedule(schedule.cron, schedule);
    }.bind(this));
  }.bind(this));

  function bindingInitialized(bindingUri) {
    this.logger.debug('Binding initialized: ' + bindingUri);

    var parsed = uri.parseUri(bindingUri);

    readFolder(C.DIR_RESOURCES_CONFIG, function(content) {
      content.forEach(function(resourceDefinition) {
        if (resourceDefinition.binding == parsed.binding) {
          this.emit(C.BINDING_REQUEST, new M.BindingRequest(
            uri.uriToLocalUrl(bindingUri), C.BINDING_REQUEST_PARSE_RESOURCES,
            resourceDefinition.resources));
        }
      }.bind(this));
    }.bind(this));
  }

  function prepareConfiguration(bindingSettings) {
    var configDir = path.dirname(process.mainModule.filename) + '/config/';
    bindingSettings.__configdir = configDir;
    return bindingSettings;
  }
}

Lovi.prototype.emitRequest = function(request) {
  this.emit(C.BINDING_REQUEST, request);
}

Lovi.prototype.emitReading = function(reading) {
  this.emit(C.EVENT_RESOURCE_VALUE_READING, reading);
}

Lovi.prototype.emitWriting = function(writing) {
  this.emit(C.EVENT_RESOURCE_WRITTEN, writing);
}

Lovi.prototype.emitError = function(error) {
  this.emit(C.EVENT_BINDING_ERROR, error);
}

Lovi.prototype.onReadResponse = function(requestId, listener) {
  var wrappedListener = function(response) {
    if (response.requestId === requestId) {
      listener(response);
    } else {
      this.once(C.EVENT_RESOURCE_VALUE_READING, wrappedListener);
    }
  }

  this.once(C.EVENT_RESOURCE_VALUE_READING, wrappedListener);
}

Lovi.prototype.registerBindingRequestListener = function(bindingUri, listener) {
  if (bindingRequestListeners[bindingUri] !== undefined) {
    throw {name: 'IllegalStateException',
      message: 'A binding request listener for this binding already exist'};
  }

  var binding = uri.parseUri(bindingUri);
  bindingRequestListeners[bindingUri] = function(request) {
    var parsed = uri.parseUrl(request.url);
    if (binding.binding === parsed.binding) {
      listener(request);
    }
  }

  this.logger.debug('Registering binding request listener');
  this.on(C.BINDING_REQUEST, bindingRequestListeners[bindingUri]);
}

Lovi.prototype.removeBindingRequestListener = function(bindingUri) {
  if (bindingRequestListeners[bindingUri] === undefined) {
    throw {name: 'IllegalStateException',
      message: 'No binding request listener for this binding exist'};
  }

  this.removeListener(bindingRequestListeners[bindingUri]);

  delete bindingRequestListeners[bindingUri];
}
