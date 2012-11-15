(function(root, factory){
    'use strict';
    if(typeof define === 'function' && define.amd){
        define(['jquery', 'underscore'], function($, _){
            return factory($, _);
        });
    }else{
        root.tabler.infiniTable = factory(root.jQuery, root._);
    }
})(this, function($, _){
    'use strict';

    function InfiniTable(options){
        _.extend(this, options || {});
    }
    InfiniTable.pluginName = 'infiniTable';

    function scrollParent($el){
        var $scroller = $(window);
        $el.parents().each(function(i, el){
            var $el = $(el);
            if(['auto', 'scroll'].indexOf($el.css('overflow-y')) > -1){
                $scroller = $el;
                return false;
            }
        });

        return $scroller;
    }

    function isScrolledIntoView($el, $scrollParent){
        if(!$el.length){
            return false;
        }
        var parentTop = $scrollParent.scrollTop(),
            parentHeight = $scrollParent.height(),
            parentOffset = $scrollParent.offset() || {top: 0},
            parentScrollHeight = $scrollParent[0].scrollHeight,
            elTop = $el.offset().top - parentOffset.top;

        return (parentOffset.top + parentHeight) > $el.offset().top;
    }

    function bindToScrollParent(table){
        if(table.$scrollParent){
            table.$scrollParent.off('scroll.infiniTable');
        }
        var $scrollParent = table.$scrollParent = scrollParent(table.$el);

        $scrollParent.on('scroll.infiniTable', _.throttle(function(){
            if(!isScrolledIntoView(table.$('tfoot span.loading'), $scrollParent)){
                return;
            }

            $scrollParent.off('scroll.infiniTable');
            table.pager.currentPage++;

            table.render();
        }, 100));
    }

    function ensureScrollHeight(table, data, allItems){
        var rowHeights = table.$('tbody tr').map(function(i, el){
                return $(el).height();
            }),
            meanRowHeight = _.reduce(rowHeights, function(memo, height){
                return memo + height;
            }, 0) / rowHeights.length;

        table.$el.css('marginBottom', meanRowHeight * (data.totalResults - allItems.length));
    }

    _.extend(InfiniTable.prototype, {
        attach: function(table){
            var self = this,
                fetchedLastPage = true,
                allItems = [];

            if(!table.pager){
                throw new Error('infiniTable plugin cannot be used without the pager plugin');
            }

            table.renderFoot = function(data, spec){
                if(!fetchedLastPage){
                    return '';
                }
                return '<tr><td colspan="' + spec.length + '"><span class="loading">Loading more...</span></td></tr>';
            };

            var load = table.load;
            table.load = function(){
                allItems = [];
                load.apply(this, arguments);
            };

            var renderTable = table.renderTable;
            table.renderTable = function(data){
                allItems = allItems.concat(data.items);

                data.items = allItems;

                if(allItems.length >= data.totalResults){
                    fetchedLastPage = false;
                }

                renderTable.call(this, data);

                bindToScrollParent(table);
                ensureScrollHeight(table, data, allItems);
            };

            bindToScrollParent(table);
        }
    });

    return InfiniTable;
});