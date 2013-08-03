(function(root, factory){
    'use strict';
    if(typeof define === 'function' && define.amd){
        define(['jquery', 'underscore'], function($, _){
            return factory($, _);
        });
    }else{
        root.tabler.toggleColumns = factory(root.jQuery, root._);
    }
})(this, function($, _){
    'use strict';
    var $toggleUI = $(['<div class=toggleColumnsUI>',
                '<h1>Show / Hide Columns</h1>',
                '<form>',
                '   <fieldset>',
                '       <ul class=columns></ul>',
                '   </fieldset>',
                '   <p><button class=apply>Apply</button><a href=# class=cancel>Cancel</a></p>',
                '</form>',
                '</div>'].join('\n'))
        .css({
            position: 'absolute',
            zIndex: '1000',
            left: 0,
            top: 0
        });

    function defaultFormatter(spec){
        return _.escape(spec.name || spec.field || spec.id);
    }

    function defaultGroupFormatter(name){
        return _.escape(name);
    }

    function findNearestScrollingParent($el){
        var $scroller = $(window);
        $el.parents().each(function(i, el){
            var $el = $(el);
            if(['auto', 'scroll'].indexOf($el.css('overflow-y')) > -1 && el.scrollHeight > el.clientHeight){
                $scroller = $el;
                return false;
            }
        });

        return $scroller;
    }

    function checkColumnGroupStatus($columnGroupLi){
        var $columnGroupInput = $columnGroupLi
                .find('input[name=columnGroup]'),
            $allColumns = $columnGroupLi
                .find('input[name=column]'),
            allColumnsChecked = _($allColumns).all(function(el){
                    return el.checked;
                }),
            anyColumnsChecked = _($allColumns).any(function(el){
                    return el.checked;
                });

        $columnGroupInput.removeClass('partiallySelected');

        if(allColumnsChecked){
            $columnGroupInput.prop('checked', true);
        }else if(anyColumnsChecked){
            $columnGroupInput.prop('checked', true)
                .addClass('partiallySelected');
        }else if(!allColumnsChecked){
            $columnGroupInput.prop('checked', false);
        }
    }

    function checkColumns($columnGroupLi){
        var $columnGroupInput = $columnGroupLi
                .find('input[name=columnGroup]'),
            $allColumns = $columnGroupLi
                .find('input[name=column]'),
            wasPartiallySelected = $columnGroupInput.hasClass('partiallySelected');

        if(wasPartiallySelected){
            $columnGroupInput.removeClass('partiallySelected');
            $columnGroupInput.prop('checked', true);
            $allColumns.prop('checked', true);
        }else{
            $allColumns.prop('checked', $columnGroupInput.is(':checked'));
        }
    }

    function detachToggleUI(){
        $toggleUI.detach();
    }

    function hideToggleUIFromClick(e){
        if($(e.target).closest('.toggleColumnsUI,button.showHide').length){
            $('body').one('click', hideToggleUIFromClick);
            return;
        }
        $toggleUI.detach();
    }

    $toggleUI.on('change', 'input', function(e){
        var $input = $(e.target);

        if($input.is('[name=column]')){
            checkColumnGroupStatus($input.parents('li.columnGroup'));
        }else if($input.is('[name=columnGroup]')){
            checkColumns($input.parents('li.columnGroup'));
        }

        $toggleUI.find('button.apply').prop('disabled', ($toggleUI.find('input[type=checkbox]:checked').length === 0));
    });
    $toggleUI.on('click', 'li.columnGroup a.opener', function(e){
        var $a = $(e.target),
            $li = $a.parents('li.columnGroup').eq(0);

        e.preventDefault();

        $li.toggleClass('open')
            .toggleClass('closed');

        $a.html($li.is('.closed') ? '+' : '&ndash;');
    });
    $toggleUI.on('click', 'button.apply', function(e){
        var table = $toggleUI.data('table');

        e.preventDefault();

        $toggleUI.find('input[type=checkbox][name=column]').each(function(i, el){
            var field = table.getField($(el).val()) || table.toggleColumns.getCustomColumn({
                id: $(el).val()
            });

            field.disabled = !$(el).is(':checked');
        });
        $toggleUI.detach();
        table.render();

        table.trigger('columnsToggled');
    });
    $toggleUI.on('click', 'a.cancel', function(e){
        e.preventDefault();

        $toggleUI.detach();
    });

    function ToggleColumns(options){
        this.options = options || {};
    }
    ToggleColumns.pluginName = 'toggleColumns';

    _.extend(ToggleColumns.prototype, {
        getCustomColumn: function(findSpec){
            return _(this.customColumns).find(function(spec){
                return _(findSpec).all(function(value, key){
                    return spec[key] === value;
                });
            });
        },
        attach: function(table){
            var self = this,
                renderHead = this.originalRenderHead = table.renderHead;

            this.table = table;
            this.customColumns = [];
            this.groupFormatters = {};
            this.formatters = {};

            table.renderHead = function(data, spec){
                var html = ['<tr class=toggleColumns>', '<th colspan="' + spec.length + '">',
                        (_.isFunction(self.headerHTML) ? self.headerHTML() : (self.headerHTML || '')),
                        '<button class=showHide>Columns</button>',
                        '</th>', '</tr>'];

                return html.join('\n') + renderHead.apply(this, arguments);
            };

            table.$el.on('click', '.toggleColumns th button.showHide', function(e){
                var $button = $(e.target),
                    buttonOffset;

                if($toggleUI.closest('html').length){
                    $toggleUI.removeData('table');
                    $toggleUI.detach();
                    return;
                }

                findNearestScrollingParent(table.$el)
                    .one('scroll.tablerToggleColumns', detachToggleUI);
                $(window).one('resize.tablerToggleColumns', detachToggleUI);
                $('body').one('click.tablerToggleColumns', hideToggleUIFromClick);

                $toggleUI.data('table', table);
                $toggleUI.find('button.apply').prop('disabled', false);
                $toggleUI.find('ul.columns').html(_(table.toggleColumns.customColumns).chain()
                        .union(table.spec)
                        .filter(function(spec){
                            return spec.toggleable !== false;
                        })
                        .groupBy(function(spec){
                            return spec.groupName || '';
                        })
                        .map(function(group, name){
                            var html = [],
                                id = _.uniqueId('toggleColumnsUIGroup'),
                                anyChecked, allChecked,
                                displayText,
                                groupFormatter;

                            if(name){
                                groupFormatter = self.groupFormatters[name] || defaultGroupFormatter;
                                displayText = groupFormatter(name);

                                anyChecked = _(group).any(function(spec){return !spec.disabled;});
                                allChecked = _(group).all(function(spec){return !spec.disabled;});

                                html.push('<li class="columnGroup closed">');
                                html.push('<a href="#" class="opener">+</a>');
                                html.push('<input name=columnGroup type=checkbox value="" id="' + _.escape(id) + '" ' +
                                        (anyChecked ? 'checked' : '') + ' ' +
                                        (allChecked ? '' : 'class="partiallySelected"') + '/>');
                                html.push('<label for="' + _.escape(id) + '">' + displayText + '</label>');
                                html.push('<ul>');
                            }

                            html = html.concat(_(group).map(function(spec){
                                var id = _.uniqueId('toggleColumnsUIValue'),
                                    columnFormatter = self.formatters[spec.id || spec.field] || defaultFormatter,
                                    displayText = columnFormatter(spec);

                                return ['<li><input name=column type=checkbox value="',
                                            _.escape(spec.id || spec.name),
                                                '" id="', _.escape(id), '" ',
                                                (spec.disabled ? '' : ' checked'),
                                            ' />',
                                            '<label for="',
                                                id,
                                            '">', displayText, '</label>',
                                        '</li>'].join('');
                            }));

                            if(name){
                                html.push('</ul>');
                                html.push('</li>');
                            }

                            return html;
                        })
                        .flatten()
                        .value().join('\n'));

                buttonOffset = $button.offset();
                $toggleUI
                    .appendTo('body')
                    .css({
                        left: buttonOffset.left - $toggleUI.outerWidth() + $button.outerWidth(),
                        top: buttonOffset.top + $button.outerHeight()
                    })
                    .show();
            });
        },
        detach: function(table){
            $toggleUI.detach().removeData('table');

            table.renderHead = this.originalRenderHead;
            this.originalRenderHead = undefined;

            this.table = undefined;
            this.customColumns = [];

            table.$el.off('click', '.toggleColumns th button.showHide');

            findNearestScrollingParent(table.$el).off('scroll.tablerToggleColumns');
            $(window).off('resize.tablerToggleColumns');
            $('body').off('click.tablerToggleColumns');
        }
    });

    return ToggleColumns;
});
