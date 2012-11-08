(function(root, factory){
    'use strict';
    if(typeof define === 'function' && define.amd){
        define(['jquery', 'underscore'], function($, _){
            return factory($, _);

        });
    }else{
        root.tabler.sortable = factory(root.jQuery, root._);
    }
})(this, function($, _){
    'use strict';

    function addSortableFieldsToSpec(colSpec){
        if(colSpec.sortable){
            var oldFormatter = colSpec.headerFormatter;

            colSpec.name = colSpec.name || colSpec.field;
            colSpec.headerClassName = (colSpec.headerClassName || colSpec.className || '') + ' sortable';
            colSpec.className = (colSpec.className || '') + ' sortable';

            colSpec.headerFormatter = function renderSortableHeader(colSpec, html){
                html = '<a href class="sort" data-sort-key="' + _.escape(colSpec.field) + '">' + _.escape(html) + '</a>';

                if(oldFormatter){
                    html = oldFormatter.call(this, colSpec, html);
                }

                return html;
            };
        }
    }

    function defaultSort(data, field, dir){
        data.items = _(data.items).sortBy(function(row){
            return row[field];
        });
        if(dir === 'desc'){
            data.items = _(data.items).reverse();
        }
        return data;
    }

    function Sortable(options){
        _.extend(this, options || {});
    }
    Sortable.pluginName = 'sortable';

    function updateSpecForSort(table, field, dir){
        var spec;

        dir = (dir || '').replace(/ending$/i, '') === 'asc' ? 'asc' : 'desc';

        // Find the correct column spec, while removing any sorted classes from other columns
        _(table.spec).forEach(function(colSpec){
            if(colSpec.className){
                colSpec.className = colSpec.className
                    .replace(/sorted-asc/g, '')
                    .replace(/sorted-desc/g, '')
                    .replace(/(^\s|\s$)/g, '');
            }
            if(colSpec.headerClassName){
                colSpec.headerClassName = colSpec.headerClassName
                    .replace(/sorted-asc/g, '')
                    .replace(/sorted-desc/g, '')
                    .replace(/(^\s|\s$)/g, '');
            }
            if(colSpec.field === field && colSpec.sortable){
                spec = colSpec;
            }
        });

        if(!spec){
            return;
        }
        spec.className = ((spec.className || '') + ' sorted-' + dir).trim();
        spec.headerClassName = ((spec.headerClassName || '') + ' sorted-' + dir).trim();
    }

    _.extend(Sortable.prototype, {
        attach: function(table){
            var self = this;

            this.table = table;

            _(table.spec).forEach(function(colSpec){
                addSortableFieldsToSpec(colSpec);
            });

            var addToSpec = table.addToSpec;
            table.addToSpec = function(spec){
                _([].concat(spec)).forEach(function(colSpec){
                    addSortableFieldsToSpec(colSpec);
                });

                addToSpec.call(this, spec);
            };

            var getFetchOptions = table.getFetchOptions;
            table.getFetchOptions = function(){
                return _.extend(getFetchOptions.call(this), {
                    sortField: self.field,
                    sortDirection: self.dir
                });
            };

            var fetchTable = table.fetch;
            table.fetch = function(options, callback){
                fetchTable.call(this, options, function(data){
                    if(options.sortField){
                        data = defaultSort(data, options.sortField, options.sortDirection);
                    }
                    callback(data);
                });
            };

            var render = table.render;
            table.render = function(){
                updateSpecForSort(this, self.field, self.dir);

                render.call(this);
            };

            table.$el.delegate('th.sortable', 'click', function(e){
                var $th = $(this),
                    $a = $th.find('a.sort'),
                    field = $a.data('sort-key'),
                    dir = $th.hasClass('sorted-asc') ? 'desc' : $th.hasClass('sorted-desc') ? 'asc' : 'desc';

                if(!$a.length){
                    return;
                }

                e.preventDefault();

                self.field = field;
                self.dir = dir;

                table.render();
            });
        }
    });

    return Sortable;
});