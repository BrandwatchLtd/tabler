(function(root, factory){
    'use strict';
    if(typeof define === 'function' && define.amd){
        define([], function(){
            return factory(root.jQuery, root._);
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
                .find('input[name=column]');

        $columnGroupInput.removeClass('partiallySelected');
        $allColumns.prop('checked', $columnGroupInput.is(':checked'));
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

    $toggleUI.delegate('input', 'change', function(e){
        var $input = $(e.target);

        $toggleUI.find('button.apply').prop('disabled', false);
        if($input.is('[name=column]')){
            checkColumnGroupStatus($input.parents('li.columnGroup'));
        }else if($input.is('[name=columnGroup]')){
            checkColumns($input.parents('li.columnGroup'));
        }

        if($toggleUI.find('input[type=checkbox]:checked').length === 0){
            $toggleUI.find('button.apply').prop('disabled', true);
        }
    });
    $toggleUI.delegate('li.columnGroup a.opener', 'click', function(e){
        var $a = $(e.target),
            $li = $a.parents('li.columnGroup').eq(0);

        e.preventDefault();

        $li.toggleClass('open')
            .toggleClass('closed');

        $a.html($li.is('.closed') ? '+' : '&ndash;');
    });
    $toggleUI.delegate('button.apply', 'click', function(e){
        var table = $toggleUI.data('table');

        e.preventDefault();

        $toggleUI.find('input[type=checkbox][name=column]').each(function(i, el){
            var field = table.getField($(el).val() || undefined);

            field.disabled = !$(el).is(':checked');
        });
        $toggleUI.detach();
        table.render();

        table.trigger('columnsToggled');
    });
    $toggleUI.delegate('a.cancel', 'click', function(e){
        e.preventDefault();

        $toggleUI.detach();
    });

    function ToggleColumns(options){
        this.options = options || {};
    }
    ToggleColumns.pluginName = 'toggleColumns';

    _.extend(ToggleColumns.prototype, {
        attach: function(table){
            var self = this,
                destroy = table.destroy,
                renderHead = table.renderHead;

            this.table = table;

            table.renderHead = function(data, spec){
                var html = ['<tr class=toggleColumns>', '<th colspan="' + spec.length + '">',
                        (self.headerHTML || ''),
                        '<button class=showHide>Columns</button>',
                        '</th>', '</tr>'];

                return html.join('\n') + renderHead.apply(this, arguments);
            };
            table.destroy = function(){
                $toggleUI.detach().removeData('table');

                destroy.apply(this, arguments);
            };

            table.$el.delegate('.toggleColumns th button.showHide', 'click', function(e){
                var $button = $(e.target),
                    buttonOffset;

                if($toggleUI.closest('html').length){
                    $toggleUI.removeData('table');
                    $toggleUI.detach();
                    return;
                }

                findNearestScrollingParent(table.$el)
                    .one('scroll', detachToggleUI);
                $(window).one('resize', detachToggleUI);
                $('body').one('click', hideToggleUIFromClick);

                $toggleUI.data('table', table);
                $toggleUI.find('button.apply').prop('disabled', false);
                $toggleUI.find('ul.columns').html(_(table.spec).chain()
                        .filter(function(spec){
                            return spec.toggleable !== false;
                        })
                        .groupBy(function(spec){
                            return spec.groupName || '';
                        })
                        .map(function(group, name){
                            var html = [],
                                id = _.uniqueId('toggleColumnsUIGroup'),
                                anyChecked, allChecked;

                            if(name){
                                anyChecked = _(group).any(function(spec){return !spec.disabled;});
                                allChecked = _(group).all(function(spec){return !spec.disabled;});

                                html.push('<li class="columnGroup closed">');
                                html.push('<a href="#" class="opener">+</a>');
                                html.push('<input name=columnGroup type=checkbox value="" id="' + id + '" ' +
                                        (anyChecked ? 'checked' : '') + ' ' +
                                        (allChecked ? '' : 'class="partiallySelected"') + '/>');
                                html.push('<label for="' + id + '">' + name + '</label>');
                                html.push('<ul>');
                            }

                            html = html.concat(_(group).map(function(spec){
                                var id = _.uniqueId('toggleColumnsUIValue');
                                return ['<li><input name=column type=checkbox value="', spec.field, '" id="', id, '" ',
                                                (spec.disabled ? '' : ' checked'),
                                            ' />',
                                            '<label for="',
                                                id,
                                            '">', (spec.name || spec.field), '</label>',
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
        }
    });

    return ToggleColumns;
});