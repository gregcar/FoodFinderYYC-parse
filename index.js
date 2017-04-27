(function() {
  "use strict";

  var express = require('express');
  var ParseServer = require('parse-server').ParseServer;
  var ParseDashboard = require('parse-dashboard');

  var config = require('./config/config-' + process.env.NODE_ENV + '.json');
  var dashboardConfig = require('./config/dashboard-config.json');
  var port = process.env.PORT || config.port || 8080;
  var app = express();

  var api = new ParseServer(config);
  var dashboard = new ParseDashboard(dashboardConfig);

  app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'accept, content-type, x-parse-application-id, x-parse-rest-api-key, x-parse-session-token, x-parse-javascript-key');
    // intercept OPTIONS method
    if ('OPTIONS' === req.method) {
      res.send(200);
    }
    else {
      next();
    }
  });

// Serve the Parse API on the /parse URL prefix
  app.use('/parse', api);
  app.use('/dashboard', dashboard);

  app.listen(port, function() {
    console.log('Running ' + config.appName + ' on port: ' + port);
  });
}());
