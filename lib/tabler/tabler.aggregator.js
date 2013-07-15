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
            var aggregates = this.aggregates = {},
                formatValue = this.originalFormatValue = table.formatValue;
            table.formatValue = function(row, colSpec, index){
                var aggregator = colSpec.aggregator,
                    value = row[colSpec.field];

                if(aggregator){
                    aggregates[colSpec.field] = aggregator.call(this, aggregates[colSpec.field], value, index);
                }

                return formatValue.apply(this, arguments);
            };

            var render = this.originalRender = table.render;
            table.render = function(){
                _(this.spec).forEach(function(spec){
                    aggregates[spec.field] = 0;
                });
                render.apply(this, arguments);
            };

            var renderFoot = this.originalRenderFoot = table.renderFoot;
            table.renderFoot = function(data, spec){
                var foot = renderFoot.apply(this, arguments);
                if(_(spec).any(function(col){return !!col.aggregator;})){
                    foot = [table.renderFootTr()].concat(_(spec).map(function(spec){
                            if(spec.aggregatorText){
                                return table.makeTag('td', spec.aggregatorText, table.makeColumnAttrs(spec));
                            }
                            if(spec.aggregator){
                                return table.makeTag('td', aggregates[spec.field], table.makeColumnAttrs(spec));
                            }
                            return table.makeTag('td', null, table.makeColumnAttrs(spec));
                        })).concat('</tr>')
                        .join('\n');
                }
                return foot;
            };
        },
        detach: function(table){
            table.render = this.originalRender;
            this.originalRender = undefined;
            table.renderFoot = this.originalRenderFoot;
            this.originalRenderFoot = undefined;
            table.formatValue = this.originalFormatValue;
            this.originalFormatValue = undefined;
        }
    });

    return Aggregator;
});
