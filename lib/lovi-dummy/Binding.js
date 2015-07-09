'use strict';

var url = require('url');
var uri = require('../').uri;
var C = require('../').Constants;
var M = require('../').Models;

module.exports = Binding;

/**
 * Binding - description
 *
 * @param  {Lovi} lovi            the running Lovi instance
 * @param  {string} uri           unique binding instance uri
 * @param  {Object} configuration binding configuration
 * @param  {winston} logger       a winston logger for the binding instance
 * @return {Binding}              a dummy binding instance
 */
function Binding(lovi, uri, configuration, logger) {
  this.lovi = lovi;
  this.uri = uri;
  this.logger = logger;
  this.lovi.registerBindingRequestListener(this.uri, this.onRequest.bind(this));
  this.logger.debug('Created binding');
  this.resources = {};
};

Binding.prototype.onRequest = function(request) {
  this.logger.debug('Got request: ', request);

  if (request instanceof M.BindingRequest) {
    this.onBindingRequest(request);
  } else if (request instanceof M.ReadRequest) {
    this.onReadRequest(request);
  } else if (request instanceof M.WriteRequest) {
    this.onWriteRequest(request);
  } else {
    this.logger.error('Unknown request to modbus binding', request);
  }
}

Binding.prototype.onReadRequest = function(request) {
  this.logger.info('ReadRequest: ' + request.requestId + ', url: ' + request.url);
  var parsed = uri.parseUrl(request.url);
  var resource = this.resources[parsed.resource];
  var reading = new M.Reading(this.uri + ':' + parsed.resource, resource.name, resource.value, resource.unit, request.requestId);
  this.lovi.emitReading(reading);
}

Binding.prototype.onBindingRequest = function(request) {
  if (request.command === C.BINDING_REQUEST_INIT) {
    this.init();
  } else if (request.command === C.BINDING_REQUEST_PARSE_RESOURCES) {
    this.parseResources(request.extra);
  }
}

Binding.prototype.init = function() {
  this.logger.debug('Initializing binding');
  this.lovi.emit(C.EVENT_BINDING_INITIALIZED, this.uri);
}

Binding.prototype.parseResources = function(resources) {
  resources.forEach(function(block) {
    this.resources[block.name] = block;
    this.logger.debug('Created resource ' + block.name);
  }.bind(this));
}
