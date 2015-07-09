'use strict';

var M = require('./Models');

var pipeStatic = function(lovi, config, input, callback) {
  callback(input, config.unit);
}

var pipeRead = function(lovi, config, input, callback) {
  var request = new M.ReadRequest(input);
  lovi.onReadResponse(request.requestId, function(response) {
    callback(response.value, response.unit);
  }.bind(this));
  lovi.emitRequest(request);
}

var pipeWrite = function(lovi, config, input, callback) {
  var request = new M.WriteRequest(config.writeTo, input);
  lovi.emitRequest(request);
}

var pipeScale = function(lovi, config, input, callback) {
  var factor = config.factor.split(':');
  if (factor.length != 2) {
    throw {name: 'MalformedConfiguration',
      message: 'Operation parameter factor malformed: ' + config.factor};
  }

  var first = parseFloat(factor[0], 10)
  var second = parseFloat(factor[1], 10);
  if (isNaN(first) || isNaN(second) || first === 0 || second === 0) {
    throw {name: 'MalformedConfiguration',
      message: 'Operation parameter factor malformed: ' + config.factor};
  }

  var output = input;
  if (first < second) {
    output = input / (second / first);
  } else {
    output = input * (first / second);
  }

  callback(output);
};

exports.static = pipeStatic;
exports.read = pipeRead;
exports.write = pipeWrite;
exports.scale = pipeScale;
