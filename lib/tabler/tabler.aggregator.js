(function(root, factory){
    'use strict';
    if(typeof define === 'function' && define.amd){
        define(['jquery', 'underscore'], function($, _){
            return factory($, _);
        });
    }else{
        root.tabler.aggregator = factory(root.jQuery, root._);
    }
})(this, function($, _){
    'use strict';

    function Aggregator(options){
        this.options = options || {};
    }
    Aggregator.pluginName = 'aggregator';

    _.extend(Aggregator.prototype, {
        attach: function(table){
            var formatValue = table.formatValue;
            table.formatValue = function(table, row, colSpec, index){
                var aggregator = colSpec.aggregator,
                    value = row[colSpec.field];

                if(aggregator){
                    colSpec._memo = aggregator.call(table, colSpec._memo, value, index);
                }

                return formatValue.apply(this, arguments);
            };

            var render = table.render;
            table.render = function(){
                _(this.spec).forEach(function(spec){
                    spec._memo = 0;
                });
                render.apply(this, arguments);
            };

            var renderFoot = table.renderFoot;
            table.renderFoot = function(data, spec){
                var foot = renderFoot.apply(this, arguments);
                if(_(spec).any(function(col){return !!col.aggregator;})){
                    foot = ['<tr>'].concat(_(spec).map(function(spec){
                            if(spec.aggregatorText){
                                return table.makeTag('td', spec.aggregatorText, table.makeColumnAttrs(spec));
                            }
                            if(spec.aggregator){
                                return table.makeTag('td', spec._memo, table.makeColumnAttrs(spec));
                            }
                            return '<td></td>';
                        })).concat('</tr>')
                        .join('\n');
                }
                return foot;
            };
        }
    });

    return Aggregator;
});