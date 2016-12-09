(function(root, factory){
    'use strict';
    if(typeof define === 'function' && define.amd){
        define(['jquery', 'underscore'], function($, _){
            return factory($, _);
        });
    }else{
        root.tabler.jumpToPage = factory(root.jQuery, root._);
    }
})(this, function($, _){
    'use strict';

    function JumpToPage(options){
        _.extend(this, options || {});
    }
    JumpToPage.pluginName = 'jumpToPage';

    _.extend(JumpToPage.prototype, {
        render: function(){
            var id = _.uniqueId('tabler-jumpToPage'),
                html = ['<p class=jumpToPage>', '<label for="' + id + '">Jump to page</label>', '<input id="' + id + '" type="text" />'];

            html = html.concat(['</select>', '<button>Go</button></p>']);

            return html.join('\n');
        },
        attach: function(table){
            var self = this;
            if(!table.pager){
                throw new Error('jumpToPage plugin cannot be used without the pager plugin');
            }
            this.pager = table.pager;

            var renderPager = this.originalRenderPager = this.pager.renderPager;
            table.pager.renderPager = function(){
                var pager = renderPager.apply(this, arguments),
                    html = self.render();

                return pager.replace('</ol>', '</ol>' + html);
            };

            var renderStandalonePager = this.originalRenderStandalonePager = this.pager.renderStandalonePager;
            table.pager.renderStandalonePager = function(){
                var pager = renderStandalonePager.apply(this, arguments);
                var html = self.render();

                pager.append(html)
                self.attachEvents(pager);
                return pager;
            };

            this.attachEvents(table.$el);
        },
        attachEvents: function($container){
            var self = this;
            function updatePageIndex($parent){
                var $input = $parent.find('input'),
                    val = $input.val();

                if(!val){
                    return;
                }
                val = parseInt(val, 10);
                if(_.isNaN(val) || val < 1){
                    $input.addClass('invalid');
                    return;
                }
                $input.removeClass('invalid');

                val = Math.min(val, self.pager.totalPages) - 1;

                self.pager.updatePaging({
                    currentPage: val
                });
            }

            $container.on('click', 'p.jumpToPage button', function(e){
                updatePageIndex($(this).parent());
            });
            $container.on('keydown', 'p.jumpToPage input', function(e){
                if(e.which === 13){-
                    e.preventDefault();

                    updatePageIndex($(this).parent());
                }
            });
        },
        detach: function(table){
            table.$el.off('click', 'p.jumpToPage button');
            table.$el.off('keydown', 'p.jumpToPage input');

            if(this.pager.$pagerEl) {
                this.pager.$pagerEl.off('click', 'p.jumpToPage button');
                this.pager.$pagerEl.off('keydown', 'p.jumpToPage input');
            }

            this.pager.renderPager = this.originalRenderPager;
            this.pager.renderStandalonePager = this.originalRenderStandalonePager;
            this.pager = undefined;
        }
    });

    return JumpToPage;
});