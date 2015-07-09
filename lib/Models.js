'use strict';

function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0;
    var v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function LoviError(uri, message) {
  this.uri = uri;
  this.message = message;
}

function ReadRequest(url) {
  this.requestId = guid();
  this.url = url;
  return this.requestId;
}

function WriteRequest(url, value) {
  this.requestId = guid();
  this.url = url;
  this.value = value;
  return this.requestId;
}

function Reading(uri, name, value, unit, requestId) {
  this.uri = uri;
  this.name = name;
  this.value = value;
  this.unit = unit;
  this.requestId = requestId;
}

function Writing(uri, requestId) {
  this.uri = uri;
  this.requestId = requestId;
}

function BindingRequest(url, command, extra) {
  this.url = url;
  this.command = command;
  this.extra = extra;
}

module.exports = {
  LoviError: LoviError,
  ReadRequest: ReadRequest,
  WriteRequest: WriteRequest,
  Reading: Reading,
  BindingRequest: BindingRequest
}
