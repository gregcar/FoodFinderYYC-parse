Food Finder YYC Parse Server
===

Prerequisites 
---

1. NodeJS
1. NPM

Installation and Start Up Server
---

1. Check out this repository
1. Set your `NODE_ENV` to `local`. This would determine which configuration file to load
1. Run `npm install`. This should resolve all package dependencies
1. Run `node index.js`
1. Open [http://localhost:8080/parse](http://localhost:8080/parse) in a browser, if you see an unauthorized messge, it's ready to go
1. Open [http://localhost:8080/dashboard](http://localhost:8080/dashboard) to see the Parse Dashboard in action. Password is located in `config/dashboard-config.json`
