(function(module) {
  'use strict';

  function _convertToRule(ruleString) {
    var ruleArray = ruleString.split(' ');
    var rule = {};

    if (ruleArray.length !== 5) {
      throw "invalid rule string format!";
    } else {
      rule = {
        monthDay: ruleArray[0],
        month: ruleArray[1],
        weekDay: ruleArray[2],
        startTime: ruleArray[3] === 'null' ? null : parseInt(ruleArray[3]),
        endTime: ruleArray[4] === 'null' ? null : parseInt(ruleArray[4])
      };
    }

    return rule;
  }

  function _convertToTime(timeString) {
    var timeArray = timeString.split(' ');
    var time = {};

    if (timeArray.length !== 4) {
      throw "invalid rule string format!";
    } else {
      time = {
        monthDay: parseInt(timeArray[0]),
        month: parseInt(timeArray[1]),
        weekDay: parseInt(timeArray[2]),
        time: parseInt(timeArray[3])
      };
    }

    return time;
  }

  module.exports = {
    convertToRule: _convertToRule,
    convertToTime: _convertToTime
  };
}(module));
