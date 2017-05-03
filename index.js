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

  var TwilioSMSBot = require('botkit-sms');
  var controller = TwilioSMSBot({
    account_sid: 'ACa1acd415af1b8f899c89a22cf672e1b3',
    auth_token: '5a7ea9a9fa095f42407c472cc2637e1d',
    twilio_number: '+15873168074'
  });

  var bot = controller.spawn({});

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

  // app.post('/sms', function(req, res) {
  //   var twilio = require('twilio');
  //   var twiml = new twilio.TwimlResponse();
  //   twiml.message('Hello from Node!');
  //   res.writeHead(200, {'Content-Type': 'text/xml'});
  //   res.end(twiml.toString());
  // });
  controller.createWebhookEndpoints(controller.webserver, bot, function() {
    console.log('Bot is online!');
  });

  controller.hears(['hello'], 'message_received', function(bot, message) {
    bot.reply(message, 'Hello from Node!');
  });
}());
