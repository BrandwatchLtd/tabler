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

        spec.headerFormatter = function(spec, html){
            if(oldFormatter){
                html = oldFormatter.call(this, spec, html);
            }

            if(spec.toggleable !== false && html){
                html = getLinkHtml([spec.id]) + html;
            }

            return '<span class="name">' + html + '</span>';
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

        var columnGrouper = table.columnGrouper,
            groups = columnGrouper.getColumnGroups(spec);

        _(groups).forEach(function(groupSpec){
            var oldFormatter = columnGrouper.formatters[groupSpec.groupName],
                specs = _(spec).filter(function(spec){
                    return spec.groupName === groupSpec.groupName;
                }),
                addRemoveLink = true;

            if(!specs.length || _(specs).any(function(spec){
                    return spec.toggleable === false;
                })){
                addRemoveLink = false;
            }

            if(columnGrouper.formatters[groupSpec.groupName] && columnGrouper.formatters[groupSpec.groupName]._removeColumnsFormatted){
                return;
            }

            columnGrouper.formatters[groupSpec.groupName] = function(groupSpec){
                var html = groupSpec.groupName,
                    specs = _(table.spec).filter(function(spec){
                        return spec.groupName === groupSpec.groupName;
                    });

                if(oldFormatter){
                    html = oldFormatter.call(this, groupSpec);
                }
                if(addRemoveLink){
                    html = getLinkHtml(_(specs).pluck('id')) + html;
                }
                return '<span class="name">' + html + '</span>';
            };
            columnGrouper.formatters[groupSpec.groupName].original = oldFormatter;
            columnGrouper.formatters[groupSpec.groupName]._removeColumnsFormatted = true;
        });
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

                _([].concat(spec)).forEach(function(){
                    if(table.columnGrouper){
                        setupColumnGroup(table, spec);
                    }
                });
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
