(function(root, factory){
    'use strict';
    if(typeof define === 'function' && define.amd){
        define(['jquery', 'underscore'], function($, _){
            return factory($, _);
        });
    }else{
        root.tabler.columnGrouper = factory(root.jQuery, root._);
    }
})(this, function($, _){
    'use strict';

    function defaultFormatter(groupSpec){
        return groupSpec.groupName;
    }

    function ColumnGrouper(options){
        this.options = options || {};
    }
    ColumnGrouper.pluginName = 'columnGrouper';

    _.extend(ColumnGrouper.prototype, {
        getColumnGroups: function(spec){
            return _(spec).reduce(function(memo, colSpec){
                    var lastSpec = memo[memo.length - 1],
                        groupName = colSpec.groupName || '';
                    if(!lastSpec || lastSpec.groupName !== groupName){
                        memo.push({
                            groupName: groupName,
                            count: 1
                        });
                    }else{
                        lastSpec.count++;
                    }
                    return memo;
                }, []);
        },
        attach: function(table){
            var self = this,
                renderHead = table.renderHead;

            this.formatters = {};

            table.renderHead = function(data, spec){
                var head = '';
                if(_(spec).any(function(col){return !!col.groupName;})){
                    head += '<tr class=columnGroups>' + _(self.getColumnGroups(spec)).chain()
                        .map(function(groupSpec){
                            var formatter = self.formatters[groupSpec.groupName] || defaultFormatter;

                            return table.makeTag('th', formatter(groupSpec), {
                                colspan: groupSpec.count,
                                'class': groupSpec.groupName.replace(/\s/g, '-').toLowerCase()
                            });
                        })
                        .value().join('\n') + '</tr>';
                }
                return head + renderHead.apply(this, arguments);
            };
        }
    });

    return ColumnGrouper;
});