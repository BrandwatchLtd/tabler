(function(root, factory){
    'use strict';
    if(typeof define === 'function' && define.amd){
        define(['jquery', 'underscore'], function($, _){
            return factory($, _);
        });
    }else{
        root.tabler.pageSize = factory(root.jQuery, root._);
    }
})(this, function($, _){
    'use strict';

    function PageSize(options){
        _.extend(this, options || {});
    }
    PageSize.pluginName = 'pageSize';

    _.extend(PageSize.prototype, {
        render: function(){
            var sizes = this.sizes || [20, 50, 100],
                pager = this.pager,
                id = _.uniqueId('tabler-pageSize'),
                html = [
                    '<p class=pageSize>',
                    '<label for="' + id + '">' + (this.beforeText || 'Show') + '</label>',
                    '<select id="' + id + '">'
                ];

            _(sizes).forEach(function(size){
                html.push('<option value="' + size + '"' + (size === pager.pageSize ? 'selected' : '') + '>' + size + '</option>');
            });

            html = html.concat(['</select>', '<span>' + (this.afterText || 'items / page') + '</span></p>']);

            return html.join('\n');
        },
        attach: function(table){
            var self = this;
            if(!table.pager){
                throw new Error('pageSize plugin cannot be used without the pager plugin');
            }
            this.pager = table.pager;

            var renderPager = this.originalRenderPager = this.pager.renderPager;
            table.pager.renderPager = function(){
                var pager = renderPager.apply(this, arguments),
                    html = self.render();

                return pager.replace('</td>', html + '</td>');
            };

            table.$el.on('change', 'p.pageSize select', function(){
                var $select = $(this),
                    val = $select.val();

                self.pager.updatePaging({
                    currentPage: 0,
                    pageSize: parseInt(val, 10)
                });
            });
        },
        detach: function(table){
            this.pager = undefined;
            this.pager.renderPager = this.originalRenderPager;
            this.originalRenderPager = undefined;

            table.$el.off('change', 'p.pageSize select');
        }
    });

    return PageSize;
});