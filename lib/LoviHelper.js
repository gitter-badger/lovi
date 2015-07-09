'use strict'

function registerPlugin(pluginName, configuration) {
  var appRoot = require('app-root-path');
  var fs = require('fs');
  var file = appRoot + '/config/plugins.json';
  console.log('App root: ' + appRoot);
  var config = {};
  try {
    stats = fs.lstatSync(file);
    config = require(file);
  } catch (e) {
    console.log('Error statting file', e);
  }

  config[pluginName] = (configuration === undefined) ? {} : configuration;

  try {
    fs.writeFileSync(file, JSON.stringify(config, null, 4));
  } catch (e) {
    console.log('Error writing file', e);
  }
}

module.exports = {
  registerPlugin: registerPlugin
}
