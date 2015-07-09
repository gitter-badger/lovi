
var Binding = require('./Binding');

Function.prototype.method = function(name, func) {
  this.prototype[name] = func; return this;
};

Function.method('curry', function() {
  var slice = Array.prototype.slice;
  var args = slice.apply(arguments);
  var _this = this;
  return function() {
    return _this.apply(null, args.concat(slice.apply(arguments)));
  };
});

function createBinding(lovi, uri, configuration, logger) {
  return new Binding(lovi, uri, configuration, logger);
}

module.exports = {
  createBinding: createBinding
};
