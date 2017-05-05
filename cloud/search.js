(function(module) {
  "use strict";

  var Schedule = require('./lib/schedule');

  /**
   * From search params, retreive the locations that offer the meal type(s), and/or within distance
   * @param searchParams
   * @returns {Promise}
   * @private
   */
  function _findLocations(searchParams) {
    var queries = [];
    var mainQuery = new Parse.Query('Location');
    var mealsQuery = null;

    // If user has no ID or referral, skip all the locations that requires those
    if (typeof searchParams.noIdNorReferral !== 'undefined' && searchParams.noIdNorReferral === true) {
      mainQuery.notEqualTo('requiresIdOrReferral', true);
    }

    // Location-based query
    if (searchParams.distance && searchParams.geolocation) {
      var geoPoint = new Parse.GeoPoint(searchParams.geolocation.latitude, searchParams.geolocation.longitude);

      mainQuery.withinKilometers('geolocation', geoPoint, searchParams.distance);
    }

    // Building queries based on meals
    if (searchParams.meals) {
      queries = searchParams.meals.map(function(meal) {
        var query = new Parse.Query('Location');

        query.equalTo('meals', meal);

        return query;
      });

      // Build a single or-query, apply restriction on main query (this works around the geolocation constraint on a or-query)
      mealsQuery = Parse.Query.or.apply(null, queries);
      mainQuery.matchesKeyInQuery('objectId', 'objectId', mealsQuery);
    }

    return mainQuery.find();
  }

  function _convertTimeToRule(time) {
    return {
      monthDay: time.get('monthDay'),
      month: time.get('month'),
      weekDay: time.get('weekDay'),
      startTime: parseInt(time.get('startTime')),
      endTime: parseInt(time.get('endTime'))
    }
  }

  function _convertDate(date, time) {
    return {
      monthDay: date.monthDay,
      month: date.month,
      weekDay: date.weekDay,
      time: time
    }
  }

  /**
   * Given a location's list of open and closed times, and query date (and time), return if it's available for the date, as well as date/time now
   * @param closedTimes
   * @param openTimes
   * @param date
   * @param dateNow
   * @param timeNow
   * @private
   */
  function _checkLocationSchedule(openTimes, closedTimes, date, dateNow, timeNow) {
    var openRules = openTimes.map(_convertTimeToRule);
    var closedRules = closedTimes.map(_convertTimeToRule);
    var schedule = new Schedule(openRules, closedRules);

    return {
      day: schedule.check(_convertDate(date, "0000"), 'day'),
      now: schedule.check(_convertDate(dateNow, timeNow), 'hour')
    };
  }

  /**
   * Given a list of pre-filtered locations, check the schedules and return locations that are available for given date
   * @param searchParams
   * @param locations
   * @returns {*}
   * @private
   */
  function _checkLocationsSchedule(searchParams, locations) {
    var promises = [];
    locations.forEach(function(location) {
      var schedules = location.relation('schedules');
      var isOpen = schedules.query().equalTo('isEnabled', true).notEqualTo('isClosed', true);
      var isClosed = schedules.query().equalTo('isEnabled', true).equalTo('isClosed', true);

      promises.push(
        Parse.Promise.when(isOpen.find(), isClosed.find())
          .then(
            function(closedTimes, openTimes) {
              var check = _checkLocationSchedule(openTimes, closedTimes, searchParams.date, searchParams.dateNow, searchParams.timeNow);
              if (check.day) {
                return {object: location, available: check};
              } else {
                return null;
              }
            }
          )
      );
    });

    return Parse.Promise.when(promises);
  }

  function _search(searchParams) {
    return _findLocations(searchParams)
      .then(
        function(locations) {
          return _checkLocationsSchedule(searchParams, locations);
        }
      ).then(
        function(locations) {
          return locations;
        }
      );
  }

  Parse.Cloud.define("search", function(request, response) {
    var searchParams = {
      date: request.params.date,
      dateNow: request.params.dateNow,
      timeNow: request.params.timeNow,
      meals: request.params.meals,
      distance: request.params.distance,
      geolocation: request.params.geolocation,
      noIdNorReferral: request.params.noIdNorReferral
    };

    _search(searchParams)
      .then(
        function(locations) {
          response.success(locations);
        },
        function(error) {
          response.error(error);
        }
      );
  });

  module.exports = {};
}(module));
