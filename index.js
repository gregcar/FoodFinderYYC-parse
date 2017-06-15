(function() {
  "use strict";

  var express = require('express');
  var ParseServer = require('parse-server').ParseServer;
  var ParseDashboard = require('parse-dashboard');

  var config = {
    "appId": process.env.PARSE_SERVER_APPID,
    "databaseURI": process.env.PARSE_SERVER_DATABASEURI,
    "masterKey": process.env.PARSE_SERVER_MASTERKEY,
    "clientKey": process.env.PARSE_SERVER_CLIENTKEY,
    "javascriptKey": process.env.PARSE_SERVER_JAVASCRIPTKEY,
    "restAPIKey": process.env.PARSE_SERVER_RESTAPIKEY,
    "fileKey": process.env.PARSE_SERVER_FILEKEY,
    "serverURL": process.env.PARSE_SERVER_SERVERURL,
    "port": process.env.PARSE_SERVER_PORT,
    "appName": process.env.PARSE_SERVER_APPNAME,
    "mountPath": process.env.PARSE_SERVER_MOUNTPATH,
    "cloud": process.env.PARSE_SERVER_CLOUD,
    "logLevel": process.env.PARSE_SERVER_LOGLEVEL
  };

  var dashboardConfig = {
    "apps": [
      {
        "appName": process.env.PARSE_DASHBOARD_APPS_0_APPNAME,
        "serverURL": process.env.PARSE_DASHBOARD_APPS_0_SERVERURL,
        "appId": process.env.PARSE_DASHBOARD_APPS_0_APPID,
        "masterKey": process.env.PARSE_DASHBOARD_APPS_0_MASTERKEY,
        "javascriptKey": process.env.PARSE_DASHBOARD_APPS_0_JAVASCRIPTKEY,
        "production": process.env.PARSE_DASHBOARD_APPS_0_PRODUCTION
      }
    ],
    "trustProxy": process.env.PARSE_DASHBOARD_TRUSTPROXY,
    "users": [{
      "user": process.env.PARSE_DASHBOARD_USERS_0_USER,
      "pass": process.env.PARSE_DASHBOARD_USERS_0_PASS
    }]
  };

  console.log(dashboardConfig);

  var port = process.env.PORT || 8080;
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
