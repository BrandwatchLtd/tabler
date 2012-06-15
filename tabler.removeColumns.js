(function(root, factory){
    'use strict';
    if(typeof define === 'function' && define.amd){
        define([], function(){
            return factory(root.jQuery, root._);
        });
    }else{
        root.tabler.removeColumns = factory(root.jQuery, root._);
    }
})(this, function($, _){
    'use strict';
    function getLinkHtml(specIds){
        return '<a href class="removeColumn" data-ids="' + _.escape(JSON.stringify(specIds)) + '" title="Hide this column. To show again later, click the &quot;Columns&quot; button top right">x</a>';
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

    function setupColumnGroup(columnGrouper, spec){
        spec = [].concat(spec);

        var groups = columnGrouper.getColumnGroups(spec);

        _(groups).forEach(function(groupSpec){
            var oldFormatter = columnGrouper.formatters[groupSpec.groupName],
                specs = _(spec).filter(function(spec){
                    return spec.groupName == groupSpec.groupName;
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
                var html = groupSpec.groupName;

                if(oldFormatter){
                    html = oldFormatter.call(this, groupSpec);
                }
                if(addRemoveLink){
                    html = getLinkHtml(_(specs).pluck('id')) + html;
                }
                return '<span class="name">' + html + '</span>';
             };
            columnGrouper.formatters[groupSpec.groupName]._removeColumnsFormatted = true;
        });
    }

    _.extend(RemoveColumns.prototype, {
        attach: function(table){
            var self = this;

            _(table.spec).forEach(function(spec){
                formatSpec(spec);
            });

            var addToSpec = table.addToSpec;
            table.addToSpec = function(spec){
                _([].concat(spec)).forEach(function(colSpec){
                    formatSpec(colSpec);
                });

                addToSpec.call(this, spec);

                _([].concat(spec)).forEach(function(colSpec){
                    if(table.columnGrouper){
                        setupColumnGroup(table.columnGrouper, spec);
                    }
                });
            };

            table.$el.delegate('th a.removeColumn', 'click', function(e){
                e.preventDefault();

                var ids = $(e.target).data('ids');

                _([].concat(ids)).forEach(function(id){
                    var field = table.getField({id: id});

                    if(field){
                        field.disabled = true;
                    }
                });

                table.render();
            });
        }
    });

    return RemoveColumns;
});