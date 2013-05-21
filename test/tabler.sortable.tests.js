define([
        'lib/tabler/tabler',
        'lib/tabler/tabler.sortable'],
    function(tabler,
        sortable){
    'use strict';
    describe('tabler.sortable', function(){
        var table;
        afterEach(function(){
            if(table){
                table.destroy();
                table = undefined;
            }
        });
        it('adds client-side sorting to columns with sortable: true', function(){
            table = tabler.create([
                {field: 'column1', sortable: true},
                {field: 'column2', sortable: false}
            ], {plugins: [sortable]});

            table.load([
                {column1: 30, column2: 200},
                {column1: 10, column2: 400},
                {column1: 20, column2: 600}
            ]);
            table.render();

            expect(table.$('tr').length).toEqual(4);
            expect(table.$('thead').length).toEqual(1);
            expect(table.$('thead th').hasClass('sortable')).toEqual(true);
            expect(table.$('thead th').eq(0).find('a.sort').length).toEqual(1);
            expect(table.$('thead th').eq(0).find('a.sort').data('sort-key')).toEqual('column1');
            expect(table.$('thead th').eq(1).find('a.sort').length).toEqual(0);
        });
        it('preserves className on ths', function(){
            table = tabler.create([
                {field: 'column1', sortable: true, className: 'myClass'}
            ], {plugins: [sortable]});

            table.load([
                {column1: 30, column2: 200},
                {column1: 10, column2: 400},
                {column1: 20, column2: 600}
            ]);
            table.render();

            expect(table.$('tr').length).toEqual(4);
            expect(table.$('thead').length).toEqual(1);
            expect(table.$('thead th').hasClass('sortable')).toEqual(true);
            expect(table.$('thead th').hasClass('myClass')).toEqual(true);
        });
        it('preserves headerClassName on ths', function(){
            table = tabler.create([
                {field: 'column1', sortable: true, headerClassName: 'myClass'}
            ], {plugins: [sortable]});

            table.load([
                {column1: 30, column2: 200},
                {column1: 10, column2: 400},
                {column1: 20, column2: 600}
            ]);
            table.render();

            expect(table.$('tr').length).toEqual(4);
            expect(table.$('thead').length).toEqual(1);
            expect(table.$('thead th').hasClass('sortable')).toEqual(true);
            expect(table.$('thead th').hasClass('myClass')).toEqual(true);
        });
        it('can call preventDefault when header child element clicked (prevent navigating away from page)', function(){
            var preventDefaultSpy = sinon.spy(),
            clickEvent = {
                type: 'click',
                preventDefault: preventDefaultSpy
            };

            table = tabler.create([
                {
                    field: 'column1',
                    sortable: true,
                    headerFormatter: function(colSpec, title){
                        return title.replace(/<\/a>$/i, '<span title="This feature is in BETA" class="betaIcon"></span>' + '</a>');
                    }
                }
            ], {plugins: [sortable]});

            table.load([
                {column1: 30},
                {column1: 10},
                {column1: 20}
            ]);
            table.render();

            table.$('thead th:first a.sort span.betaIcon').trigger(clickEvent);

            expect(preventDefaultSpy.called).toEqual(true);
        });
        it('can client-side sorts descending on first header click', function(){
            table = tabler.create([
                {field: 'column1', sortable: true},
                {field: 'column2', sortable: false}
            ], {plugins: [sortable]});

            table.load([
                {column1: 30, column2: 200},
                {column1: 10, column2: 400},
                {column1: 20, column2: 600}
            ]);
            table.render();

            table.$('thead th:first a.sort').click();

            expect(table.$('thead th:first').attr('class')).toEqual('sortable sorted-desc');
            expect(table.$('tbody tr').eq(0).find('td').eq(0).text()).toEqual('30');
            expect(table.$('tbody tr').eq(1).find('td').eq(0).text()).toEqual('20');
            expect(table.$('tbody tr').eq(2).find('td').eq(0).text()).toEqual('10');
        });
        it('can client-side sorts ascending on second header click', function(){
            table = tabler.create([
                {field: 'column1', sortable: true},
                {field: 'column2', sortable: false}
            ], {plugins: [sortable]});

            table.load([
                {column1: 30, column2: 200},
                {column1: 10, column2: 400},
                {column1: 20, column2: 600}
            ]);
            table.render();

            table.$('thead th:first a.sort').click();
            table.$('thead th:first a.sort').click();

            expect(table.$('thead th:first').attr('class')).toEqual('sortable sorted-asc');
            expect(table.$('tbody tr').eq(0).find('td').eq(0).text()).toEqual('10');
            expect(table.$('tbody tr').eq(1).find('td').eq(0).text()).toEqual('20');
            expect(table.$('tbody tr').eq(2).find('td').eq(0).text()).toEqual('30');
        });
        it('sorts on TH click', function(){
            table = tabler.create([
                {field: 'column1', sortable: true},
                {field: 'column2', sortable: false}
            ], {plugins: [sortable]});

            table.load([
                {column1: 30, column2: 200},
                {column1: 10, column2: 400},
                {column1: 20, column2: 600}
            ]);
            table.render();

            table.$('thead th:first').click();
            table.$('thead th:first').click();

            expect(table.$('thead th:first').attr('class')).toEqual('sortable sorted-asc');
            expect(table.$('tbody tr').eq(0).find('td').eq(0).text()).toEqual('10');
            expect(table.$('tbody tr').eq(1).find('td').eq(0).text()).toEqual('20');
            expect(table.$('tbody tr').eq(2).find('td').eq(0).text()).toEqual('30');
        });
        it('does not sort unsortable columns on TH click', function(){
            table = tabler.create([
                {field: 'column1', sortable: true},
                {field: 'column2', sortable: false}
            ], {plugins: [sortable]});

            table.load([
                {column1: 30, column2: 500},
                {column1: 10, column2: 400},
                {column1: 20, column2: 600}
            ]);
            table.render();

            table.$('thead th:eq(1)').click();

            expect(table.$('thead th:eq(1)').hasClass('sorted-desc')).toEqual(false);
            expect(table.$('tbody tr').eq(0).find('td').eq(1).text()).toEqual('500');
            expect(table.$('tbody tr').eq(1).find('td').eq(1).text()).toEqual('400');
            expect(table.$('tbody tr').eq(2).find('td').eq(1).text()).toEqual('600');
        });
        it('can pre-sort table', function(){
            table = tabler.create([
                {field: 'column1', sortable: true},
                {field: 'column2', sortable: false}
            ], {plugins: [sortable]});

            table.sortable.field = 'column1';
            table.sortable.direction = 'desc';

            table.load([
                {column1: 30, column2: 200},
                {column1: 10, column2: 400},
                {column1: 20, column2: 600}
            ]);
            table.render();

            expect(table.$('thead th:first').attr('class')).toEqual('sortable sorted-desc');
            expect(table.$('tbody tr').eq(0).find('td').eq(0).text()).toEqual('30');
            expect(table.$('tbody tr').eq(1).find('td').eq(0).text()).toEqual('20');
            expect(table.$('tbody tr').eq(2).find('td').eq(0).text()).toEqual('10');
        });
        it('updates sort headers correctly when sorting removed externally', function(){
            table = tabler.create([
                {field: 'column1', sortable: true},
                {field: 'column2', sortable: true}
            ], {plugins: [sortable]});

            table.sortable.field = 'column1';
            table.sortable.direction = 'desc';

            table.load([
                {column1: 30, column2: 200},
                {column1: 10, column2: 400},
                {column1: 20, column2: 600}
            ]);
            table.render();

            delete table.sortable.field;
            delete table.sortable.direction;
            table.render();

            expect(table.$('thead th').eq(0).attr('class')).toEqual('sortable');
            expect(table.$('thead th').eq(1).attr('class')).toEqual('sortable');
            expect(table.$('tbody tr').eq(0).find('td').eq(0).text()).toEqual('30');
            expect(table.$('tbody tr').eq(1).find('td').eq(0).text()).toEqual('10');
            expect(table.$('tbody tr').eq(2).find('td').eq(0).text()).toEqual('20');
        });
        it('does not add sorted classes to columns without a field name', function(){
            table = tabler.create([
                {name: 'column1'}
            ], {plugins: [sortable]});

            table.load([
                {column1: 30},
                {column1: 10},
                {column1: 20}
            ]);
            table.render();

            expect(table.$('thead th').eq(0).attr('class') || '').toEqual('');
        });
        it('cleans up invalid sort direction', function(){
            table = tabler.create([
                {field: 'column1', sortable: true},
                {field: 'column2', sortable: false}
            ], {plugins: [sortable]});

            table.sortable.field = 'column1';
            table.sortable.direction = 'descending';

            table.load([
                {column1: 30, column2: 200},
                {column1: 10, column2: 400},
                {column1: 20, column2: 600}
            ]);
            table.render();

            expect(table.$('thead th:first').attr('class')).toEqual('sortable sorted-desc');
            expect(table.$('tbody tr').eq(0).find('td').eq(0).text()).toEqual('10');
            expect(table.$('tbody tr').eq(1).find('td').eq(0).text()).toEqual('20');
            expect(table.$('tbody tr').eq(2).find('td').eq(0).text()).toEqual('30');
        });
        it('calls fetch override with sort parameters', function(){
            var fetchSpy = sinon.spy(function(options, callback){
                    callback({items: data});
                }),
                data;

            table = tabler.create([
                {field: 'column1', sortable: true},
                {field: 'column2', sortable: false}
            ], {plugins: [sortable], fetch: fetchSpy}),

            table.load(data = [
                {column1: 30, column2: 200},
                {column1: 10, column2: 400},
                {column1: 20, column2: 600}
            ]);
            table.render();

            table.$('thead th:first a.sort').click();
            table.$('thead th:first a.sort').click();

            expect(fetchSpy.calledThrice).toEqual(true);
            expect(fetchSpy.args[0][0].field).not.toBeDefined();
            expect(fetchSpy.args[0][0].direction).not.toBeDefined();
            expect(fetchSpy.args[1][0].field).toEqual('column1');
            expect(fetchSpy.args[1][0].direction).toEqual('desc');
            expect(fetchSpy.args[2][0].field).toEqual('column1');
            expect(fetchSpy.args[2][0].direction).toEqual('asc');
        });
        it('adds sortable classes to fields added after the table is initialised', function(){
            table = tabler.create([{field: 'column1', sortable: true}], {plugins: [sortable]});

            table.addToSpec({field: 'column2', sortable: true});

            expect(table.spec[1].className.trim()).toEqual('sortable');
        });
        it('does not sort when new anchors added by header formatters are clicked', function() {
            var renderSpy;

            table = tabler.create([{
                field: 'column1',
                sortable: true,
                headerFormatter: function helpHeaderFormatter(colSpec, title) {
                    return title + '<a class="help">Help</a>';
                }
            }], {
                plugins: [sortable]
            });

            table.load([
                {column1: 30},
                {column1: 10},
                {column1: 20}
            ]);

            table.render();

            renderSpy = sinon.spy(table, 'render');

            table.$('thead tr th a.help').eq(0).click();

            expect(renderSpy.callCount).toEqual(0);
            expect(table.$('tbody tr').eq(0).find('td').eq(0).text()).toEqual('30');
            expect(table.$('tbody tr').eq(1).find('td').eq(0).text()).toEqual('10');
            expect(table.$('tbody tr').eq(2).find('td').eq(0).text()).toEqual('20');
        });
    });
});