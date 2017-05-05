/**
 *
 */
var Schedule = require('../lib/schedule');
var ScheduleHlper = require('./helpers/scheduleHelper');

describe('Schedule: ', function() {
  'use strict';

  var time1 = ScheduleHlper.convertToTime('1 1 1 1030');
  var time2 = ScheduleHlper.convertToTime('1 1 1 1330');

  it('1030 should satisfy rule for every day, between 1000 - 1100, on day and hour levels of granularity', function() {
    var availableRules = [
      ScheduleHlper.convertToRule('* * * 1000 1100')
    ];
    var schedule = new Schedule(availableRules);

    expect(schedule.check(time1, 'day')).toBe(true);
    expect(schedule.check(time1, 'hour')).toBe(true);
  });

  it('1030 should satisfy rule for every day, between 0900 - 1000, on day-level granularity, but not hour-level', function() {
    var availableRules = [
      ScheduleHlper.convertToRule('* * * 0900 1000')
    ];
    var schedule = new Schedule(availableRules);

    expect(schedule.check(time1, 'day')).toBe(true);
    expect(schedule.check(time1, 'hour')).toBe(false);
  });

  it('1030 and 1330 should both satisfy rule set for every day, between 1000 - 1100, and between 1300 - 1400, on day and hour levels of granularity', function() {
    var availableRules = [
      ScheduleHlper.convertToRule('* * * 1000 1100'),
      ScheduleHlper.convertToRule('* * * 1300 1400')
    ];
    var schedule = new Schedule(availableRules);

    expect(schedule.check(time1, 'day')).toBe(true);
    expect(schedule.check(time1, 'hour')).toBe(true);
    expect(schedule.check(time2, 'hour')).toBe(true);
  });

  it('1030 should satisfy rule set for every day in Jan, between 1000 - 1100, and between 1300 - 1400, on day and hour levels of granularity', function() {
    var availableRules = [
      ScheduleHlper.convertToRule('* 1 * 1000 1100'),
      ScheduleHlper.convertToRule('* 1 * 1300 1400')
    ];
    var schedule = new Schedule(availableRules);

    expect(schedule.check(time1, 'day')).toBe(true);
    expect(schedule.check(time1, 'hour')).toBe(true);
  });

  it('Jan 1 1030 should satisfy rule set for every day in Jan - Mar, between 1000 - 1100, and every day in Mar between 1300 - 1400, on day and hour levels of granularity', function() {
    var availableRules = [
      ScheduleHlper.convertToRule('* 1-3 * 1000 1100'),
      ScheduleHlper.convertToRule('* 3 * 1300 1400')
    ];
    var schedule = new Schedule(availableRules);

    expect(schedule.check(time1, 'day')).toBe(true);
    expect(schedule.check(time1, 'hour')).toBe(true);
  });

  it('Jan 1 1030 should satisfy rule set for every day in Jan and Mar, between 1000 - 1100, and every day in Mar between 1300 - 1400, on day and hour levels of granularity', function() {
    var availableRules = [
      ScheduleHlper.convertToRule('* 1,3 * 1000 1100'),
      ScheduleHlper.convertToRule('* 3 * 1300 1400')
    ];
    var schedule = new Schedule(availableRules);

    expect(schedule.check(time1, 'day')).toBe(true);
    expect(schedule.check(time1, 'hour')).toBe(true);
  });

  it('Jan 1 1030 should satisfy rule set for every day in Jan and Mar, between 0900 - 1000, on day but not hour levels of granularity', function() {
    var availableRules = [
      ScheduleHlper.convertToRule('* 1,3 * 0900 1000')
    ];
    var schedule = new Schedule(availableRules);

    expect(schedule.check(time1, 'day')).toBe(true);
    expect(schedule.check(time1, 'hour')).toBe(false);
  });

  it('Jan 1 1030 should not satisfy rule set for every day in Feb and Mar, between 1000 - 1100, and every day in Mar between 1300 - 1400, on day and hour levels of granularity', function() {
    var availableRules = [
      ScheduleHlper.convertToRule('* 2,3 * 1000 1100'),
      ScheduleHlper.convertToRule('* 3 * 1300 1400')
    ];
    var schedule = new Schedule(availableRules);

    expect(schedule.check(time1, 'day')).toBe(false);
    expect(schedule.check(time1, 'hour')).toBe(false);
  });

  it('Jan 1 1030 should not satisfy rule set for every day in Jan and Mar, between 1000 - 1100, and every day in Mar between 1300 - 1400, but not Jan 1, on day and hour levels of granularity', function() {
    var availableRules = [
      ScheduleHlper.convertToRule('* 1,3 * 1000 1100'),
      ScheduleHlper.convertToRule('* 3 * 1300 1400')
    ];
    var unavailableRules = [
      ScheduleHlper.convertToRule('1 1 * 0000 2359')
    ];
    var schedule = new Schedule(availableRules, unavailableRules);

    expect(schedule.check(time1, 'day')).toBe(false);
    expect(schedule.check(time1, 'hour')).toBe(false);
  });

  it('Jan 1 1030 should satisfy rule set for every day in Jan and Mar, between 1000 - 1100, and every day in Mar between 1300 - 1400, but not Feb 1, on day and hour levels of granularity', function() {
    var availableRules = [
      ScheduleHlper.convertToRule('* 1,3 * 1000 1100'),
      ScheduleHlper.convertToRule('* 3 * 1300 1400')
    ];
    var unavailableRules = [
      ScheduleHlper.convertToRule('1 2 * 0000 2359')
    ];
    var schedule = new Schedule(availableRules, unavailableRules);

    expect(schedule.check(time1, 'day')).toBe(true);
    expect(schedule.check(time1, 'hour')).toBe(true);
  });

  it('Monday Jan 1 1030 should not satisfy rule set for every day between 1000 - 1100, but not weekdays', function() {
    var availableRules = [
      ScheduleHlper.convertToRule('* * * 1000 1100')
    ];
    var unavailableRules = [
      ScheduleHlper.convertToRule('* * 1-5 0000 2359')
    ];
    var schedule = new Schedule(availableRules, unavailableRules);

    expect(schedule.check(time1, 'day')).toBe(false);
    expect(schedule.check(time1, 'hour')).toBe(false);
  });
});
