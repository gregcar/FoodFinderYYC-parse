(function(module) {
  'use strict';

  function _convertToRule(ruleString) {
    var ruleArray = ruleString.split(' ');
    var rule = {};

    if (ruleArray.length !== 7) {
      throw "invalid rule string format!";
    } else {
      rule = {
        monthDay: ruleArray[0],
        month: ruleArray[1],
        weekDay: ruleArray[2],
        startHour: parseInt(ruleArray[3]),
        startMin: parseInt(ruleArray[4]),
        endHour: parseInt(ruleArray[5]),
        endMin: parseInt(ruleArray[6])
      };
    }

    return rule;
  }

  function _convertToTime(timeString) {
    var timeArray = timeString.split(' ');
    var time = {};

    if (timeArray.length !== 5) {
      throw "invalid rule string format!";
    } else {
      time = {
        monthDay: parseInt(timeArray[0]),
        month: parseInt(timeArray[1]),
        weekDay: parseInt(timeArray[2]),
        hour: parseInt(timeArray[3]),
        min: parseInt(timeArray[4])
      };
    }

    return time;
  }

  module.exports = {
    convertToRule: _convertToRule,
    convertToTime: _convertToTime
  };
}(module));
