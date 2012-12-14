(function(root, factory) {
    'use strict';
    var AssertionError = function(options){
        this.message = options.message;
    };
    AssertionError.prototype = Error.prototype;
    AssertionError.prototype.toString = function(){
        return this.message;
    };
    // Set up Backbone appropriately for the environment.
    if (typeof exports !== 'undefined') {
        // Node/CommonJS, no need for jQuery in that case.
        factory(global, require('assert').AssertionError);
    } else if (typeof window.define === 'function' && window.define.amd) {
        // AMD
        window.define('expect', [], function() {
            factory(root, AssertionError);
        });
    } else {
        // Browser globals
        factory(root, AssertionError);
    }
})(this, function(root, AssertionError) {
    'use strict';
    var assertions = {
            pass: function(message){
            },
            fail: function(message){
                throw new AssertionError({message: message});
            }
        };

    function formatValue(value, ignoreUndefined, stack){
        stack = stack || [];

        if(typeof value === 'undefined'){
            return ignoreUndefined ? '' : 'undefined';
        }
        if(typeof value === 'function'){
            return 'function ' + value.name + '(){}';
        }
        if(typeof value === 'string'){
            return '"' + value + '"';
        }
        if(value === null){
            return 'null';
        }
        if(value instanceof Date){
            return value.toString();
        }
        if(value instanceof RegExp){
            return value.toString();
        }
        if(value instanceof Array){
            var mapped = [];
            for(var i = 0; i < value.length; i++){
                mapped.push(formatValue(value[i], false));
            }
            return '[' + mapped.join(', ') + ']';
        }
        if(value.nodeType == 1){
            return '<' + value.nodeName.toLowerCase() + ' />';
        }

        if(typeof value === 'object' && stack.indexOf(value) === -1 && stack.length < 5){
            if(value.toString() !== '[object Object]'){
                if(value instanceof Error){
                    return '[Error: ' + value.toString() + ']';
                }
                return '[' + value.toString() + ']';
            }

            return '{' + Object.keys(value).map(function(key){
                return ['"', key, '": ', formatValue(value[key], false, stack.concat(value))].join('');
            }).join(', ') + '}';
        }
        return value.toString();
    }

    /*
     * Formats an expectation string - "expected [value] [expr] [toDo] [otherVal]"
     *
     * value: The value that was passed into Expect
     * expr: An optional expression to pivot on, eg "not"
     * toDo: What the value was expected to do - eg "to equal", "to be defined" etc
     * otherVal: Optionally give the value you're comparing against at the end of the message
    **/
    function expectation(value, expr, toDo, otherVal){
        return ('expected ' + formatValue(value) + ' ' + expr + toDo + ' ' + formatValue(otherVal, true)).replace(/\s\s/g, ' ').replace(/(^\s|\s$)/g, '');
    }

    function Expect(value, assertions, expr, parent){
        var self = this;
        expr = expr || '';
        this.assertions = assertions;
        this.expectation = expectation;
        this.toEqual = function(val){
            var message = expectation(value, expr, 'to equal', val);
          var toString = Object.prototype.toString,
              hasOwnProperty = Object.prototype.hasOwnProperty;

            // This function borrowed from underscore
            function eq(a, b, stack) {
                // Identical objects are equal. `0 === -0`, but they aren't identical.
                // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
                if (a === b) return a !== 0 || 1 / a == 1 / b;
                // A strict comparison is necessary because `null == undefined`.
                if (a == null || b == null) return a === b;
                // Unwrap any wrapped objects.
                if (a._chain) a = a._wrapped;
                if (b._chain) b = b._wrapped;
                // Invoke a custom `isEqual` method if one is provided.
                if (a.isEqual && _.isFunction(a.isEqual)) return a.isEqual(b);
                if (b.isEqual && _.isFunction(b.isEqual)) return b.isEqual(a);
                // Compare `[[Class]]` names.
                var className = toString.call(a);
                if (className != toString.call(b)) return false;
                switch (className) {
                  // Strings, numbers, dates, and booleans are compared by value.
                case '[object String]':
                  // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
                  // equivalent to `new String("5")`.
                  return a == String(b);
                case '[object Number]':
                  // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
                  // other numeric values.
                  return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
                case '[object Date]':
                case '[object Boolean]':
                  // Coerce dates and booleans to numeric primitive values. Dates are compared by their
                  // millisecond representations. Note that invalid dates with millisecond representations
                  // of `NaN` are not equivalent.
                  return +a == +b;
                  // RegExps are compared by their source patterns and flags.
                case '[object RegExp]':
                  return a.source == b.source && a.global == b.global && a.multiline == b.multiline && a.ignoreCase == b.ignoreCase;
                }
                if (typeof a != 'object' || typeof b != 'object') return false;
                // Assume equality for cyclic structures. The algorithm for detecting cyclic
                // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
                var length = stack.length;
                while (length--) {
                  // Linear search. Performance is inversely proportional to the number of
                  // unique nested structures.
                  if (stack[length] == a) return true;
                }
                // Add the first object to the stack of traversed objects.
                stack.push(a);
                var size = 0,
                    result = true;
                // Recursively compare objects and arrays.
                if (className == '[object Array]') {
                  // Compare array lengths to determine if a deep comparison is necessary.
                  size = a.length;
                  result = size == b.length;
                  if (result) {
                    // Deep compare the contents, ignoring non-numeric properties.
                    while (size--) {
                      // Ensure commutative equality for sparse arrays.
                      if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
                    }
                  }
                } else {
                  // Objects with different constructors are not equivalent.
                  if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) return false;
                  // Deep compare objects.
                  for (var key in a) {
                    if (hasOwnProperty.call(a, key)) {
                      // Count the expected number of properties.
                      size++;
                      // Deep compare each member.
                      if (!(result = hasOwnProperty.call(b, key) && eq(a[key], b[key], stack))) break;
                    }
                  }
                  // Ensure that both objects contain the same number of properties.
                  if (result) {
                    for (key in b) {
                      if (hasOwnProperty.call(b, key) && !(size--)) break;
                    }
                    result = !size;
                  }
                }
                // Remove the first object from the stack of traversed objects.
                stack.pop();
                return result;
              }
            if(!eq(value, val, [])){
                return assertions.fail(message);
            }
            assertions.pass(message);
        };
        this.toBe = function(val){
            var message = expectation(value, expr, 'to equal', val);
            if(value !== val){
                return assertions.fail(message);
            }
            assertions.pass(message);
        };
        this.toBeTruthy = function(val){
            var message = expectation(value, expr, 'to be truthy');
            if(!!value){
                return assertions.pass(message);
            }
            this.assertions.fail(message);
        };
        this.toBeGreaterThan = function(val){
            var message = expectation(value, expr, 'to be greater than', val);
            if(value > val){
                return assertions.pass(message);
            }
            assertions.fail(message);
        };
        this.toContain = function(val){
            var message = expectation(value, expr, 'to contain', val);
            if(value.indexOf(val) > -1){
                return assertions.pass(message);
            }
            assertions.fail(message);
        };
        this.toMatch = function(regex){
            var message = expectation(value, expr, 'to match', regex);
            if(regex.test(value)){
                return assertions.pass(message);
            }
            return assertions.fail(message);
        };
        this.toBeDefined = function(){
            var message = expectation(value, expr, 'to be defined');
            if(typeof value !== 'undefined'){
                return assertions.pass(message);
            }
            assertions.fail(message);
        };
        this.toBeUndefined = function(){
            var message = expectation(value, expr, 'to be undefined');
            if(typeof value === 'undefined'){
                return assertions.pass(message);
            }
            assertions.fail(message);
        };
        this.toBeNull = function(){
            var message = expectation(value, expr, 'to be null');
            if(value === null){
                return assertions.pass(message);
            }
            assertions.fail(message);
        };
        this.toThrow = function(){
            var message = expectation(value, expr, 'to throw an exception');
            try{
                value();
                assertions.fail(message);
            }catch(e){
                assertions.pass(message);
            }
        };
        this.not = parent || new Expect(value, {
            fail: assertions.pass,
            pass: assertions.fail
        }, 'not ', this);
    }

    root.expect = function(value){
        return new Expect(value, assertions);
    };
    root.expect.assertions = assertions;
});