define([
        'lib/tabler/tabler',
        'lib/tabler/tabler.toggleColumns'],
    function(tabler,
        toggleColumns){
    'use strict';
    describe('tabler.toggleColumns', function(){
        var table;
        afterEach(function(){
            if(table){
                table.destroy();
                table = undefined;
            }
        });
        beforeEach(function(){
            table = tabler.create([
                {field: 'column1'},
                {field: 'column2'}
            ], {plugins: [toggleColumns]});

            table.load([
                {column1: 30, column2: 200},
                {column1: 10, column2: 400},
                {column1: 20, column2: 600}
            ]);
            table.render();
        });
        it('adds header row containing toggle button', function(){
            expect(table.toggleColumns).toBeDefined();
            expect(table.$('thead tr:first').hasClass('toggleColumns')).toEqual(true);
            expect(table.$('thead tr:first th').length).toEqual(1);
            expect(table.$('thead tr:first th').attr('colspan')).toEqual('2');
            expect(table.$('thead tr:first button').text()).toEqual('Columns');
        });
        it('can specify headerHTML to go alongside button', function(){
            table.toggleColumns.headerHTML = '<p>Hello there</p>';
            table.render();

            expect(table.$('thead tr.toggleColumns th p').text()).toEqual('Hello there');
        });
        it('can specify a function for the headerHTML', function(){
            table.toggleColumns.headerHTML = function(){
                return '<p>Hello there again</p>';
            };
            table.render();

            expect(table.$('thead tr.toggleColumns th p').text()).toEqual('Hello there again');
        });
        it('calls headerHTML function on every render', function(){
            var i = 0;
            table.toggleColumns.headerHTML = function(){
                return '<p>Hello there again ' + (++i) + '</p>';
            };
            table.render();
            table.render();
            table.render();

            expect(table.$('thead tr.toggleColumns th p').text()).toEqual('Hello there again 3');
        });
        it('shows toggle UI on button click', function(){
            table.$('tr.toggleColumns button').click();

            expect($('.toggleColumnsUI').length).toEqual(1);
            expect($('.toggleColumnsUI button.apply').length).toEqual(1);

            expect($('.toggleColumnsUI').css('position')).toEqual('absolute');
            expect($('.toggleColumnsUI').css('zIndex').toString()).toEqual('1000');
        });
        it('hides toggle UI on button click', function(){
            table.$('tr.toggleColumns button').click();
            table.$('tr.toggleColumns button').click();

            expect($('.toggleColumnsUI').length).toEqual(0);
        });
        it('hides toggle UI on body click', function(){
            table.$('tr.toggleColumns button').click();

            $('body').click();

            expect($('.toggleColumnsUI').length).toEqual(0);
        });
        it('hides toggle UI on window resize', function(){
            table.$('tr.toggleColumns button').click();

            $(window).resize();

            expect($('.toggleColumnsUI').length).toEqual(0);
        });
        it('hides toggle UI when scrollParent scrolls', function(){
            var $div = $('<div />').css({
                    overflow: 'scroll',
                    width: 100,
                    height: 100
                }).appendTo('#testArea')
                .html(table.$el);

            table.$el.css({
                height:1000,
                width:1000
            });

            table.$('tr.toggleColumns button').click();

            $div.scroll();

            expect($('.toggleColumnsUI').length).toEqual(0);
        });
        it('does not hide toggle UI on click of showHide button', function(){
            $('#testArea').html(table.$el);
            table.$('button.showHide').click();

            expect($('.toggleColumnsUI').length).toEqual(1);
        });
        it('does not hide toggle UI on click of toggleColumns UI', function(){
            $('#testArea').html(table.$el);

            table.$('button.showHide').click();
            $('.toggleColumnsUI').click();

            expect($('.toggleColumnsUI').length).toEqual(1);
        });
        it('does not hide toggle UI on click inside toggleColumns UI', function(){
            $('#testArea').html(table.$el);

            table.$('button.showHide').click();
            $('.toggleColumnsUI > *').eq(0).click();

            expect($('.toggleColumnsUI').length).toEqual(1);
        });

        it('has one li for each column in toggle UI', function(){
            table.$('tr.toggleColumns button').click();

            expect($('.toggleColumnsUI .columns li input[type=checkbox]').length).toEqual(2);
            expect($('.toggleColumnsUI .columns li input[type=checkbox]').eq(0).val()).toEqual('column1');
            expect($('.toggleColumnsUI .columns li input[type=checkbox]').eq(0).is(':checked')).toEqual(true);
            expect($('.toggleColumnsUI .columns li input[type=checkbox]').eq(0).siblings('label').text()).toEqual('column1');
            expect($('.toggleColumnsUI .columns li input[type=checkbox]').eq(1).val()).toEqual('column2');
            expect($('.toggleColumnsUI .columns li input[type=checkbox]').eq(1).is(':checked')).toEqual(true);
            expect($('.toggleColumnsUI .columns li input[type=checkbox]').eq(1).siblings('label').text()).toEqual('column2');
        });
        it('can specify formatter for column in toggle UI', function(){
            table.toggleColumns.formatters.column1 = function(spec){
                return '<b>' + spec.field + '</b>';
            };
            table.$('tr.toggleColumns button').click();

            expect($('.toggleColumnsUI .columns li input[type=checkbox]').eq(0).siblings('label').html()).toEqual('<b>column1</b>');
        });
        it('can have columns un-toggleable', function(){
            table.spec[0].toggleable = false;

            table.$('tr.toggleColumns button').click();

            expect($('.toggleColumnsUI .columns li input[type=checkbox]').length).toEqual(1);
            expect($('.toggleColumnsUI .columns li input[type=checkbox]').eq(0).val()).toEqual('column2');
        });
        it('shows disabled columns unchecked', function(){
            table.spec[0].disabled = true;

            table.$('tr.toggleColumns button').click();

            expect($('.toggleColumnsUI .columns li input[type=checkbox]').eq(0).is(':checked')).toEqual(false);
            expect($('.toggleColumnsUI .columns li input[type=checkbox]').eq(1).is(':checked')).toEqual(true);
        });
        it('can toggle off a column and the change is applied when "Apply" pressed', function(){
            table.$('tr.toggleColumns button').click();

            $('.toggleColumnsUI .columns li input[type=checkbox]').attr('checked', false);
            $('.toggleColumnsUI button.apply').click();

            expect(table.spec[0].disabled).toEqual(true);
            expect(table.spec[1].disabled).toEqual(true);
        });
        it('can toggle columns back on again', function(){
            table.spec[0].disabled = true;

            table.$('tr.toggleColumns button').click();

            $('.toggleColumnsUI .columns li input[type=checkbox]').prop('checked', true);
            $('.toggleColumnsUI button.apply').click();

            expect(table.spec[0].disabled).toEqual(false);
            expect(table.spec[1].disabled).toEqual(false);
        });
        it('removes the toggleColumns UI and re-renders the table when "Apply" pressed', function(){
            var renderSpy = sinon.spy(table, 'render');

            table.$('tr.toggleColumns button').click();
            $('.toggleColumnsUI button.apply').click();

            expect($('.toggleColumnsUI').length).toEqual(0);
            expect(renderSpy.calledOnce).toEqual(true);

            renderSpy.restore();
        });
        it('triggers columnsToggled event when "Apply" pressed', function(){
            var renderSpy = sinon.spy(table, 'render'),
                columnsToggledSpy = sinon.spy();

            table.bind('columnsToggled', columnsToggledSpy);

            table.$('tr.toggleColumns button').click();
            $('.toggleColumnsUI button.apply').click();

            expect(columnsToggledSpy.calledOnce).toEqual(true);

            renderSpy.restore();
        });
        it('disables the "Apply" button when no columns checked', function(){
            var renderSpy = sinon.spy(table, 'render');

            table.$('tr.toggleColumns button').click();

            $('.toggleColumnsUI .columns li input[type=checkbox]')
                .prop('checked', false)
                .trigger('change');

            expect($('.toggleColumnsUI').length).toEqual(1);
            expect($('.toggleColumnsUI button').is(':disabled')).toEqual(true);

            expect(table.spec[0].disabled).not.toEqual(true);
            expect(table.spec[1].disabled).not.toEqual(true);
            expect(renderSpy.called).toEqual(false);

            renderSpy.restore();
        });
        it('removes the toggleColumns UI when "Cancel" pressed and does not apply changes to table', function(){
            var renderSpy = sinon.spy(table, 'render');

            table.spec[0].disabled = true;

            table.$('tr.toggleColumns button').click();

            $('.toggleColumnsUI .columns li input[type=checkbox]').prop('checked', true);
            $('.toggleColumnsUI a.cancel').click();

            expect($('.toggleColumnsUI').length).toEqual(0);

            expect(table.spec[0].disabled).toEqual(true);
            expect(renderSpy.called).toEqual(false);

            renderSpy.restore();
        });
        it('can toggle columns without a field name', function(){
            var renderSpy = sinon.spy(table, 'render');

            table.addToSpec({name: 'No field', disabled: true});

            table.$('tr.toggleColumns button').click();

            $('.toggleColumnsUI .columns li input[type=checkbox]')
                .prop('checked', true);

            $('.toggleColumnsUI button.apply').click();

            expect(table.spec[0].disabled).not.toEqual(true);
            expect(table.spec[1].disabled).not.toEqual(true);
            expect(table.spec[2].disabled).not.toEqual(true);
            expect(renderSpy.calledOnce).toEqual(true);

            renderSpy.restore();
        });

        describe('column groups', function(){
            beforeEach(function(){
                table.spec[0].groupName = 'Group 1';
                table.spec[1].groupName = 'Group 1';

                table.render();
            });
            it('shows toggle UI divided up by column group', function(){
                table.$('tr.toggleColumns button').click();

                expect($('.toggleColumnsUI ul.columns li').length).toEqual(3);
                expect($('.toggleColumnsUI ul.columns > li').length).toEqual(1);
                expect($('.toggleColumnsUI ul.columns > li input').val()).toEqual('');
                expect($('.toggleColumnsUI ul.columns > li input').is(':checked')).toEqual(true);
                expect($('.toggleColumnsUI ul.columns > li li').length).toEqual(2);
                expect($('.toggleColumnsUI ul.columns > li li input').eq(0).val()).toEqual('column1');
                expect($('.toggleColumnsUI ul.columns > li li input').eq(0).is(':checked')).toEqual(true);
                expect($('.toggleColumnsUI ul.columns > li li input').eq(1).val()).toEqual('column2');
                expect($('.toggleColumnsUI ul.columns > li li input').eq(1).is(':checked')).toEqual(true);
            });
            it('can specify formatter for column group in toggle UI', function(){
                table.toggleColumns.groupFormatters['Group 1'] = function(name){
                    return '<b>' + name + '</b>';
                };
                table.$('tr.toggleColumns button').click();
                expect($('.toggleColumnsUI ul.columns > li:first label').html()).toEqual('<b>Group 1</b>');
            });
            it('shows column group input checked but partially selected when only some columns checked', function(){
                table.spec[0].disabled = true;

                table.$('tr.toggleColumns button').click();

                expect($('.toggleColumnsUI ul.columns > li input').is(':checked')).toEqual(true);
                expect($('.toggleColumnsUI ul.columns > li input').hasClass('partiallySelected')).toEqual(true);
                expect($('.toggleColumnsUI ul.columns > li li input').eq(0).is(':checked')).toEqual(false);
                expect($('.toggleColumnsUI ul.columns > li li input').eq(1).is(':checked')).toEqual(true);
            });
            it('changes column group input to partially selected when some columns unchecked', function(){
                table.$('tr.toggleColumns button').click();

                $('.toggleColumnsUI ul.columns > li li input:first').attr('checked', false).change();

                expect($('.toggleColumnsUI ul.columns > li input').is(':checked')).toEqual(true);
                expect($('.toggleColumnsUI ul.columns > li input').hasClass('partiallySelected')).toEqual(true);
            });
            it('resets partiallySelected class when column group unchecked', function(){
                table.spec[0].disabled = true;

                table.$('tr.toggleColumns button').click();

                $('.toggleColumnsUI ul.columns > li:first input[name=columnGroup]').attr('checked', false).change();

                expect($('.toggleColumnsUI ul.columns > li:first input[name=columnGroup]')
                    .hasClass('partiallySelected')).toEqual(false);
            });
            it('resets partiallySelected class when column group checked', function(){
                table.spec[0].disabled = true;

                table.$('tr.toggleColumns button').click();

                $('.toggleColumnsUI ul.columns > li:first input[name=columnGroup]').attr('checked', true).change();

                expect($('.toggleColumnsUI ul.columns > li:first input[name=columnGroup]')
                    .hasClass('partiallySelected')).toEqual(false);
            });
            it('unchecks column group input when all columns unchecked', function(){
                table.$('tr.toggleColumns button').click();

                $('.toggleColumnsUI ul.columns > li li input').attr('checked', false).change();

                expect($('.toggleColumnsUI ul.columns > li input').is(':checked')).toEqual(false);
                expect($('.toggleColumnsUI ul.columns > li input').hasClass('partiallySelected')).toEqual(false);
            });
            it('unchecks all columns when column group unchecked', function(){
                table.$('tr.toggleColumns button').click();

                $('.toggleColumnsUI ul.columns > li:first input[name=columnGroup]').attr('checked', false).change();

                expect($('.toggleColumnsUI ul.columns > li:first input[name=column]').is(':checked')).toEqual(false);
            });
            it('checks all columns when partially selected and clicked', function(){
                table.spec[0].disabled = true;

                table.$('tr.toggleColumns button').click();

                $('.toggleColumnsUI ul.columns > li:first input[name=columnGroup]').attr('checked', false).change();

                expect($('.toggleColumnsUI ul.columns > li:first input[name=columnGroup]').prop('checked')).toEqual(true);
                expect($('.toggleColumnsUI ul.columns > li input').is(':checked')).toEqual(true);
                expect($('.toggleColumnsUI ul.columns > li input').hasClass('partiallySelected')).toEqual(false);
            });
            it('still applies changes to the table when apply clicked', function(){
                table.spec[0].disabled = true;

                table.$('tr.toggleColumns button').click();

                $('.toggleColumnsUI ul.columns > li:first input[name=columnGroup]').attr('checked', true).change();
                $('.toggleColumnsUI button.apply').click();

                expect($('.toggleColumnsUI').length).toEqual(0);
                expect(table.spec[0].disabled).toEqual(false);
                expect(table.spec[1].disabled).toEqual(false);
            });

            describe('open/close column groups', function(){
                var $toggleUI;
                beforeEach(function(){
                    table.$('tr.toggleColumns button').click();

                    $toggleUI = $('.toggleColumnsUI');
                });
                it('shows column group open/close links', function(){
                    expect($toggleUI.find('li.columnGroup a.opener').length).toEqual(1);
                    expect($toggleUI.find('li.columnGroup a.opener').text()).toEqual('+');
                });
                it('has all column groups closed by default', function(){
                    expect($toggleUI.find('li.columnGroup').hasClass('closed')).toEqual(true);
                });
                it('opens groups on click of link', function(){
                    $toggleUI.find('li.columnGroup a.opener').click();

                    expect($toggleUI.find('li.columnGroup').hasClass('closed')).toEqual(false);
                    expect($toggleUI.find('li.columnGroup').hasClass('open')).toEqual(true);
                    expect($toggleUI.find('li.columnGroup a.opener').text()).toEqual('–');
                });
                it('closes groups on second click of link', function(){
                    $toggleUI.find('li.columnGroup a.opener').click();
                    $toggleUI.find('li.columnGroup a.opener').click();

                    expect($toggleUI.find('li.columnGroup').hasClass('closed')).toEqual(true);
                    expect($toggleUI.find('li.columnGroup').hasClass('open')).toEqual(false);
                    expect($toggleUI.find('li.columnGroup a.opener').text()).toEqual('+');
                });
            });
        });

        describe('custom column defs', function(){
            it('can add custom column definitions which aren\'t in main column definition and show up', function(){
                table.toggleColumns.customColumns.push({id: 'custom', name: 'Custom field'});

                table.$('tr.toggleColumns button').click();

                expect($('.toggleColumnsUI .columns li input[type=checkbox]').length).toEqual(3);
                expect($('.toggleColumnsUI .columns li input[type=checkbox]').eq(0).val()).toEqual('custom');
                expect($('.toggleColumnsUI .columns li input[type=checkbox]').eq(0).next().text()).toEqual('Custom field');
                expect($('.toggleColumnsUI .columns li input[type=checkbox]').eq(1).val()).toEqual('column1');
                expect($('.toggleColumnsUI .columns li input[type=checkbox]').eq(2).val()).toEqual('column2');
            });
            it('sets that field as disabled: true when unchecked', function(){
                table.toggleColumns.customColumns.push({id: 'custom', name: 'Custom field'});

                table.$('tr.toggleColumns button').click();

                $('.toggleColumnsUI .columns li input[type=checkbox]').prop('checked', false);

                $('.toggleColumnsUI button.apply').click();

                expect(table.toggleColumns.getCustomColumn({id: 'custom'}).disabled).toEqual(true);
            });
        });
    });
});