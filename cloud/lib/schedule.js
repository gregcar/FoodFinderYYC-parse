/**
 * Schedule class
 *
 * This class provides tools around schedule checking.
 *
 */
(function(module) {
  'use strict';

  function Schedule(availableRules, unavailableRules) {
    this._availableRules = availableRules || [] ;
    this._unavailableRules = unavailableRules || [];
  }

  /**
   * Given an expression ('x', 'x,y,z', 'x-z'), check if a value is in range
   * @param expression
   * @param value
   * @returns {boolean}
   * @private
   */
  function _checkRange(expression, value) {
    var expressionArray = [];
    var checkType;
    var match = false;

    if (expression.indexOf(',') > -1 && expression.indexOf('-') > -1) {
      throw 'rule format error';
    }

    if (expression.indexOf(',') === -1 && expression.indexOf('-') === -1) {
      expressionArray = [parseInt(expression)];
      checkType = 'single';
    } else if (expression.indexOf(',') > -1) {
      expressionArray = expression.split(',');
      checkType = 'multi';
    } else if (expression.indexOf('-') > -1) {
      expressionArray = expression.split('-');
      checkType = 'range';
    } else if (expression === '*') {
      match = true;
    }

    switch (checkType) {
      case 'single':
        match = expressionArray[0] === value;
        break;
      case 'multi':
        match = expressionArray.find(function(thisValue) { return parseInt(thisValue) === value; });
        break;
      case 'range':
        match = parseInt(expressionArray[0]) <= value && parseInt(expressionArray[1]) >= value;
        break;
    }

    return match;
  }

  /**
   * Given a time to check against, return true if time satisfies the rule for the granularity level
   * @param rule
   * @param dateTime
   * @param granularity
   * @param ignoreTime
   * @returns {boolean}
   * @private
   */
  function _checkRule(rule, dateTime, granularity, ignoreTime = false) {
    var match = false;
    var startTime = rule.startTime;
    var endTime = rule.endTime;
    var time = dateTime.time;

    if (rule.weekDay === '*' && rule.month === '*' && rule.monthDay === '*') {
      match = true;
    } else {
      if (rule.month !== '*') {
        match = _checkRange(rule.month, dateTime.month);
      } else if (rule.month === '*') {
        match = true;
      }

      if (match && rule.monthDay !== '*') {
        match = _checkRange(rule.monthDay, dateTime.monthDay);
      }

      if (match && rule.weekDay !== '*') {
        match = _checkRange(rule.weekDay, dateTime.weekDay);
      }
    }

    // if matched, and rule has start and end times
    if (match && startTime && endTime) {
      // apply hour check
      if (granularity === 'hour') {
        match = startTime < time && time < endTime;
      }
      // but return match is false when ignoring time (used for day-check against a closure-rule
      if (ignoreTime) {
        match = false;
      }
    }

    return match;
  }

  /**
   * Given a time to check against, return true if time satisfies the rule set for a schedule (dependds on grandularity)
   * e.g.:
   * @param {object} time {monthDay: Number, month: Number, weekDay: Number, hour: Number, min: Number}
   * @param {String} granularity
   * @returns {boolean}
   * @private
   */
  function _check(time, granularity) {
    var isAvailable = false;
    var times = [];

    this._availableRules.forEach(function(rule) {
      // Only set to true if a rule applies
      if (_checkRule(rule, time, granularity)) {
        isAvailable = true;
        times.push({start: rule.startTime, end: rule.endTime});
      }
    });

    if (isAvailable) {
      this._unavailableRules.forEach(function(rule) {
        // Only set to false if a rule applies, if it's not a hour-check, ignore time check
        if (_checkRule(rule, time, granularity, granularity !== 'hour')) {
          isAvailable = false;
        }
      });
    }

    return {isAvailable: isAvailable, times: times};
  }

  Schedule.prototype = {
    check: _check
  };

  /**
   * Public methods
   */

  module.exports = Schedule;
}(module));
