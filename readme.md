Food Finder YYC Parse Server
===

[![Codeship Status for madebyuppercut/FoodFinderYYC-parse](https://app.codeship.com/projects/2a2aabe0-344a-0135-dc89-2213fdb1c191/status?branch=dev)](https://app.codeship.com/projects/226812)

Prerequisites
---

1. NodeJS
1. NPM

Installation and Start Up Server
---

1. Check out this repository
1. Create a file `.env` in this project's root, the structure is combination of Parse Server and Parse Dasbhoard config (see next section for an example)
1. Run `npm install`. This should resolve all package dependencies
1. Run `npm start`
1. Open [http://localhost:8081/parse](http://localhost:8081/parse) in a browser, if you see an unauthorized messge, it's ready to go
1. Open [http://localhost:8081/dashboard](http://localhost:8081/dashboard) to see the Parse Dashboard in action. Password is located in `config/dashboard-config.json`

Sample .env
---
```
{
  "port": 8081,
  "parse": {
    "server": {
      "appId": "XXXXXXXX",
      "databaseURI": "[mongoDB URI]",
      "masterKey": "XXXXXXXX",
      "clientKey": "XXXXXXXX",
      "javascriptKey": "XXXXXXXX",
      "restAPIKey": "XXXXXXXX",
      "fileKey": "XXXXXXXX",
      "serverURL": "http://localhost:8081/parse/",
      "appName": "Food Finder YYC Parse Server",
      "mountPath": "/parse",
      "cloud": "./cloud/main.js",
      "logLevel": "info"
    },
    "dashboard": {
      "apps": [
        {
          "appName": "Find Finder YYC Development",
          "serverURL": "[Food Finder YYC Parse URL]",
          "appId": "XXXXXXXX",
          "masterKey": "XXXXXXXX",
          "javascriptKey": "XXXXXXXX",
          "production": false
        }
      ],
      "trustProxy": 1,
      "users": [
        {
          "user": "admin",
          "pass": "[password]"
        }
      ],
      "useEncryptedPasswords": false
    }
  }
}
```

Development
---
1. There are 2 main branches: `master` and `dev`, create additional branches as necessary
1. All features should have a corresponding set of unit tests located under `/cloud/spec`
1. Separate out functionality into its own testable library, cloud code would simply be using these libraries
1. Run `npm test` after implementation, this would run the Jasmine unit tests

Deployment
---
1. Simply push to either `master` or `dev` would trigger a build on CodeShip
1. If the build was successful, CodeShip would deploy to the corresponding environment

Search
---
After initialize Parse client, search can be done by invoking the `search` cloud code. All searches are based on:

- `date`: GMT formatted string of the date to look for
- `dateTimeNow`: GMT formatted string of the date now
- `meals`: An array of meals to search for. Valid values are `lunch`, `snacks`, `dinner`, and `hamper`
- `noIdNorReferral`: When set to true, filter out locations that would require an ID or a referral
- `geolocation`: Geolocation, must be in `{latitude, longitude}` format
- `distance`: Combined with geolocation, return the locations within the distance, in KM

The response would be an array, which contains 3 keys: `day`, `now`, and `object`, where:

- `day`: This contains availability information for the day (of the query), as well as times that it's open
- `now`: This contains availability information for right now (of the query), as well as times that it's open
- `object`: The Parse object for the location

**Note:** ```date``` needs to be present in order to determine if a location is open on that day, if ```dateTimeNow``` is present it'd also determine if it's open right now  

Here are some of the examples of different combinations:

**Search for dinner**

```
Parse.Cloud.run('search', {
  meals: ['dinner']
});
```

**Search for snacks, right now, that requires no ID or referrals**

```
Parse.Cloud.run('search', {
  date: (new Date()).toString(),
  dateTimeNow: (new Date()).toString(),
  meals: ['snacks'],
  noIdNorReferral: true
});
```

**Search within 5KM of current location, for dinner or snacks, on August 1, 2017**

```
Parse.Cloud.run('search', {
  date: 'Tue Aug 01 2017 16:38:15 GMT-0600 (MDT)',
  dateTimeNow: 'Fri May 05 2017 16:42:17 GMT-0600 (MDT)',
  meals: ['dinner', 'snacks'],
  distance: 5,
  geolocation: {latitude: 51.055918, longitude: -114.100615}
});
```
