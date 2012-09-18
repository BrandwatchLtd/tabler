/*
 * Tabler.js, renders well-formed HTML tables dynamically
 *
 * Dependencies: jQuery, underscore.js
 *
 * License: MIT
**/
(function(root, factory){
    'use strict';

// Full MicroEvents library @ 54e85c036c3f903b963a0e4a671f72c1089ae4d4
// (added some missing semi-colons etc, that's it)
/**
 * MicroEvent - to make any js object an event emitter (server or browser)
 *
 * - pure javascript - server compatible, browser compatible
 * - dont rely on the browser doms
 * - super simple - you get it immediatly, no mistery, no magic involved
 *
 * - create a MicroEventDebug with goodies to debug
 *   - make it safer to use
*/

var MicroEvent  = function(){};
MicroEvent.prototype    = {
    bind    : function(event, fct){
        this._events = this._events || {};
        this._events[event] = this._events[event]   || [];
        this._events[event].push(fct);
    },
    unbind  : function(event, fct){
        this._events = this._events || {};
        if( event in this._events === false  )  return;
        this._events[event].splice(this._events[event].indexOf(fct), 1);
    },
    trigger : function(event /* , args... */){
        this._events = this._events || {};
        if( event in this._events === false  )  return;
        for(var i = 0; i < this._events[event].length; i++){
            this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
        }
    }
};

/**
 * mixin will delegate all MicroEvent.js function in the destination object
 *
 * - require('MicroEvent').mixin(Foobar) will make Foobar able to use MicroEvent
 *
 * @param {Object} the object which will support MicroEvent
*/
MicroEvent.mixin    = function(destObject){
    var props   = ['bind', 'unbind', 'trigger'];
    for(var i = 0; i < props.length; i ++){
        destObject.prototype[props[i]]  = MicroEvent.prototype[props[i]];
    }
};

// export in common js
if( typeof module !== "undefined" && ('exports' in module)){
    module.exports  = MicroEvent;
}
/// END MicroEvents

    // Work with AMD or plain-ol script tag
    if(typeof define === 'function' && define.amd){
        // If window.jQuery or window._ are not defined, then assume we're using AMD modules
        define(['jquery', 'underscore'], function($, _){
            return factory($ || root.jQuery, _ || root._, MicroEvent);
        });
    }else{
        root.tabler = factory(root.jQuery, root._, MicroEvent);
    }
})(this, function($, _, MicroEvent){
    'use strict';

    if(!$){
        throw new Error('tabler requires jQuery to be loaded');
    }
    if(!_){
        throw new Error('tabler requires underscore to be loaded');
    }


    /*
     * If you initialize a tabler without a spec (tabler.create()) then it will build a spec for you
    **/
    function buildDefaultSpec(data){
        return _(data).chain()
            .map(function(row){
                return _(row).keys();
            })
            .flatten()
            .uniq()
            .reduce(function(memo, key){
                memo[key] = {field: key};
                return memo;
            }, {})
            .values()
            .value();
    }

    function validateSpec(spec){
        var duplicateFields = _(spec).reduce(function(fields, s, i){
            var name = s.id = s.id || s.field || s.name;

            if(!name){
                throw new Error('Spec field at index ' + i + ' does not have a field, id or name property');
            }

            fields[name] = (fields[name] || 0) + 1;

            if(fields[name] > 1){
                throw new Error('Spec field at index ' + i + ' has duplicate "field" or "id" property of "' + name + '", if it has no "id" property add one, if it has an "id" property ensure it is unique');
            }

            return fields;
        }, {});
    }

    /*
     * Constructor doesn't do much
    **/
    function Tabler(spec){
        this.$el = $('<table />');
    }

    /*
     * How you create a tabler
     *
     * - spec: An array of spec objects for each column of the table
     * - opts: An options hash, at the moment only {plugin: Array} is supported
    **/
    Tabler.create = function(spec, opts){
        var table = new Tabler(),
            options = opts || {};

        _(options.plugins).forEach(function(plugin){
            table.addPlugin(plugin);
        });

        if(options.className){
            table.$el.addClass(options.className);
        }

        if(spec){
            table.spec = [];
            table.addToSpec(spec);
        }

        return table;
    };

    // Add the following to the prototype
    _.extend(Tabler.prototype, {
        /*
         * Registers a plugin with this tabler instance
         *
         * Plugin: The Plugins constructor
         * options: An options hash unique to the plugin (or undefined)
        **/
        addPlugin: function(Plugin, options){
            if(!Plugin.pluginName){
                throw new Error('Plugin ' + Plugin + ' must have a pluginName property');
            }

            var plugin = new Plugin(options);
            plugin.attach(this);

            this[Plugin.pluginName] = plugin;
        },
        addToSpec: function(spec){
            var specs = [].concat(spec);

            validateSpec(specs);

            for(var i = 0; i < specs.length; i++){
                this.spec.push(specs[i]);
            }
        },
        removeFromSpec: function(matcher){
            var spec = this.getField(matcher);

            this.spec.splice(this.spec.indexOf(spec), 1);
        },
        /*
         * Load the table with some data
        **/
        load: function(data){
            this.data = _(data).map(function(row){
                return row;
            });
        },
        /*
         * Destroys this instance
        **/
        destroy: function(){
            this.$el.unbind().empty();
        },
        /*
         * Retrieve a given field spec by field id, which will equal either the "field" or "name" attribute if no "id" is explicitly given on creation
         *
         * Can also supply a hash of desired attributes, eg {name: 'Name'} or {customValue: 'value'}, in which case
         * this method will only return the first field that matches the given hash
        **/
        getField: function(matcher){
            if(_.isUndefined(matcher)){
                throw new Error('matcher must be defined (a string or an object literal)');
            }

            // Can call with no fieldname and just {..vars..}
            if(!_.isObject(matcher)){
                matcher = {
                    id: matcher
                };
            }

            return _(this.spec).detect(function(spec){
                if(_(matcher).all(function(value, key){
                                return spec[key] === value;
                            })){
                    return spec;
                }
            });
        },
        /*
         * Builds the standard attributes for a column - here mostly for plugins to be able to override
        **/
        makeColumnAttrs: function(colSpec){
            return {
                width: colSpec.width,
                'class': colSpec.className
            };
        },

        makeHeaderAttrs: function(colSpec){
            return {
                width: colSpec.width,
                'class': colSpec.headerClassName || colSpec.className
            };
        },
        /*
         * Builds a tag
         *
         * tag: the tag to build ('td', 'td', 'a' etc)
         * attrs: a hash of the attributes to put on the tag
        **/
        makeTag: function(tag, text, attrs){
            var builder = ['<', tag];

            _(attrs).forEach(function(value, attr){
                if(value){
                    builder = builder.concat([' ', attr, '="', _.escape(value), '"']);
                }
            });

            builder = builder.concat(['>', text, '</' + tag + '>']);

            return builder.join('');
        },
        /*
         * Formats a particular column value of a particular row
        **/
        formatValue: function(table, row, colSpec, index){
            var value = row[colSpec.field],
                formatter = colSpec.formatter;

            if(value === '' || value === undefined || value === null || _.isNaN(value)){
                value = colSpec.defaultText || value;
            }

            if(!formatter){
                return value;
            }

            return formatter.call(table, value, colSpec, row, index);
        },
        /*
         * Where the magic happens
        **/
        render: function(data){
            var spec = this.spec,
                head, body, foot;

            data = (data || this.data);

            if(!this.spec){
                this.spec = [];
                this.addToSpec(buildDefaultSpec(data));
            }

            spec = _(this.spec).filter(function(colSpec){
                return !colSpec.disabled;
            });

            head = this.renderHead(data, spec);
            body = this.renderBody(data, spec);
            foot = this.renderFoot(data, spec);

            this.$el.empty();
            // Only render the bits that actually returned any HTML - we deal with wrapping in thead, tfoot etc
            if(head){
                this.$el.append('<thead>' + head + '</thead>');
            }
            if(body){
                this.$el.append('<tbody>' + body + '</tbody>');
            }
            if(foot){
                this.$el.append('<tfoot>' + foot + '</tfoot>');
            }

/*DEBUG
            var self = this;
            if(!this.renderedThisTick){
                this.renderedThisTick = 0;
            }
            if(this.renderedThisTick++){
                console.warn('tabler', this, 'rendered', this.renderedThisTick, 'times this tick!');
            }
            _.defer(function(){
                self.renderedThisTick = 0;
            });
///DEBUG*/
        },
        renderHeadTr: function(){
            return '<tr>';
        },
        /*
         * Renders row(s) for the thead of the table
         *
         * data: the data being rendered (potentially a subset of the full data, which can always be found on this.data)
         * spec: the spec for the table
        **/
        renderHead: function(data, spec){
            var self = this,
                head = '';

            if(_(spec).any(function(col){return !!col.name || !!col.headerFormatter;})){
                // Main headings
                head += this.renderHeadTr() + _(spec)
                    .map(function(colSpec){
                        var title = (_.isString(colSpec.title) ? colSpec.title : colSpec.name);

                        if(colSpec.headerFormatter){
                            title = colSpec.headerFormatter.call(self, colSpec, title);
                        }

                        return self.makeTag('th', title, self.makeHeaderAttrs(colSpec));
                    })
                    .join('\n') + '</tr>';
            }
            return head;
        },
        renderBodyTr: function(row){
            return '<tr>';
        },
        /*
         * Renders row(s) for the tbody of the table
         *
         * data: the data being rendered (potentially a subset of the full data, which can always be found on this.data)
         * spec: the spec for the table
        **/
        renderBody: function(data, spec){
            var self = this,
                body = _(data).map(function(row, i){
                        return [self.renderBodyTr(row)].concat(_(spec).map(function(colSpec){
                            return self.makeTag('td', self.formatValue(self, row, colSpec, i), self.makeColumnAttrs(colSpec));
                        })
                    ).concat('</tr>').join('\n');
                }).join('\n');
            return body;
        },
        /*
         * Renders row(s) for the tfoot of the table
         *
         * data: the data being rendered (potentially a subset of the full data, which can always be found on this.data)
         * spec: the spec for the table
        **/
        renderFoot: function(data, spec){
            return '';
        },
        /*
         * Wrapper function for querying the DOM of the table
         * Note you can always access the main <table> element through the $el property
        **/
        $: function(){
            return this.$el.find.apply(this.$el, arguments);
        }
    });

    MicroEvent.mixin(Tabler);

    return Tabler;
});