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
        if( event in this._events === false  ) { return; }
        this._events[event].splice(this._events[event].indexOf(fct), 1);
    },
    trigger : function(event /* , args... */){
        this._events = this._events || {};
        if( event in this._events === false  ) { return; }
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

    function validateAndAddToSpec(table, spec){
        var i, s, name, fields = [];

        for(i =0; i < spec.length; i++){
            s = spec[i];
            name = s.id = s.id || s.field || s.name;

            if(!name){
                throw new Error('Spec field at index ' + i + ' does not have a field, id or name property');
            }

            if(fields.indexOf(name) > -1){
                throw new Error('Spec field at index ' + i + ' has duplicate "field" or "id" property of "' + name +
                    '", if it has no "id" property add one, if it has an "id" property ensure it is unique');
            }

            fields.push(name);
            table.spec.push(s);
        }
    }

    /*
     * Constructor doesn't do much
    **/
    function Tabler(options){
        this.$el = $(document.createElement('table'));
        this._plugins = [];

        this.cellClassName = options && options.cellClassName;
        this.headerCellClassName = options && options.headerCellClassName;
        this.headRowClassName = options && options.headRowClassName;
        this.bodyRowClassName = options && options.bodyRowClassName;
        this.footRowClassName = options && options.footRowClassName;
    }

    /*
     * How you create a tabler
     *
     * - spec: An array of spec objects for each column of the table
     * - options: An options hash, at the moment only {plugin: Array} is supported
    **/
    Tabler.create = function(spec, options){
        var table = new Tabler(options),
            plugins = (options && options.plugins) || [],
            i;

        if(!options && !_.isArray(spec)){
            options = spec;
            spec = undefined;
        }

        options = options || {};

        for(i = 0; i < plugins.length; i++){
            table.addPlugin(plugins[i], options[plugins[i].pluginName]);
        }

        if(options.className){
            table.$el.addClass(options.className);
        }

        if(options.fetch){
            table.fetch = options.fetch;
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
            this._plugins.push(Plugin.pluginName);
        },
        addToSpec: function(spec){
            var specs = [].concat(spec);

            validateAndAddToSpec(this, specs);
        },
        removeFromSpec: function(matcher){
            var spec = this.getField(matcher);

            this.spec.splice(this.spec.indexOf(spec), 1);
        },
        /*
         * Load the table with some data
        **/
        load: function(data){
            this._data = {
                totalResults: data.length,
                items: _(data).map(function(row){
                    return row;
                })
            };
        },

        _doFetch: function(options, callback){
            var data = _.clone(this._data);

            data.items = _.map(data.items, _.clone);

            callback(data);
        },

        //this function can be overridden
        fetch: function(options, callback){
            return this._doFetch(options, callback);
        },

        getFetchOptions: function(){
            return {};
        },
        /*
         * Destroys this instance
        **/
        destroy: function(){
            /*jshint boss:true*/
            var pluginName;

            this._events = undefined;
            this.fetch = undefined;
            this.$el.off().empty().remove();

            this.spec = [];

            while(pluginName = this._plugins.shift()){
                if(this[pluginName].detach){
                    this[pluginName].detach(this);
                }
                this[pluginName] = undefined;
            }
            this._plugins = [];
        },
        /*
         * Retrieve a given field spec by field id, which will equal either the "field" or "name" attribute
         * if no "id" is explicitly given on creation
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
            var className = (colSpec.className || '');
            if(this.cellClassName){
                className += ' ' + this.cellClassName;
            }
            return {
                width: colSpec.width,
                'class': className.trim()
            };
        },

        makeHeaderAttrs: function(colSpec){
            var className = (colSpec.headerClassName || colSpec.className || '');
            if(this.headerCellClassName){
                className += ' ' + this.headerCellClassName;
            }
            return {
                width: colSpec.width,
                'class': className.trim()
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
        formatValue: function(row, colSpec, index){
            var value = row[colSpec.field];

            if(value === '' || value === undefined || value === null || _.isNaN(value)){
                value = colSpec.defaultText || value;
            }
            value = _.escape(value);

            if(typeof colSpec.formatter === 'function'){
                value = colSpec.formatter.call(this, value, colSpec, row, index);
            }

            return value;
        },
        getSpec: function(data){
            var spec = this.spec;

            if(!this.spec){
                this.spec = [];
                this.addToSpec(buildDefaultSpec(data.items));
            }

            spec = _(this.spec).filter(function(colSpec){
                return !colSpec.disabled;
            });

            return spec;
        },
        /*
         * Where the magic happens
        **/
        render: function(){
            var options = this.getFetchOptions();

            this.$el.addClass('loading');
            this.fetch(options, _(this.renderTable).bind(this));
        },
        update: function(rowIndex, newItem, options){
            var spec = this.getSpec(),
                $row = this.$('> tbody tr').eq(rowIndex),
                $tds, updateFieldNames = Object.keys(newItem);

            if(options && options.invalidateRow){
                return $row.replaceWith(this.renderRow(newItem, rowIndex, spec));
            }
            $tds = $row.find('td');

            _(spec).forEach(function(spec, cellIndex){
                if(spec.disabled){
                    return;
                }
                var fields = [spec.field].concat(spec.updateFields || []);
                if(_.intersection(updateFieldNames, fields).length > 0){
                    $tds.eq(cellIndex).replaceWith(this.renderCell(newItem, spec, rowIndex));
                }
            }, this);
        },
        renderTable: function(data){
            var spec = this.getSpec(data),
                head, body, foot;

            if(!data.items){
                throw new Error('no data.items (not even an empty array)');
            }
            this.$el.removeClass('loading');

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
            if (this.headRowClassName){
                return '<tr class="' + _.escape(this.headRowClassName) + '">';
            }
            return '<tr>';
        },
        /*
         * Renders row(s) for the thead of the table
         *
         * data: the data being rendered, with data.items [] and totalResults item
         * spec: the spec for the table
        **/
        renderHead: function(data, spec){
            var head = '';

            if(_(spec).any(function(col){return !!col.name || !!col.headerFormatter;})){
                // Main headings
                head += this.renderHeadRow(spec);
            }
            return head;
        },
        renderHeadRow: function(spec){
            return this.renderHeadTr() + _(spec)
                .map(function(colSpec){
                    return this.renderHeadCell(colSpec);
                }, this)
                .join('\n') + '</tr>';
        },
        renderHeadCell: function(colSpec){
            var title = _.isString(colSpec.title) ? colSpec.title : colSpec.name;
            title = _.escape(title);

            if(typeof colSpec.headerFormatter === 'function'){
                title = colSpec.headerFormatter.call(this, colSpec, title);
            }

            return this.makeTag('th', title, this.makeHeaderAttrs(colSpec));
        },
        renderBodyTr: function(/*row*/){
            if (this.bodyRowClassName){
                return '<tr class="' + _.escape(this.bodyRowClassName) + '">';
            }
            return '<tr>';
        },
        renderFootTr: function(){
            if (this.footRowClassName){
                return '<tr class="' + _.escape(this.footRowClassName) + '">';
            }
            return '<tr>';
        },
        /*
         * Renders row(s) for the tbody of the table
         *
         * data: the data being rendered, with data.items [] and totalResults item
         * spec: the spec for the table
        **/
        renderBody: function(data, spec){
            var self = this,
                body = _(data.items).map(function(row, i){
                    return self.renderRow(row, i, spec);
                }).join('\n');
            return body;
        },
        renderRow: function(row, i, spec){
            var self = this;

            return [this.renderBodyTr(row)].concat(_(spec).map(function(colSpec){
                return self.renderCell(row, _.clone(colSpec), i);
            })).concat('</tr>').join('\n');
        },
        renderCell: function(row, colSpec, index){
            return this.makeTag('td', this.formatValue(row, colSpec, index), this.makeColumnAttrs(colSpec));
        },
        /*
         * Renders row(s) for the tfoot of the table
         *
         * data: the data being rendered, with data.items [] and totalResults item
         * spec: the spec for the table
        **/
        renderFoot: function(/*data, spec*/){
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
