(function(root, factory){
    'use strict';
    if(typeof define === 'function' && define.amd){
        define([], function(){
            return factory(root.jQuery, root._);
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
        renderPager: function(table, data, spec){
            var pageOptions = getPageOptions(this, table.data),
                pageSize = pageOptions.pageSize,
                currentPage = pageOptions.currentPage,
                totalPages = this.totalPages = Math.ceil(pageOptions.totalResults / pageSize),
                startAt = Math.max(currentPage - 2, 0),
                endAt = Math.min(totalPages, startAt + 6),
                onFirstPage = (currentPage === 0),
                onLastPage = (currentPage === totalPages - 1),
                foot = (spec ? ['<tr>', '<td colspan="' + spec.length + '">'] : []).concat(
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
                foot.push('<li data-page="' + (currentPage - 1) + '" class=prev><a href="#">Previous</a></li>');

                if(currentPage > 2){
                    if(startAt === 0){
                        startAt++;
                    }
                    foot.push('<li data-page="0" class=first><a href="#">1</a></li>');
                }
            }

            for(var i = startAt; i < endAt; i++){
                foot.push('<li data-page="' + i + '"' + (i === currentPage ? ' class=current' : '') + '><a href="#">' + (i+1) + '</a></li>');
            }

            if(totalPages > 5 && !onLastPage){
                foot.push('<li data-page="' + (totalPages - 1) + '" class=last><a href="#">' + totalPages + '</a></li>');
            }

            if(currentPage < totalPages - 1){
                foot.push('<li data-page="' + (currentPage + 1) + '" class=next><a href="#">Next</a></li>');
            }

            return _.flatten(foot.concat(['</ol>', spec ? ['</td>', '</tr>'] : []])).join('\n');
        },
        attach: function(instance){
            var self = this,
                renderFoot = instance.renderFoot,
                render = instance.render;

            instance.render = function(){
                // this == table, self == pager
                var pageOptions = getPageOptions(self, this.data),
                    pager = self.pager || defaultPager;

                pager.call(this, this.data, pageOptions, function(data){
                    if(render){
                        render.call(instance, data);
                    }
                });
            };

            if(renderFoot){
                instance.renderFoot = function(data, spec){
                    var html = renderFoot.call(self.table) || '';
                    return html + self.renderPager(this, data, spec);
                };
            }

            instance.$el.delegate('ol.pager li', 'click', function(e){
                e.preventDefault();

                var page = $(e.target).closest('li').data('page');

                self.currentPage = page;

                instance.render();
            });
        }
    });

    return Pager;
});