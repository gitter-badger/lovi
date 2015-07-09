'use strict';

var url = require('url');

Array.prototype.clean = function() {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == '') {
      this.splice(i, 1);
      i--;
    }
  }

  return this;
};

var parseUri = function(uriStr) {
  var split = uriStr.split(':');
  if (split.length < 2 || split.length > 3) {
    throw {name: 'MalformedUriException',
      message: 'The specified uri string is malformed'};
  }

  var a = {
    'lovi' : split[0],
    'binding' : split[1],
    'resource' : split[2]
  };
  return a;
}

var parseUrl = function(urlStr) {
  var parsed = url.parse(urlStr);
  if (parsed.protocol !== 'lovi:') {
    throw {name: 'MalformedUrlException',
      message: 'The specified url string is malformed'};
  }

  var paths = parsed.pathname ? parsed.pathname.split('/').clean() : [];
  var local = parsed.protocol === 'lovi:';
  return {
    'hostname' : local ? 'localhost' : parsed.hostname,
    'binding' : local ? parsed.hostname : paths[0],
    'resource' : local ? paths[0] : paths[1]
  }
}

var uriToLocalUrl = function(uriStr) {
  var parsed = parseUri(uriStr);
  var url = 'lovi://' + parsed.binding;
  if (parsed.resource !== undefined) {
    url += '/' + parsed.resource;
  }

  return url;
}

exports.parseUri = parseUri;
exports.parseUrl = parseUrl;
exports.uriToLocalUrl = uriToLocalUrl;
