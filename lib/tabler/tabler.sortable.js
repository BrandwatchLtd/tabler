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

            colSpec.headerFormatter = function renderSortableHeader(colSpec, value){
                if(typeof oldFormatter === 'function'){
                    value = oldFormatter.call(this, colSpec, value);
                }
                return '<a href="#" class="sort" data-sort-key="' + _.escape(colSpec.field) + '">' + value + '</a>';
            };
        }
    }

    function defaultSort(data, field, direction){
        data.items = _(data.items).sortBy(function(row){
            return row[field];
        });
        if(direction === 'desc'){
            data.items = _(data.items).reverse();
        }
        return data;
    }

    function Sortable(options){
        _.extend(this, options || {});
    }
    Sortable.pluginName = 'sortable';

    function updateSpecForSort(table, field, direction){
        direction = (direction || '').replace(/ending$/i, '') === 'asc' ? 'asc' : 'desc';

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
                colSpec.className = ((colSpec.className || '') + ' sorted-' + direction).trim();
                colSpec.headerClassName = ((colSpec.headerClassName || '') + ' sorted-' + direction).trim();
            }
        });
    }

    _.extend(Sortable.prototype, {
        attach: function(table){
            var self = this;

            this.table = table;

            _(table.spec).forEach(function(colSpec){
                addSortableFieldsToSpec(colSpec);
            });

            var addToSpec = this.originalAddToSpec = table.addToSpec;
            table.addToSpec = function(spec){
                _([].concat(spec)).forEach(function(colSpec){
                    addSortableFieldsToSpec(colSpec);
                });

                addToSpec.call(this, spec);
            };

            var getFetchOptions = table.getFetchOptions;
            table.getFetchOptions = function(){
                return _.extend(getFetchOptions.call(this), {
                    field: self.field,
                    direction: self.direction
                });
            };

            var doFetch = table._doFetch;
            table._doFetch = function(options, callback){
                doFetch.call(this, options, function(data){
                    if(options.field){
                        data = defaultSort(data, options.field, options.direction);
                    }
                    callback(data);
                });
            };

            var render = this.originalRender = table.render;
            table.render = function(){
                updateSpecForSort(this, self.field, self.direction);

                render.call(this);
            };

            table.$el.on('click', 'th.sortable', function(e){
                var $target = $(e.target),
                    $th = $(e.currentTarget),
                    $a = $th.find('a.sort'),
                    field = $a.data('sort-key'),
                    direction = $th.hasClass('sorted-asc') ? 'desc' : $th.hasClass('sorted-desc') ? 'asc' : 'desc';

                if(!$target.is($th) && $target.closest('.sort').length === 0){
                    return;
                }

                if(!$a.length){
                    return;
                }

                e.preventDefault();

                self.field = field;
                self.direction = direction;

                table.render();

                table.trigger('sorted', {
                    field: self.field,
                    direction: self.direction
                });
            });
        },
        detach: function(table){
            table.addToSpec = this.originalAddToSpec;
            this.originalAddToSpec = undefined;
            table.render = this.originalRender;
            this.originalRender = undefined;

            table.$el.off('click', 'th.sortable');
        }
    });

    return Sortable;
});
