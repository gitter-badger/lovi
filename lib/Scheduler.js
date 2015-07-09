var url = require('url');
var CronJob = require('cron').CronJob;

function Scheduler(lovi, logger) {
  this.lovi = lovi;
  this.logger = logger;
};

Scheduler.prototype.schedule = function(cronPattern, request) {
  new CronJob(cronPattern, function() {
    this.lovi.pipes.pipe(request, request.input);
  }.bind(this), null, true, null);
}

Scheduler.prototype.readConfig = function(config) {
  this._pipe(config.cron, config);
}

module.exports = Scheduler;
