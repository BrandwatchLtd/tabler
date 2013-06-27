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

        this.formatters = this.options.formatters || {};
        this.headerCellClassNames = this.options.headerCellClassNames || {};
        this.firstCellInGroupClassName = this.options.firstCellInGroupClassName;
        this.lastCellInGroupClassName = this.options.lastCellInGroupClassName;
    }
    ColumnGrouper.pluginName = 'columnGrouper';

    _.extend(ColumnGrouper.prototype, {
        getColumnGroups: function(spec){
            return _(spec).reduce(function(memo, colSpec){
                    var lastSpec = memo[memo.length - 1],
                        groupName = colSpec.groupName || '';
                    if(!lastSpec || lastSpec.groupName !== groupName){
                        memo.push({
                            columns: [colSpec],
                            groupName: groupName,
                            count: 1
                        });
                    }else{
                        lastSpec.count++;
                        lastSpec.columns.push(colSpec);
                    }
                    return memo;
                }, []);
        },
        attach: function(table){
            var self = this,
                renderHead = this.originalRenderHead = table.renderHead,
                makeHeaderAttrs = this.originalMakeHeaderAttrs = table.makeHeaderAttrs,
                makeColumnAttrs = this.originalMakeColumnAttrs = table.makeColumnAttrs;

            function isFirstColumnInGroup(colSpec){
                return _(self.columnGroupsSpec).any(function(groupSpec){
                    return _.isEqual(_.first(groupSpec.columns), colSpec);
                });
            }
            function isLastColumnInGroup(colSpec){
                return _(self.columnGroupsSpec).any(function(groupSpec){
                    return _.isEqual(_.last(groupSpec.columns), colSpec);
                });
            }

            table.renderHead = function(data, spec){
                var head = '';

                self.columnGroupsSpec = self.getColumnGroups(spec);

                if(_(spec).any(function(col){return !!col.groupName;})){
                    head += '<tr class=columnGroups>' + _(self.columnGroupsSpec).chain()
                        .map(function(groupSpec){
                            var formatter = self.formatters[groupSpec.groupName] || defaultFormatter,
                                className = self.headerCellClassNames[groupSpec.groupName] || '';

                            return table.makeTag('th', formatter(groupSpec), {
                                colspan: groupSpec.count,
                                'class': className || groupSpec.groupName.replace(/\s/g, '-').toLowerCase()
                            });
                        })
                        .value().join('\n') + '</tr>';
                }
                return head + renderHead.apply(this, arguments);
            };
            table.makeHeaderAttrs = function(colSpec){
                if(self.firstCellInGroupClassName && isFirstColumnInGroup(colSpec)){
                    colSpec.headerClassName = (colSpec.headerClassName || '') + ' ' + self.firstCellInGroupClassName;
                }
                if(self.lastCellInGroupClassName && isLastColumnInGroup(colSpec)){
                    colSpec.headerClassName = (colSpec.headerClassName || '') + ' ' + self.lastCellInGroupClassName;
                }

                return makeHeaderAttrs.apply(this, arguments);
            };
            table.makeColumnAttrs = function(colSpec){
                if(self.firstCellInGroupClassName && isFirstColumnInGroup(colSpec)){
                    colSpec.className = (colSpec.className || '') + ' ' + self.firstCellInGroupClassName;
                }
                if(self.lastCellInGroupClassName && isLastColumnInGroup(colSpec)){
                    colSpec.className = (colSpec.className || '') + ' ' + self.lastCellInGroupClassName;
                }

                return makeColumnAttrs.apply(this, arguments);
            };
        },
        detach: function(table){
            table.renderHead = this.originalRenderHead;
            table.makeHeaderAttrs = this.originalMakeHeaderAttrs;
            table.makeColumnAttrs = this.originalMakeColumnAttrs;
            this.originalRenderHead = undefined;
            this.originalMakeHeaderAttrs = undefined;
            this.originalMakeColumnAttrs = undefined;
            this.formatters = {};
        }
    });

    return ColumnGrouper;
});
