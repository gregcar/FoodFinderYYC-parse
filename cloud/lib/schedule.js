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
    var check = false;

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
    }

    switch (checkType) {
      case 'single':
        check = expressionArray[0] === value;
        break;
      case 'multi':
        check = expressionArray.find(function(thisValue) { return parseInt(thisValue) === value; });
        break;
      case 'range':
        check = parseInt(expressionArray[0]) <= value && parseInt(expressionArray[1]) >= value;
        break;
    }

    return check;
  }

  /**
   * Given a time to check against, return true if time satisfies the rule for the granularity level
   * @param rule
   * @param dateTime
   * @param granularity
   * @returns {boolean}
   * @private
   */
  function _checkRule(rule, dateTime, granularity) {
    var isAvailable = false;
    var startTime = rule.startHour * 100 + rule.startMin;
    var endTime = rule.endHour * 100 + rule.endMin;
    var time = dateTime.hour * 100 + dateTime.min;

    if (rule.weekDay === '*' && rule.month === '*' && rule.monthDay === '*') {
      isAvailable = true;
    } else {
      if (rule.month !== '*') {
        isAvailable = _checkRange(rule.month, dateTime.month);
      }

      if (isAvailable && rule.monthDay !== '*') {
        isAvailable = _checkRange(rule.monthDay, dateTime.monthDay);
      }

      if (isAvailable && rule.weekDay !== '*') {
        isAvailable = _checkRange(rule.weekDay, dateTime.weekDay);
      }
    }

    if (isAvailable && granularity !== 'day') {
      isAvailable = startTime < time && time < endTime;
    }

    return isAvailable;
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

    this._availableRules.forEach(function(rule) {
      // Only set to true if a rule applies
      if (_checkRule(rule, time, granularity)) {
        isAvailable = true;
      }
    });

    if (isAvailable) {
      this._unavailableRules.forEach(function(rule) {
        // Only set to false if a rule applies
        if (_checkRule(rule, time, granularity)) {
          isAvailable = false;
        }
      });
    }

    return isAvailable;
  }

  Schedule.prototype = {
    check: _check
  };

  /**
   * Public methods
   */

  module.exports = Schedule;
}(module));
