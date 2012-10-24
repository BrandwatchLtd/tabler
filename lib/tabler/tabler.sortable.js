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

    function defaultSort(data, field, dir, done){
        data = _(data).sortBy(function(row){
            return row[field];
        });
        if(dir === 'desc'){
            data = _(data).reverse();
        }

        done(undefined, data);
    }

    function Sortable(options){
        _(this).bindAll('performSort');

        _.extend(this, options || {});
        this.sorter = this.sorter || defaultSort;
    }
    Sortable.pluginName = 'sortable';

    _.extend(Sortable.prototype, {
        performSort: function(field, dir, done){
            var table = this.table,
                spec;

            dir = dir.replace(/ending$/i, '') === 'asc' ? 'asc' : 'desc';

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
                return done();
            }
            spec.className = ((spec.className || '') + ' sorted-' + dir).trim();
            spec.headerClassName = ((spec.headerClassName || '') + ' sorted-' + dir).trim();

            // Sort the underlying data
            this.sorter(table.data, field, dir, function(err, data){
                table.data = data;

                done();
            });
        },
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

            var renderTable = table.render;
            table.render = function(){
                self.performSort(self.field, self.dir || 'desc', function(){
                    renderTable.call(table);
                });
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