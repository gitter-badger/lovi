
if (typeof String.prototype.endsWith != 'function') {
  String.prototype.endsWith = function(str) {
    return this.substring(this.length - str.length, this.length) === str;
  }
};

Function.prototype.method = function(name, func) {
  this.prototype[name] = func; return this;
};

Function.method('curry', function() {
  var slice = Array.prototype.slice;
  var args = slice.apply(arguments);
  _this = this;
  return function() {
    return _this.apply(null, args.concat(slice.apply(arguments)));
  };
});

exports.Lovi = require('./Lovi');
exports.Constants = require('./Constants');
exports.Models = require('./Models');
exports.uri = require('./uri');
exports.LoviHelper = require('./LoviHelper');
