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
            return _(spec).reduce(function(memo, colSpec, colIndex){
                    var lastSpec = memo[memo.length - 1],
                        groupName = colSpec.groupName || '';
                    if(!lastSpec || lastSpec.groupName !== groupName){
                        memo.push({
                            groupName: groupName,
                            count: 1,
                            startColIndex: colIndex
                        });
                    }else{
                        lastSpec.count++;
                    }
                    return memo;
                }, []);
        },
        attach: function(table){
            var self = this,
                renderHead = this.originalRenderHead = table.renderHead,
                renderBody = this.originalRenderBody = table.renderBody,
                renderTable = this.originalRenderTable = table.renderTable;

            this.formatters = {};

            table.renderTable = function(data){
                if(this.spec && _(this.spec).any(function(col){return !!col.groupName;})){
                    this.groupSpecs = self.getColumnGroups(this.spec);
                };
                return renderTable.apply(this, arguments);
            };

            table.renderHead = function(data, spec){
                var head = '',
                    result;

                if(_(spec).any(function(col){return !!col.groupName;})){
                    head += '<tr class=tablecolumngroups>' + _(this.groupSpecs).chain()
                        .map(function(groupSpec){
                            var formatter = self.formatters[groupSpec.groupName] || defaultFormatter,
                                startColSpec = spec[groupSpec.startColIndex];

                            // apply extra classes on column headers
                            startColSpec.oldHeaderClassName = startColSpec.headerClassName;
                            startColSpec.headerClassName = (startColSpec.headerClassName || '') + ' tablecolumnheadergroupstart';

                            return table.makeTag('th', formatter(groupSpec), {
                                colspan: groupSpec.count,
                                'class': 'tablecolumngroupheader ' + groupSpec.groupName.replace(/\s/g, '-').toLowerCase()
                            });
                        })
                        .value().join('\n') + '</tr>';
                }

                result = head + renderHead.apply(this, arguments);

                // restore old class names
                _.each(this.groupSpecs, function(groupSpec){
                    var startColSpec = spec[groupSpec.startColIndex];
                    startColSpec.headerClassName = startColSpec.oldHeaderClassName || startColSpec.headerClassName;
                });

                return result;
            };

            table.renderBody = function(data, spec){
                var result;

                if (self.groupSpecs){
                    _.each(this.groupSpecs, function(groupSpec){
                        var startColSpec = spec[groupSpec.startColIndex];
                        startColSpec.oldClassName = startColSpec.className;
                        startColSpec.className = (startColSpec.className || '') + ' tablecolumngroupstart';
                    });

                    result = renderBody.apply(this, arguments);

                    // restore old class names
                    _.each(this.groupSpecs, function(groupSpec){
                        var startColSpec = spec[groupSpec.startColIndex];
                        startColSpec.className = startColSpec.oldClassName || startColSpec.className;
                    });
                }
                return result;
            };
        },
        detach: function(table){
            table.renderTable = this.originalRenderTable;
            this.originalRenderTable = undefined;
            table.renderHead = this.originalRenderHead;
            this.originalRenderHead = undefined;
            table.renderBody = this.originalRenderBody;
            this.originalRenderBody = undefined;
            this.formatters = {};
        }
    });

    return ColumnGrouper;
});
