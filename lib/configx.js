#!/usr/bin/env node
var configExtend = require('config-extend');
var path = require('path');
var appRoot = require('app-root-path').toString();
var filesystem = require('fs');
var _ = require('underscore');

function isDefined(o) {
  return o !== undefined;
}

function load(name) {
  var nameDefault = name + '.default';

  var loadInternal = function(file) {
    try {
      console.log('Loading ' + file);
      var config = require(file);
      console.log('Loaded ' + file);
      return config;
    } catch (error) {
      console.log('Did not load ' + file);
      if (error.name === 'SyntaxError') {
        throw error;
      }
    }
  }

  var files = [];
  files.push(path.join(appRoot, 'node_modules/lovi/config', nameDefault));
  files.push(path.join(appRoot, 'config', nameDefault));
  files.push(path.join(appRoot, 'config', name));
  files.push(path.join('/etc/lovi', name));

  var configs = _.filter(files.map(loadInternal), isDefined);
  return configExtend.apply(null, configs);
}

function namesInFolder(dir) {
  var filesystem = require('fs');
  var results = [];
  try {
    var stat = filesystem.statSync(dir);
    if (!stat || !stat.isDirectory()) {
      return results;
    }

    filesystem.readdirSync(dir).forEach(function(file) {

      file = dir + '/' + file;
      var stat = filesystem.statSync(file);

      if (stat && stat.isFile()) {
        results.push(path.parse(file).name);
      }
    });

    return results;
  } catch (error) {
    return results;
  }
};

function loadConfigsInFolder(folderName, callback) {
  var folders = [];
  folders.push(path.join(appRoot, 'config', folderName));
  folders.push(path.join('/etc/lovi', folderName));
  var allNames = _.union(_.flatten(folders.map(namesInFolder)));
  allNames.forEach(function(name) {
    var config = load(path.join(folderName, name));
    callback(config);
  });
}

module.exports = {
  load: load,
  loadConfigsInFolder: loadConfigsInFolder
}
