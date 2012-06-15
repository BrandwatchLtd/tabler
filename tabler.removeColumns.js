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

    /*
     *
    **/
    function RemoveColumns(options){
        _.extend(this, options || {});
    }
    RemoveColumns.pluginName = 'removeColumns';

    function setupColumnGroups(columnGrouper, spec){
        var groups = columnGrouper.getColumnGroups(spec);

        _(groups).forEach(function(groupSpec){
            var oldFormatter = columnGrouper.formatters[groupSpec.groupName],
                specs = _(spec).filter(function(spec){
                    return spec.groupName == groupSpec.groupName;
                });

            if(!specs.length || _(specs).any(function(spec){
                    return spec.toggleable === false;
                })){
                return;
            }

            columnGrouper.formatters[groupSpec.groupName] = function(groupSpec){
                var html = groupSpec.groupName;

                if(oldFormatter){
                    html = oldFormatter.call(this, groupSpec);
                }
                return getLinkHtml(_(specs).pluck('id')) + html;
            };
        });
    }

    _.extend(RemoveColumns.prototype, {
        attach: function(table){
            var self = this;

            _(table.spec).forEach(function(spec){
                var oldFormatter = spec.headerFormatter;

                spec.headerFormatter = function(spec){
                    var html = _.isString(spec.title) ? spec.title : spec.name;
                    if(oldFormatter){
                        html = oldFormatter.call(this, spec);
                    }

                    if(spec.toggleable === false){
                        return html;
                    }

                    return getLinkHtml([spec.id]) + html;
                };
            });

            // NOTE: To work correctly with columnGrouper this plugin must be *after* that one in the array
            if(table.columnGrouper){
                setupColumnGroups(table.columnGrouper, table.spec);
            }

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