
var assert = require('assert');
var DP = require('../lib/default_pipes.js');

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

describe('Pipes', function() {
  describe('Scale', function() {
    it('should have a scale method', function() {
      assert.equal(typeof DP, 'object');
      assert.equal(typeof DP.scale, 'function');
    });

    it('should be able to scale down', function(done) {
      DP.scale(undefined, { name : 'scale', factor : '1:52' }, 104, function(output) {
        assert.equal(output, 2);
        done();
      });
    })

    it('should be able to scale up', function(done) {
      DP.scale(undefined, { name : 'scale', factor : '5:0.5' }, 10, function(output) {
        assert.equal(output, 100);
        done();
      });
    })

    it('should be able to do no scaling', function(done) {
      DP.scale(undefined, { name : 'scale', factor : '1.8:1.8' }, 12, function(output) {
        assert.equal(output, 12);
        done();
      });
    })

    it('should throw error on malformed factor', function(done) {
      assert.throws(DP.scale.curry(undefined, { name : 'scale', factor : ':1.8' }, 12,
      function() {assert.fail();}), function(err) { return err.name === 'MalformedConfiguration'});

      assert.throws(DP.scale.curry(undefined, { name : 'scale', factor : '5:kog' }, 12, function() {assert.fail();}),

      function(err) { return err.name === 'MalformedConfiguration'});

      assert.throws(DP.scale.curry(undefined, { name : 'scale', factor : '0:1' }, 12, function() {assert.fail();}),

      function(err) { return err.name === 'MalformedConfiguration'});

      assert.throws(DP.scale.curry(undefined, { name : 'scale', factor : '5:0' }, 12, function() {assert.fail();}),

      function(err) { return err.name === 'MalformedConfiguration'});

      done();
    })
  });
});
