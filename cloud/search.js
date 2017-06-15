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
    var startTime = time.get('startTime') ? new Date(time.get('startTime')) : null;
    var endTime = time.get('endTime') ? new Date(time.get('endTime')) : null;

    return {
      monthDay: time.get('monthDay'),
      month: time.get('month'),
      weekDay: time.get('weekDay'),
      startTime: startTime ? (startTime.getUTCHours() * 100 + startTime.getUTCMinutes()) : null,
      endTime: endTime ? (endTime.getUTCHours() * 100 + endTime.getUTCMinutes()) : null
    }
  }

  function _convertDate(date) {
    return {
      monthDay: date.getDate(),
      month: date.getMonth() + 1,
      weekDay: date.getDay() === 0 ? 7 : date.getDay(),     // Make Sunday = 7
      time: date.getHours() * 100 + date.getMinutes()
    }
  }

  /**
   * Given a location's list of open and closed times, and query date (and time), return if it's available for the date, as well as date/time now
   * @param closedTimes
   * @param openTimes
   * @param date
   * @param dateTimeNow
   * @private
   */
  function _checkLocationSchedule(openTimes, closedTimes, date, dateTimeNow) {
    var openRules = openTimes.map(_convertTimeToRule);
    var closedRules = closedTimes.map(_convertTimeToRule);
    var schedule = new Schedule(openRules, closedRules);

    return {
      day: schedule.check(_convertDate(date), 'day'),
      now: dateTimeNow ? schedule.check(_convertDate(dateTimeNow), 'hour') : {isAvailable: false, times: []}
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
            function(openTimes, closedTimes) {
              var check = _checkLocationSchedule(openTimes, closedTimes, searchParams.date, searchParams.dateTimeNow);
              if (check.day.isAvailable) {
                return {object: location, day: check.day, now: check.now};
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
          if (searchParams.date) {
            return _checkLocationsSchedule(searchParams, locations);
          } else {
            return locations.map(function(location) {
              return {object: location, available: {day: true, now: false}};
            });
          }
        }
      ).then(
        function(locations) {
          // filter out the null results
          return locations.filter(function(location) {
            if (location) {
              return location;
            }
          });
        }
      );
  }

  Parse.Cloud.define("search", function(request, response) {
    var searchParams = {
      date: request.params.date ? new Date(request.params.date) : null,
      dateTimeNow: request.params.dateTimeNow ? new Date(request.params.dateTimeNow) : null,
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
