var C = require('../lib/Constants');
var App = require('../lib/Lovi.js');
var fs = require('fs');

var lovi = new App();

console.log('C: ' + C.DIR_BINDINGS_CONFIG);

var files = fs.readdirSync(C.DIR_BINDINGS_CONFIG);
files.forEach(function(file) {
  console.log('File: ' + file);
  console.log(JSON.parse(fs.readFileSync(C.DIR_BINDINGS_CONFIG + file, 'utf8')));
}.bind(this));
