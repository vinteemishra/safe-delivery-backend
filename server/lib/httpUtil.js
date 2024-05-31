var http = require('http');

export const httpRequest = (options) => {    
    return new Promise((resolve, reject) => {
        var req = http.request(options, (res) => {
            if (res.statusCode < 200 || res.statusCode >= 300) {
                reject(new Error('statusCode=' + res.statusCode));
            }
            var result = [];
            res.on('data', (chunk) => { result.push(chunk); });
            res.on('end', () => resolve(Buffer.concat(result)));
        });
        req.on('error', function (err) {
            reject(err);
        });
        req.end()
    });
};

export const httpRequestPost = (options, data) => {
    
    return new Promise((resolve, reject) => {
        const dataJson = JSON.stringify(data);
        
        const optionsInner = {
            ...options,
            method: "POST",
            headers: {
                ...(options.headers || {}),
                "Content-Type": "application/json",
                // "Content-Length": dataJson.length, //This is chaching when some foriegn country text is sent to it!
                "Content-Length": Buffer.byteLength(dataJson),
            }
        }
        const req = http.request(optionsInner, (res) => {
            var result = [];
            res.on('data', (chunk) => { result.push(chunk); });
            res.on('end', () => resolve(Buffer.concat(result)));
        });

        req.on('error', (error) => {
            reject(error)
        })

        req.write(dataJson)
        req.end();
    });
}

export function isDifferent(x,y) {
    return !isEqual(x,y);
}

export function isEqual (x, y) {
    
    var i, l, leftChain, rightChain;
  
    function compare2Objects (x, y) {
      var p;
  
      // remember that NaN === NaN returns false
      // and isNaN(undefined) returns true
      if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
           return true;
      }
  
      // Compare primitives and functions.     
      // Check if both arguments link to the same object.
      // Especially useful on the step where we compare prototypes
      if (x === y) {
          return true;
      }
  
      // Works in case when functions are created in constructor.
      // Comparing dates is a common scenario. Another built-ins?
      // We can even handle functions passed across iframes
      if ((typeof x === 'function' && typeof y === 'function') ||
         (x instanceof Date && y instanceof Date) ||
         (x instanceof RegExp && y instanceof RegExp) ||
         (x instanceof String && y instanceof String) ||
         (x instanceof Number && y instanceof Number)) {
          return x.toString() === y.toString();
      }
  
      // At last checking prototypes as good as we can
      if (!(x instanceof Object && y instanceof Object)) {
          return false;
      }
  
      if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
          return false;
      }
  
      if (x.constructor !== y.constructor) {
          return false;
      }
  
      if (x.prototype !== y.prototype) {
          return false;
      }
  
      // Check for infinitive linking loops
      if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
           return false;
      }
  
      // Quick checking of one object being a subset of another.
      // todo: cache the structure of arguments[0] for performance
      for (p in y) {
          if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
              return false;
          }
          else if (typeof y[p] !== typeof x[p]) {
              return false;
          }
      }
  
      for (p in x) {
          if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
              return false;
          }
          else if (typeof y[p] !== typeof x[p]) {
              return false;
          }
  
          switch (typeof (x[p])) {
              case 'object':
              case 'function':
  
                  leftChain.push(x);
                  rightChain.push(y);
  
                  if (!compare2Objects (x[p], y[p])) {
                      return false;
                  }
  
                  leftChain.pop();
                  rightChain.pop();
                  break;
  
              default:
                  if (x[p] !== y[p]) {
                      return false;
                  }
                  break;
          }
      }
  
      return true;
    }
  
    if (arguments.length < 1) {
      return true; //Die silently? Don't know how to handle such case, please help...
      // throw "Need two or more arguments to compare";
    }
  
    for (i = 1, l = arguments.length; i < l; i++) {
  
        leftChain = []; //Todo: this can be cached
        rightChain = [];
  
        if (!compare2Objects(arguments[0], arguments[i])) {
            return false;
        }
    }
  
    return true;
  }