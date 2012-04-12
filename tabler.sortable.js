(function(root, factory){
    'use strict';
    if(typeof define === 'function' && define.amd){
        define([], function(){
            return factory(root.jQuery, root._);
        });
    }else{
        root.tabler.sortable = factory(root.jQuery, root._);
    }
})(this, function($, _){
    'use strict';

    function renderSortableHeader(colSpec){
        return '<a href="#" data-sort-key="' + colSpec.field + '">' + colSpec.name + '</a>';
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
                if(colSpec.field === field){
                    spec = colSpec;
                }
            });

            if(!spec){
                return done();
            }
            spec.className += ' sorted-' + dir;

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
                if(colSpec.sortable){
                    colSpec.name = colSpec.name || colSpec.field;
                    colSpec.className = (colSpec.className || '') + ' sortable';
                    colSpec.headerFormatter = renderSortableHeader;
                }
            });

            var renderTable = table.render;
            table.render = function(){
                self.performSort(self.field, self.dir || 'desc', function(){
                    renderTable.call(table);
                });
            };

            table.$el.delegate('th.sortable a', 'click', function(e){
                var $a = $(e.target),
                    $th = $a.parent(),
                    field = $a.data('sort-key'),
                    dir = $th.hasClass('sorted-asc') ? 'desc' : $th.hasClass('sorted-desc') ? 'asc' : 'desc';

                e.preventDefault();

                self.field = field;
                self.dir = dir;

                table.render();
            });
        }
    });

    return Sortable;
});