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

        this.pageSize = this.pageSize || 20;
        this.currentPage = this.currentPage || 0;
        this.hideWhenOnePage = this.hideWhenOnePage || false;
    }
    Pager.pluginName = 'pager';

    function defaultPager(data, options, callback){
        var start = options.currentPage * options.pageSize,
            end = (options.currentPage+1) * options.pageSize;

        data.items = _(data.items).clone().slice(start, end);
        callback(data);
    }

    _.extend(Pager.prototype, {
        render: function(data, spec){
            data = data || {items:[]};

            data.currentPage = this.currentPage || 0;
            data.pageSize = this.pageSize;
            data.totalResults = data.totalResults || this.totalResults || 0;

            return this.renderPager({
                pager: this
            }, data, spec);
        },
        /*
         * If 'spec' is falsey then we assume we're rendering outside of a tabler (standalone) and don't renders any surrounding tr/td
        **/
        renderPager: function(table, data, spec){
            var pageSize = this.pageSize,
                currentPage = this.currentPage,
                totalResults = data.totalResults || data.items.length,
                totalPages = this.totalPages = Math.ceil(totalResults / pageSize),
                startAt = Math.max(currentPage - 2, 0),
                endAt = Math.min(totalPages, startAt + 6),
                onLastPage = (currentPage === totalPages - 1),
                pagerSpec = [],
                cssClass = this.cssClass ? 'pager ' + this.cssClass : 'pager',
                pagerHtml = (spec ? [table.renderFootTr(), '<td colspan="' + spec.length + '">'] : []).concat(
                    ['<ol class="'+ cssClass + '">']
                );

            if(this.hideWhenOnePage && totalPages < 2){
                return '';
            }

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
                        className: 'first' + (startAt > 1 ? ' skipped' : ''),
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
                    className: 'last' + (endAt < totalPages - 1 ? ' skipped' : ''),
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
        updatePaging: function(pageOptions){
            if(_.isNumber(pageOptions.currentPage)){
                this.currentPage = pageOptions.currentPage;
            }
            if(_.isNumber(pageOptions.pageSize)){
                this.pageSize = pageOptions.pageSize;
            }

            this.table.render();

            if(this.table.trigger){
                this.table.trigger('paged', {
                    currentPage: this.currentPage,
                    pageSize: this.pageSize
                });
            }
        },
        attach: function(table){
            var self = this,
                renderFoot = this.originalRenderFoot = table.renderFoot,
                doFetch = table._doFetch;

            this.table = table;

            table._doFetch = function(options, callback){
                var table = this;
                doFetch.call(table, options, function(data){
                    defaultPager(data, options, function(data){
                        callback(data);
                    });
                });
            };

            var getFetchOptions = table.getFetchOptions;
            table.getFetchOptions = function(){
                return _.extend(getFetchOptions.call(this), {
                    currentPage: self.currentPage,
                    pageSize: self.pageSize
                });
            };

            if(!table.render){   // Standalone
                table.render = function(){
                    this.fetch({
                        currentPage: self.currentPage,
                        pageSize: self.pageSize
                    }, function(data){
                        self.render(data);
                    });
                };
            }

            if(table.renderFoot){
                table.renderFoot = function(data, spec){
                    var html = renderFoot.call(this) || '';
                    return html + self.renderPager(this, data, spec);
                };
            }

            table.$el.on('click', 'ol.pager li', function(e){
                e.preventDefault();

                var page = $(e.target).closest('li').data('page');

                self.updatePaging({
                    currentPage: page
                });
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
