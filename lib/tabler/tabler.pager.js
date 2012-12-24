(function(root, factory){
    'use strict';
    if(typeof define === 'function' && define.amd){
        define(['jquery', 'underscore'], function($, _){
            return factory($, _);
        });
    }else{
        root.tabler.pager = factory(root.jQuery, root._);
    }
})(this, function($, _){
    'use strict';

    function Pager(options){
        _.extend(this, options || {});
    }
    Pager.pluginName = 'pager';

    function getPageOptions(options, data){
        var pageSize = options.pageSize || 20;
        return {
            pageSize: pageSize,
            currentPage: options.currentPage || 0,
            totalResults: options.totalResults || data.length
        };
    }

    function defaultPager(data, pageOptions, callback){
        var start = pageOptions.currentPage * pageOptions.pageSize,
            end = (pageOptions.currentPage+1) * pageOptions.pageSize;

        callback(_(data).clone().slice(start, end));
    }

    _.extend(Pager.prototype, {
        render: function(data, spec){
            return this.renderPager({
                pager: this
            }, data, spec);
        },
        /*
         * If 'spec' is falsey then we assume we're rendering outside of a tabler (standalone) and don't renders any surrounding tr/td
        **/
        renderPager: function(table, data, spec){
            var pageOptions = getPageOptions(this, table.data),
                pageSize = pageOptions.pageSize,
                currentPage = pageOptions.currentPage,
                totalPages = this.totalPages = Math.ceil(pageOptions.totalResults / pageSize),
                startAt = Math.max(currentPage - 2, 0),
                endAt = Math.min(totalPages, startAt + 6),
                onLastPage = (currentPage === totalPages - 1),
                pagerSpec = [],
                pagerHtml = (spec ? ['<tr>', '<td colspan="' + spec.length + '">'] : []).concat(
                    ['<ol class=pager>']
                );

            if(onLastPage){
                startAt = Math.max(0, endAt - 6);
            }

            if(totalPages > 5 && !onLastPage && endAt >= totalPages - 1){
                startAt = Math.max(startAt - 1, 0);
                endAt--;
            }

            if(currentPage > 0){
                pagerSpec.push({
                    pageIndex: currentPage - 1,
                    className: 'prev',
                    text: 'Previous'
                });

                if(currentPage > 2){
                    if(startAt === 0){
                        startAt++;
                    }
                    pagerSpec.push({
                        pageIndex: 0,
                        className: 'first' + (currentPage > 3 ? ' skipped' : ''),
                        text: 1
                    });
                }
            }

            for(var i = startAt; i < endAt; i++){
                pagerSpec.push({
                    pageIndex: i,
                    className: (i === currentPage ? 'current' : '') + (i === 0 ? ' first' : '') + (i === totalPages - 1 ? ' last' : ''),
                    text: (i+1)
                });
            }

            if(totalPages > 5 && !onLastPage){
                pagerSpec.push({
                    pageIndex: (totalPages - 1),
                    className: 'last' + (currentPage < (totalPages - 4) ? ' skipped' : ''),
                    text: totalPages
                });
            }

            if(currentPage < totalPages - 1){
                pagerSpec.push({
                    pageIndex: (currentPage + 1),
                    className: 'next',
                    text: 'Next'
                });
            }

            _(pagerSpec).each(function(p){
                pagerHtml.push('<li data-page="' + p.pageIndex + '" class="' + p.className + '"><a href>' + p.text + '</a></li>');
            });

            return _.flatten(pagerHtml.concat(['</ol>', spec ? ['</td>', '</tr>'] : []])).join('\n');
        },
        attach: function(table){
            var self = this,
                renderFoot = this.originalRenderFoot = table.renderFoot,
                render = this.originalRender = table.render;

            table.render = function(){
                // this == table, self == pager
                var pageOptions = getPageOptions(self, this.data),
                    pager = self.pager || defaultPager;

                pager.call(this, this.data, pageOptions, function(data){
                    if(render){
                        render.call(table, data);
                    }
                });
            };

            if(renderFoot){
                table.renderFoot = function(data, spec){
                    var html = renderFoot.call(self.table) || '';
                    return html + self.renderPager(this, data, spec);
                };
            }

            table.$el.on('click', 'ol.pager li', function(e){
                e.preventDefault();

                var page = $(e.target).closest('li').data('page');

                self.currentPage = page;

                table.render();
            });
        },
        detach: function(table){
            table.renderFoot = this.originalRenderFoot;
            this.originalRenderFoot = undefined;
            table.render = this.originalRender;
            this.originalRender = undefined;

            table.$el.off('click', 'ol.pager li');
        }
    });

    return Pager;
});