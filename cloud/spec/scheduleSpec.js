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

    expect(schedule.check(time1, 'day').isAvailable).toBe(true);
    expect(schedule.check(time1, 'day').times[0]).toEqual({start: 1000, end: 1100});
    expect(schedule.check(time1, 'hour').isAvailable).toBe(true);
    expect(schedule.check(time1, 'hour').times[0]).toEqual({start: 1000, end: 1100});
  });

  it('1030 should satisfy rule for every day, between 0900 - 1000, on day-level granularity, but not hour-level', function() {
    var availableRules = [
      ScheduleHlper.convertToRule('* * * 0900 1000')
    ];
    var schedule = new Schedule(availableRules);

    expect(schedule.check(time1, 'day').isAvailable).toBe(true);
    expect(schedule.check(time1, 'day').times[0]).toEqual({start: 900, end: 1000});
    expect(schedule.check(time1, 'hour').isAvailable).toBe(false);
    expect(schedule.check(time1, 'hour').times.length).toBe(0);
  });

  it('1030 and 1330 should both satisfy rule set for every day, between 1000 - 1100, and between 1300 - 1400, on day and hour levels of granularity', function() {
    var availableRules = [
      ScheduleHlper.convertToRule('* * * 1000 1100'),
      ScheduleHlper.convertToRule('* * * 1300 1400')
    ];
    var schedule = new Schedule(availableRules);

    expect(schedule.check(time1, 'day').isAvailable).toBe(true);
    expect(schedule.check(time1, 'day').times[0]).toEqual({start: 1000, end: 1100});
    expect(schedule.check(time1, 'day').times[1]).toEqual({start: 1300, end: 1400});

    expect(schedule.check(time1, 'hour').isAvailable).toBe(true);
    expect(schedule.check(time1, 'hour').times[0]).toEqual({start: 1000, end: 1100});

    expect(schedule.check(time2, 'hour').isAvailable).toBe(true);
    expect(schedule.check(time2, 'hour').times[0]).toEqual({start: 1300, end: 1400});
  });

  it('1030 should satisfy rule set for every day in Jan, between 1000 - 1100, and between 1300 - 1400, on day and hour levels of granularity', function() {
    var availableRules = [
      ScheduleHlper.convertToRule('* 1 * 1000 1100'),
      ScheduleHlper.convertToRule('* 1 * 1300 1400')
    ];
    var schedule = new Schedule(availableRules);

    expect(schedule.check(time1, 'day').isAvailable).toBe(true);
    expect(schedule.check(time1, 'day').times[0]).toEqual({start: 1000, end: 1100});
    expect(schedule.check(time1, 'hour').isAvailable).toBe(true);
    expect(schedule.check(time1, 'hour').times[0]).toEqual({start: 1000, end: 1100});
  });

  it('Jan 1 1030 should satisfy rule set for every day in Jan - Mar, between 1000 - 1100, and every day in Mar between 1300 - 1400, on day and hour levels of granularity', function() {
    var availableRules = [
      ScheduleHlper.convertToRule('* 1-3 * 1000 1100'),
      ScheduleHlper.convertToRule('* 3 * 1300 1400')
    ];
    var schedule = new Schedule(availableRules);

    expect(schedule.check(time1, 'day').isAvailable).toBe(true);
    expect(schedule.check(time1, 'day').times[0]).toEqual({start: 1000, end: 1100});
    expect(schedule.check(time1, 'hour').isAvailable).toBe(true);
    expect(schedule.check(time1, 'hour').times[0]).toEqual({start: 1000, end: 1100});
  });

  it('Jan 1 1030 should satisfy rule set for every day in Jan and Mar, between 1000 - 1100, and every day in Mar between 1300 - 1400, on day and hour levels of granularity', function() {
    var availableRules = [
      ScheduleHlper.convertToRule('* 1,3 * 1000 1100'),
      ScheduleHlper.convertToRule('* 3 * 1300 1400')
    ];
    var schedule = new Schedule(availableRules);

    expect(schedule.check(time1, 'day').isAvailable).toBe(true);
    expect(schedule.check(time1, 'day').times[0]).toEqual({start: 1000, end: 1100});
    expect(schedule.check(time1, 'hour').isAvailable).toBe(true);
    expect(schedule.check(time1, 'hour').times[0]).toEqual({start: 1000, end: 1100});
  });

  it('Jan 1 1030 should satisfy rule set for every day in Jan and Mar, between 0900 - 1000, on day but not hour levels of granularity', function() {
    var availableRules = [
      ScheduleHlper.convertToRule('* 1,3 * 0900 1000')
    ];
    var schedule = new Schedule(availableRules);

    expect(schedule.check(time1, 'day').isAvailable).toBe(true);
    expect(schedule.check(time1, 'day').times[0]).toEqual({start: 900, end: 1000});
    expect(schedule.check(time1, 'hour').isAvailable).toBe(false);
    expect(schedule.check(time1, 'hour').times.length).toBe(0);
  });

  it('Jan 1 1030 should not satisfy rule set for every day in Feb and Mar, between 1000 - 1100, and every day in Mar between 1300 - 1400, on day and hour levels of granularity', function() {
    var availableRules = [
      ScheduleHlper.convertToRule('* 2,3 * 1000 1100'),
      ScheduleHlper.convertToRule('* 3 * 1300 1400')
    ];
    var schedule = new Schedule(availableRules);

    expect(schedule.check(time1, 'day').isAvailable).toBe(false);
    expect(schedule.check(time1, 'day').times.length).toBe(0);
    expect(schedule.check(time1, 'hour').isAvailable).toBe(false);
    expect(schedule.check(time1, 'hour').times.length).toBe(0);
  });

  it('Jan 1 1030 should not satisfy rule set for every day in Jan and Mar, between 1000 - 1100, and every day in Mar between 1300 - 1400, but not Jan 1, on day and hour levels of granularity', function() {
    var availableRules = [
      ScheduleHlper.convertToRule('* 1,3 * 1000 1100'),
      ScheduleHlper.convertToRule('* 3 * 1300 1400')
    ];
    var unavailableRules = [
      ScheduleHlper.convertToRule('1 1 * null null')
    ];
    var schedule = new Schedule(availableRules, unavailableRules);

    expect(schedule.check(time1, 'day').isAvailable).toBe(false);
    expect(schedule.check(time1, 'day').times.length).toBe(0);
    expect(schedule.check(time1, 'hour').isAvailable).toBe(false);
    expect(schedule.check(time1, 'hour').times.length).toBe(0);
  });

  it('Jan 1 1030 should satisfy rule set for every day in Jan and Mar, between 1000 - 1100, and every day in Mar between 1300 - 1400, but not Feb 1, on day and hour levels of granularity', function() {
    var availableRules = [
      ScheduleHlper.convertToRule('* 1,3 * 1000 1100'),
      ScheduleHlper.convertToRule('* 3 * 1300 1400')
    ];
    var unavailableRules = [
      ScheduleHlper.convertToRule('1 2 * null null')
    ];
    var schedule = new Schedule(availableRules, unavailableRules);

    expect(schedule.check(time1, 'day').isAvailable).toBe(true);
    expect(schedule.check(time1, 'day').times[0]).toEqual({start: 1000, end: 1100});
    expect(schedule.check(time1, 'day').times.length).toBe(1);
    expect(schedule.check(time1, 'hour').isAvailable).toBe(true);
  });

  it('Monday Jan 1 1030 should not satisfy rule set for every day between 1000 - 1100, but not weekdays', function() {
    var availableRules = [
      ScheduleHlper.convertToRule('* * * 1000 1100')
    ];
    var unavailableRules = [
      ScheduleHlper.convertToRule('* * 1-5 null null')
    ];
    var schedule = new Schedule(availableRules, unavailableRules);

    expect(schedule.check(time1, 'day').isAvailable).toBe(false);
    expect(schedule.check(time1, 'day').times.length).toBe(0);
    expect(schedule.check(time1, 'hour').isAvailable).toBe(false);
    expect(schedule.check(time1, 'hour').times.length).toBe(0);
  });

  it('Monday Jan 1 1030 should satisfy rule set for every day between 0900 - 1200, and closing weekdays between 1000 - 1100 on day check, but not hour check', function() {
    var availableRules = [
      ScheduleHlper.convertToRule('* * * 0900 1200')
    ];
    var unavailableRules = [
      ScheduleHlper.convertToRule('* * 1-5 1000 1100')
    ];
    var schedule = new Schedule(availableRules, unavailableRules);

    expect(schedule.check(time1, 'day').isAvailable).toBe(true);
    expect(schedule.check(time1, 'day').times[0]).toEqual({start: 900, end: 1200});
    expect(schedule.check(time1, 'hour').isAvailable).toBe(false);
    expect(schedule.check(time1, 'hour').times.length).toBe(0);
  });
});
