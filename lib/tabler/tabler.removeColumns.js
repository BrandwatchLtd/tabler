(function(root, factory){
    'use strict';
    if(typeof define === 'function' && define.amd){
        define(['jquery', 'underscore'], function($, _){
            return factory($, _);
        });
    }else{
        root.tabler.removeColumns = factory(root.jQuery, root._);
    }
})(this, function($, _){
    'use strict';
    function getLinkHtml(specIds){
        return '<a href class="removeColumn" data-ids="' + _.escape(JSON.stringify(specIds)) +
            '" title="Hide this column. To show again later, click the &quot;Columns&quot; button top right">x</a>';
    }

    function formatSpec(spec){
        var oldFormatter = spec.headerFormatter;

        spec.headerFormatter = function(spec, value){
            if(typeof oldFormatter === 'function'){
                value = oldFormatter.call(this, spec, value);
            }

            if(value && spec.toggleable !== false){
                value = getLinkHtml([spec.id]) + value;
            }

            return '<span class="name">' + value + '</span>';
        };
    }

    /*
     *
    **/
    function RemoveColumns(options){
        _.extend(this, options || {});
    }
    RemoveColumns.pluginName = 'removeColumns';

    function setupColumnGroup(table, spec){
        spec = [].concat(spec);

        var i, oldFormatter, specs, addRemoveLink,
            columnGrouper = table.columnGrouper,
            formatColumnGrouper,
            groups = columnGrouper.getColumnGroups(spec),
            groupSpec;

        function findSpecsInCurrentGroup(spec){
            return spec.groupName === groupSpec.groupName;
        }
        function notToggleable(spec){
            return spec.toggleable === false;
        }

        for(i = 0; i < groups.length; i++){
            groupSpec = groups[i];
            oldFormatter = columnGrouper.formatters[groupSpec.groupName];
            specs = _(spec).filter(findSpecsInCurrentGroup);
            addRemoveLink = true;

            if(!specs.length || _(specs).any(notToggleable)){
                addRemoveLink = false;
            }

            if(oldFormatter && oldFormatter._removeColumnsFormatted){
                return;
            }

            formatColumnGrouper = function(groupSpec, table){
                /*jshint validthis:true*/
                var html = _.escape(groupSpec.groupName),
                    formatter = table.columnGrouper.formatters[groupSpec.groupName],
                    oldFormatter = formatter.original,
                    addRemoveLink = formatter.addRemoveLink,
                    specs = _(table.spec).filter(function(spec){
                        return spec.groupName === groupSpec.groupName;
                    });

                if(typeof oldFormatter === 'function'){
                    html = oldFormatter.call(this, groupSpec);
                }

                if(addRemoveLink){
                    html = getLinkHtml(_(specs).pluck('id')) + html;
                }
                return '<span class="name">' + html + '</span>';
            };

            formatColumnGrouper.original = oldFormatter;
            formatColumnGrouper.addRemoveLink = addRemoveLink;
            formatColumnGrouper._removeColumnsFormatted = true;

            columnGrouper.formatters[groupSpec.groupName] = formatColumnGrouper;
        }
    }

    _.extend(RemoveColumns.prototype, {
        attach: function(table){
            _(table.spec).forEach(function(spec){
                formatSpec(spec);
            });

            var addToSpec = this.originalAddToSpec = table.addToSpec;
            table.addToSpec = function(spec){
                _([].concat(spec)).forEach(function(colSpec){
                    formatSpec(colSpec);
                });

                addToSpec.call(this, spec);

                setupColumnGroup(table, spec);
            };

            table.$el.on('click', 'th a.removeColumn', function(e){
                e.preventDefault();

                var ids = $(e.target).data('ids');

                _([].concat(ids)).forEach(function(id){
                    var field = table.getField({id: id});

                    if(field){
                        field.disabled = true;
                    }
                });

                table.trigger('columnsToggled');
                table.render();
            });
        },
        detach: function(table){
            table.addToSpec = this.originalAddToSpec;
            this.originalAddToSpec = undefined;

            table.$el.off('click', 'th a.removeColumn');

            if(!table.columnGrouper){
                return;
            }

            _(table.columnGrouper.formatters).forEach(function(value, key){
                if(value.original){
                    table.columnGrouper.formatters[key] = value.original;
                    value.original = undefined;
                }
            });
        }
    });

    return RemoveColumns;
});
