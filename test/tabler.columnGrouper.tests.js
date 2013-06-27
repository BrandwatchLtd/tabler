define([
        'lib/tabler/tabler',
        'lib/tabler/tabler.columnGrouper'],
    function(tabler,
        columnGrouper){
    'use strict';
    describe('tabler.columnGrouper', function(){
        var table;
        afterEach(function(){
            if(table){
                table.destroy();
                table = undefined;
            }
        });
        it('can group column headers', function(){
            table = tabler.create([
                {field: 'column1', name: 'Column 1'},
                {field: 'column2', name: 'Column 2', groupName: 'Group 1'},
                {field: 'column3', name: 'Column 3', groupName: 'Group 1'},
                {field: 'column4', name: 'Column 4'}
            ], {plugins: [columnGrouper]});

            table.load([
                {column1: 'column 1a', column2: 'column 2a', column3: 'column 3a', column4: 'column 4a'},
                {column1: 'column 1b', column2: 'column 2b', column3: 'column 3b', column4: 'column 4b'}
            ]);
            table.render();

            expect(table.$('thead').length).toEqual(1);
            expect(table.$('thead tr').length).toEqual(2);
            expect(table.$('thead tr:first').attr('class')).toEqual('columnGroups');
            expect(table.$('thead tr:first th').length).toEqual(3);
            expect(table.$('thead tr:first th').eq(0).attr('colspan')).toEqual('1');
            expect(table.$('thead tr:first th').eq(0).text()).toEqual('');
            expect(table.$('thead tr:first th').eq(1).attr('colspan')).toEqual('2');
            expect(table.$('thead tr:first th').eq(1).text()).toEqual('Group 1');
            expect(table.$('thead tr:first th').eq(1).attr('class')).toEqual('group-1');
            expect(table.$('thead tr:first th').eq(2).attr('colspan')).toEqual('1');
            expect(table.$('thead tr:first th').eq(2).text()).toEqual('');
        });
        it('can have formatters for column groups', function(){
            table = tabler.create([
                {field: 'column1', name: 'Column 1', groupName: 'Group 1'},
                {field: 'column2', name: 'Column 2', groupName: 'Group 1'}
            ], {plugins: [columnGrouper]});

            table.columnGrouper.formatters['Group 1'] = function(groupSpec){
                return '<span>' + groupSpec.groupName + ' spans ' + groupSpec.count + ' columns</span>';
            };

            table.load([
                {column1: 'column 1a', column2: 'column 2a'},
                {column1: 'column 1b', column2: 'column 2b'}
            ]);
            table.render();

            expect(table.$('thead').length).toEqual(1);
            expect(table.$('thead tr').length).toEqual(2);
            expect(table.$('thead tr:first').attr('class')).toEqual('columnGroups');
            expect(table.$('thead tr:first th').length).toEqual(1);
            expect(table.$('thead tr:first th').html().toLowerCase()).toEqual('<span>group 1 spans 2 columns</span>');
        });
        it('can have formatters for column groups (added through options)', function(){
            table = tabler.create([
                {field: 'column1', name: 'Column 1', groupName: 'Group 1'},
                {field: 'column2', name: 'Column 2', groupName: 'Group 1'}
            ], {
                plugins: [columnGrouper],
                columnGrouper: {
                    formatters: {
                        'Group 1': function(groupSpec){
                            return '<span>' + groupSpec.groupName + ' spans ' + groupSpec.count + ' columns</span>';
                        }
                    }
                }
            });

            table.load([
                {column1: 'column 1a', column2: 'column 2a'},
                {column1: 'column 1b', column2: 'column 2b'}
            ]);
            table.render();

            expect(table.$('thead').length).toEqual(1);
            expect(table.$('thead tr').length).toEqual(2);
            expect(table.$('thead tr:first').attr('class')).toEqual('columnGroups');
            expect(table.$('thead tr:first th').length).toEqual(1);
            expect(table.$('thead tr:first th').html().toLowerCase()).toEqual('<span>group 1 spans 2 columns</span>');
        });
        it('can take classname to add to each group header cell', function(){
            table = tabler.create([
                {field: 'column1', name: 'Column 1', groupName: 'Group 1'},
                {field: 'column2', name: 'Column 2', groupName: 'Group 1'}
            ], {
                plugins: [columnGrouper],
                columnGrouper: {
                    headerCellClassNames: {
                        'Group 1': 'foo'
                    }
                }
            });
            table.load([
                {column1: 'column 1a', column2: 'column 2a'},
                {column1: 'column 1b', column2: 'column 2b'}
            ]);
            table.render();

            expect(table.$('thead tr:first th').attr('class')).toEqual('foo');
        });
        it('can add a classname to the first cell in every column group', function(){
            table = tabler.create([
                {id: 1, field: 'column1', name: 'Column 1a', groupName: 'Group 1'},
                {id: 2, field: 'column2', name: 'Column 2a', groupName: 'Group 1'},
                {id: 3, field: 'column1', name: 'Column 1b', groupName: 'Group 2'},
                {id: 4, field: 'column2', name: 'Column 2b', groupName: 'Group 2'}
            ], {
                plugins: [columnGrouper],
                columnGrouper: {
                    firstCellInGroupClassName: 'fist'
                }
            });

            table.load([
                {column1: 'column 1a', column2: 'column 2a'},
                {column1: 'column 1b', column2: 'column 2b'}
            ]);
            table.render();

            expect(table.$('thead tr:eq(1) th:eq(0)').attr('class')).toEqual('fist');
            expect(table.$('thead tr:eq(1) th:eq(1)').attr('class')).toBeFalsey();
            expect(table.$('thead tr:eq(1) th:eq(2)').attr('class')).toEqual('fist');
            expect(table.$('thead tr:eq(1) th:eq(3)').attr('class')).toBeFalsey();
            expect(table.$('tbody tr:first td:eq(0)').attr('class')).toEqual('fist');
            expect(table.$('tbody tr:first td:eq(1)').attr('class')).toBeFalsey();
            expect(table.$('tbody tr:first td:eq(2)').attr('class')).toEqual('fist');
            expect(table.$('tbody tr:first td:eq(3)').attr('class')).toBeFalsey();
        });
        it('can add a classname to the first cell in every column group, regardless of disabled state', function(){
            table = tabler.create([
                {id: 1, field: 'column1', name: 'Column 1a', groupName: 'Group 1'},
                {id: 2, field: 'column2', name: 'Column 2a', groupName: 'Group 1', disabled: true},
                {id: 3, field: 'column1', name: 'Column 1b', groupName: 'Group 2', disabled: true},
                {id: 4, field: 'column2', name: 'Column 2b', groupName: 'Group 2'}
            ], {
                plugins: [columnGrouper],
                columnGrouper: {
                    firstCellInGroupClassName: 'fist'
                }
            });

            table.load([
                {column1: 'column 1a', column2: 'column 2a'},
                {column1: 'column 1b', column2: 'column 2b'}
            ]);
            table.render();

            expect(table.$('thead tr:eq(1) th:eq(0)').attr('class')).toEqual('fist');
            expect(table.$('thead tr:eq(1) th:eq(1)').attr('class')).toEqual('fist');
            expect(table.$('tbody tr:first td:eq(0)').attr('class')).toEqual('fist');
            expect(table.$('tbody tr:first td:eq(1)').attr('class')).toEqual('fist');
        });
        it('can add a classname to the last cell in every column group', function(){
            table = tabler.create([
                {id: 1, field: 'column1', name: 'Column 1a', groupName: 'Group 1'},
                {id: 2, field: 'column2', name: 'Column 2a', groupName: 'Group 1'},
                {id: 3, field: 'column1', name: 'Column 1b', groupName: 'Group 2'},
                {id: 4, field: 'column2', name: 'Column 2b', groupName: 'Group 2'}
            ], {
                plugins: [columnGrouper],
                columnGrouper: {
                    lastCellInGroupClassName: 'lst'
                }
            });

            table.load([
                {column1: 'column 1a', column2: 'column 2a'},
                {column1: 'column 1b', column2: 'column 2b'}
            ]);
            table.render();

            expect(table.$('thead tr:eq(1) th:eq(0)').attr('class')).toBeFalsey();
            expect(table.$('thead tr:eq(1) th:eq(1)').attr('class')).toEqual('lst');
            expect(table.$('thead tr:eq(1) th:eq(2)').attr('class')).toBeFalsey();
            expect(table.$('thead tr:eq(1) th:eq(3)').attr('class')).toEqual('lst');
            expect(table.$('tbody tr:first td:eq(0)').attr('class')).toBeFalsey();
            expect(table.$('tbody tr:first td:eq(1)').attr('class')).toEqual('lst');
            expect(table.$('tbody tr:first td:eq(2)').attr('class')).toBeFalsey();
            expect(table.$('tbody tr:first td:eq(3)').attr('class')).toEqual('lst');
        });
        it('can add a classname to the last cell in every column group, regardless of disabled state', function(){
            table = tabler.create([
                {id: 1, field: 'column1', name: 'Column 1a', groupName: 'Group 1'},
                {id: 2, field: 'column2', name: 'Column 2a', groupName: 'Group 1', disabled: true},
                {id: 3, field: 'column1', name: 'Column 1b', groupName: 'Group 2', disabled: true},
                {id: 4, field: 'column2', name: 'Column 2b', groupName: 'Group 2'}
            ], {
                plugins: [columnGrouper],
                columnGrouper: {
                    lastCellInGroupClassName: 'lst'
                }
            });

            table.load([
                {column1: 'column 1a', column2: 'column 2a'},
                {column1: 'column 1b', column2: 'column 2b'}
            ]);
            table.render();

            expect(table.$('thead tr:eq(1) th:eq(0)').attr('class')).toEqual('lst');
            expect(table.$('thead tr:eq(1) th:eq(1)').attr('class')).toEqual('lst');
            expect(table.$('tbody tr:first td:eq(0)').attr('class')).toEqual('lst');
            expect(table.$('tbody tr:first td:eq(1)').attr('class')).toEqual('lst');
        });
    });
});
