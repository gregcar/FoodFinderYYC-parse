Food Finder YYC Parse Server
===

![CodeShip status](https://app.codeship.com/projects/6bd77660-11aa-0135-e1c8-1a42010d9d06/status)

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
1. Open [http://localhost:8080/parse](http://localhost:8080/parse) in a browser, if you see an unauthorized messge, it's ready to go
1. Open [http://localhost:8080/dashboard](http://localhost:8080/dashboard) to see the Parse Dashboard in action. Password is located in `config/dashboard-config.json`

Sample .env
---
```
{
  "port": 8080,
  "parse": {
    "server": {
      "appId": "XXXXXXXX",
      "databaseURI": "[mongoDB URI]",
      "masterKey": "XXXXXXXX",
      "clientKey": "XXXXXXXX",
      "javascriptKey": "XXXXXXXX",
      "restAPIKey": "XXXXXXXX",
      "fileKey": "XXXXXXXX",
      "serverURL": "http://localhost:8080/parse/",
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
