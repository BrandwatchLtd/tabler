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
        return _.escape(groupSpec.groupName);
    }

    function ColumnGrouper(options){
        this.options = options || {};

        this.formatters = this.options.formatters || {};
        this.headerCellClassNames = this.options.headerCellClassNames || {};
        this.groupHeaderCellClassName = this.options.groupHeaderCellClassName;
        this.firstCellInGroupClassName = this.options.firstCellInGroupClassName;
        this.lastCellInGroupClassName = this.options.lastCellInGroupClassName;
    }
    ColumnGrouper.pluginName = 'columnGrouper';

    _.extend(ColumnGrouper.prototype, {
        getColumnGroups: function(spec){
            return _([].concat(spec)).reduce(function(memo, colSpec){
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

                            className = className || groupSpec.groupName.replace(/\s/g, '-').toLowerCase();
                            className += ' ' + (self.groupHeaderCellClassName || '');

                            return table.makeTag('th', formatter(groupSpec, table), {
                                colspan: groupSpec.count,
                                'class': className.trim()
                            });
                        })
                        .value().join('\n') + '</tr>';
                }
                return head + renderHead.apply(this, arguments);
            };
            table.makeHeaderAttrs = function(colSpec){
                var attrs = makeHeaderAttrs.apply(this, arguments),
                    className = attrs['class'];

                if(self.firstCellInGroupClassName && isFirstColumnInGroup(colSpec)){
                    className += ' ' + self.firstCellInGroupClassName;
                }
                if(self.lastCellInGroupClassName && isLastColumnInGroup(colSpec)){
                    className += ' ' + self.lastCellInGroupClassName;
                }

                attrs['class'] = className.trim();

                return attrs;
            };
            table.makeColumnAttrs = function(colSpec){
                var attrs = makeColumnAttrs.apply(this, arguments),
                    className = attrs['class'];

                if(self.firstCellInGroupClassName && isFirstColumnInGroup(colSpec)){
                    className += ' ' + self.firstCellInGroupClassName;
                }
                if(self.lastCellInGroupClassName && isLastColumnInGroup(colSpec)){
                    className += ' ' + self.lastCellInGroupClassName;
                }

                attrs['class'] = className.trim();

                return attrs;
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
