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

    function formatValue(value, ignoreUndefined, stack){
        stack = stack || [];

        function isOnStack(value){
            return stack.indexOf(value) > -1 && stack.indexOf(value) !== stack.length - 1;
        }

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
            return '[Date ' + value.toUTCString() + ']';
        }
        if(value instanceof RegExp){
            return value.toString();
        }
        if(value instanceof Array){
            var mapped = [];
            if(!isOnStack(value, stack) && stack.length < 5){
                for(var i = 0; i < value.length; i++){
                    mapped.push(formatValue(value[i], false, stack.concat(value)));
                }
            }else{
                mapped.push(value.toString());
            }
            return '[' + mapped.join(', ') + ']';
        }
        if(value.nodeType == 1){
            return '<' + value.nodeName.toLowerCase() + ' />';
        }

        if(typeof value === 'object' && stack.length < 5){
            if(value.toString() !== '[object Object]'){
                if(value instanceof Error){
                    return '[Error: ' + value.toString() + ']';
                }
                return '[' + value.toString() + ']';
            }
            if(isOnStack(value, stack)){
                return '[Circular]';
            }

            return '{' + Object.keys(value).map(function(key){
                return ['"', key, '": ', formatValue(value[key], false, stack.concat(value))].join('');
            }).join(', ') + '}';
        }
        return value.toString();
    }

    function Expect(value, assertions, expr, parent){
        var self = this;
        expr = expr || '';

        this.value = value;
        this.assertions = assertions || {
            pass: function(message){
            },
            fail: function(message){
                throw new AssertionError({message: message});
            }
        };
        this.expr = expr;
        this.parent = parent;

        this.not = parent || new Expect(value, {
            fail: this.assertions.pass,
            pass: this.assertions.fail
        }, 'not ', this);
    }

    /*
     * Formats an expectation string - "expected [value] [expr] [toDo] [otherVal]"
     *
     * value: The value that was passed into Expect
     * expr: An optional expression to pivot on, eg "not"
     * toDo: What the value was expected to do - eg "to equal", "to be defined" etc
     * otherVal: Optionally give the value you're comparing against at the end of the message
    **/
    Expect.prototype.generateMessage = function(value, expr, toDo, otherVal){
        return ('expected ' + formatValue(value) + ' ' + expr + toDo + ' ' + formatValue(otherVal, true)).replace(/\s\s/g, ' ').replace(/(^\s|\s$)/g, '');
    };

    Expect.prototype.toEqual = function(val){
        var message = this.generateMessage(this.value, this.expr, 'to equal', val),
            toString = Object.prototype.toString,
            hasOwnProperty = Object.prototype.hasOwnProperty;

        // This function borrowed from underscore
        function eq(a, b, stack) {
            /*jshint eqnull:true*/
            // Identical objects are equal. `0 === -0`, but they aren't identical.
            // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
            if (a === b) return a !== 0 || 1 / a == 1 / b;
            // A strict comparison is necessary because `null == undefined`.
            if (a == null || b == null) return a === b;
            // Unwrap any wrapped objects.
            if (a._chain) a = a._wrapped;
            if (b._chain) b = b._wrapped;
            // Invoke a custom `isEqual` method if one is provided.
            if (a.isEqual && typeof a.isEqual === 'function') return a.isEqual(b);
            if (b.isEqual && typeof b.isEqual === 'function') return b.isEqual(a);
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
              return a != +a ? b != +b : (a ? 1 / a == 1 / b : a == +b);
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
        if(!eq(this.value, val, [])){
            return this.assertions.fail(message);
        }
        this.assertions.pass(message);
    };
    Expect.prototype.toNotEqual = function(value){
        return this.not.toEqual(value);
    };
    Expect.prototype.toBe = function(val){
        var message = this.generateMessage(this.value, this.expr, 'to equal', val);
        if(this.value !== val){
            return this.assertions.fail(message);
        }
        this.assertions.pass(message);
    };
    Expect.prototype.toBeTruthy = function(val){
        var message = this.generateMessage(this.value, this.expr, 'to be truthy');
        if(!!this.value){
            return this.assertions.pass(message);
        }
        this.assertions.fail(message);
    };
    Expect.prototype.toBeFalsey = Expect.prototype.toBeFalsy = function(val){
        var message = this.generateMessage(this.value, this.expr, 'to be falsey');
        if(!this.value){
            return this.assertions.pass(message);
        }
        this.assertions.fail(message);
    };
    Expect.prototype.toBeGreaterThan = function(val){
        var message = this.generateMessage(this.value, this.expr, 'to be greater than', val);
        if(this.value > val){
            return this.assertions.pass(message);
        }
        this.assertions.fail(message);
    };
    Expect.prototype.toBeLessThan = function(val){
        var message = this.generateMessage(this.value, this.expr, 'to be less than', val);
        if(this.value < val){
            return this.assertions.pass(message);
        }
        this.assertions.fail(message);
    };
    Expect.prototype.toContain = function(val){
        var message = this.generateMessage(this.value, this.expr, 'to contain', val);
        if(this.value.indexOf(val) > -1){
            return this.assertions.pass(message);
        }
        this.assertions.fail(message);
    };
    Expect.prototype.toMatch = function(regex){
        var message = this.generateMessage(this.value, this.expr, 'to match', regex);
        if(regex.test(this.value)){
            return this.assertions.pass(message);
        }
        return this.assertions.fail(message);
    };
    Expect.prototype.toBeDefined = function(){
        var message = this.generateMessage(this.value, this.expr, 'to be defined');
        if(typeof this.value !== 'undefined'){
            return this.assertions.pass(message);
        }
        this.assertions.fail(message);
    };
    Expect.prototype.toBeUndefined = function(){
        var message = this.generateMessage(this.value, this.expr, 'to be undefined');
        if(typeof this.value === 'undefined'){
            return this.assertions.pass(message);
        }
        this.assertions.fail(message);
    };
    Expect.prototype.toBeNull = function(){
        if(this.value === null){
            return this.assertions.pass();
        }
        this.assertions.fail('to be null');
    };
    Expect.prototype.toThrow = function(){
        try{
            this.value();
            this.fail('to throw an exception');
        }catch(e){
            this.assertions.pass();
        }
    };
    Expect.prototype.pass = function(){
        this.assertions.pass();
    };
    Expect.prototype.fail = function(why, what){
        var message = this.generateMessage(this.value, this.expr, why || '', what);

        this.assertions.fail(message);
    };

    root.expect = function(value){
        return new Expect(value);
    };
    root.expect.addAssertion = function(name, matcher){
        Expect.prototype[name] = matcher;
    };
});
