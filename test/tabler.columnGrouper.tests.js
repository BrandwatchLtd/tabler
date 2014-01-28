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
        it('escapes html entities in the group name by default', function(){
            var columns = {field: 'column1', name: 'Column 1', groupName: '<script>alert("barbaz");</script>'};

            table = tabler.create([columns], {plugins: [columnGrouper]});
            table.load([{column1: 'column 1a', column2: 'column 2a'}]);
            table.render();

            expect(table.$('thead th').html()).toBe('&lt;script&gt;alert("barbaz");&lt;/script&gt;');
        });
        it('does not escapes html if a group name formatter is provided', function(){
            var columns = {field: 'column1', name: 'Column 1', groupName: 'group1'},
                options = {formatters: {
                  group1: function(spec){ return '<span>help</span>' }
                }};

            table = tabler.create([columns], {plugins: [columnGrouper], columnGrouper: options});
            table.load([{column1: 'column 1a', column2: 'column 2a'}]);
            table.render();

            expect(table.$('thead th').html()).toBe('<span>help</span>');
        });
        it('can take classname to add to every group header cell', function(){
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
        it('can take classname to add to specific group header cell', function(){
            table = tabler.create([
                {field: 'column1', name: 'Column 1', groupName: 'Group 1'},
                {field: 'column2', name: 'Column 2', groupName: 'Group 1'}
            ], {
                plugins: [columnGrouper],
                columnGrouper: {
                    groupHeaderCellClassName: 'columngroupheader'
                }
            });
            table.load([
                {column1: 'column 1a', column2: 'column 2a'},
                {column1: 'column 1b', column2: 'column 2b'}
            ]);
            table.render();

            expect(table.$('thead tr:first th').attr('class')).toEqual('group-1 columngroupheader');
        });
        it('can combine classname to add to every group and specific group header cell', function(){
            table = tabler.create([
                {field: 'column1', name: 'Column 1', groupName: 'Group 1'},
                {field: 'column2', name: 'Column 2', groupName: 'Group 1'}
            ], {
                plugins: [columnGrouper],
                columnGrouper: {
                    groupHeaderCellClassName: 'columngroupheader',
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

            expect(table.$('thead tr:first th').attr('class')).toEqual('foo columngroupheader');
        });
        it('can add a classname to the first cell in every column group', function(){
            table = tabler.create([
                {id: 1, field: 'column1', name: 'Column 1a', groupName: 'Group 1'},
                {id: 2, field: 'column2', name: 'Column 2a', groupName: 'Group 1'},
                {id: 3, field: 'column1', name: 'Column 1b', groupName: 'Group 2'},
                {id: 4, field: 'column2', name: 'Column 2b', groupName: 'Group 2'}
            ], {
                plugins: [columnGrouper],
                cellClassName: 'cell',
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
            expect(table.$('tbody tr:first td:eq(0)').attr('class')).toEqual('cell fist');
            expect(table.$('tbody tr:first td:eq(1)').attr('class')).toEqual('cell');
            expect(table.$('tbody tr:first td:eq(2)').attr('class')).toEqual('cell fist');
            expect(table.$('tbody tr:first td:eq(3)').attr('class')).toEqual('cell');
        });
        it('can add a classname to the first cell in every column group, regardless of disabled state', function(){
            table = tabler.create([
                {id: 1, field: 'column1', name: 'Column 1a', groupName: 'Group 1'},
                {id: 2, field: 'column2', name: 'Column 2a', groupName: 'Group 1', disabled: true},
                {id: 3, field: 'column1', name: 'Column 1b', groupName: 'Group 2', disabled: true},
                {id: 4, field: 'column2', name: 'Column 2b', groupName: 'Group 2'}
            ], {
                plugins: [columnGrouper],
                cellClassName: 'cell',
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
            expect(table.$('tbody tr:first td:eq(0)').attr('class')).toEqual('cell fist');
            expect(table.$('tbody tr:first td:eq(1)').attr('class')).toEqual('cell fist');
        });
        it('can add a classname to the last cell in every column group', function(){
            table = tabler.create([
                {id: 1, field: 'column1', name: 'Column 1a', groupName: 'Group 1'},
                {id: 2, field: 'column2', name: 'Column 2a', groupName: 'Group 1'},
                {id: 3, field: 'column1', name: 'Column 1b', groupName: 'Group 2'},
                {id: 4, field: 'column2', name: 'Column 2b', groupName: 'Group 2'}
            ], {
                plugins: [columnGrouper],
                cellClassName: 'cell',
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
            expect(table.$('tbody tr:first td:eq(0)').attr('class')).toEqual('cell');
            expect(table.$('tbody tr:first td:eq(1)').attr('class')).toEqual('cell lst');
            expect(table.$('tbody tr:first td:eq(2)').attr('class')).toEqual('cell');
            expect(table.$('tbody tr:first td:eq(3)').attr('class')).toEqual('cell lst');
        });
        it('can add a classname to the last cell in every column group, regardless of disabled state', function(){
            table = tabler.create([
                {id: 1, field: 'column1', name: 'Column 1a', groupName: 'Group 1'},
                {id: 2, field: 'column2', name: 'Column 2a', groupName: 'Group 1', disabled: true},
                {id: 3, field: 'column1', name: 'Column 1b', groupName: 'Group 2', disabled: true},
                {id: 4, field: 'column2', name: 'Column 2b', groupName: 'Group 2'}
            ], {
                plugins: [columnGrouper],
                cellClassName: 'cell',
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
            expect(table.$('tbody tr:first td:eq(0)').attr('class')).toEqual('cell lst');
            expect(table.$('tbody tr:first td:eq(1)').attr('class')).toEqual('cell lst');
        });
        it('can add a first/last classname to a cell from a column group with single column', function(){
            table = tabler.create([
                {id: 1, field: 'column1', name: 'Column 1a', groupName: 'Group 1'}
            ], {
                plugins: [columnGrouper],
                cellClassName: 'cell',
                columnGrouper: {
                    firstCellInGroupClassName: 'fist',
                    lastCellInGroupClassName: 'lst'
                }
            });

            table.load([
                {column1: 'column 1a', column2: 'column 2a'},
                {column1: 'column 1b', column2: 'column 2b'}
            ]);
            table.render();

            expect(table.$('thead tr:eq(1) th:eq(0)').attr('class')).toEqual('fist lst');
            expect(table.$('tbody tr:first td:eq(0)').attr('class')).toEqual('cell fist lst');
        });
        it('can add classnames when all are set at the same time', function(){
            table = tabler.create([
                {id: 1, field: 'column1', name: 'Column 1a', groupName: 'Group 1'},
                {id: 2, field: 'column2', name: 'Column 2a', groupName: 'Group 1'},
                {id: 3, field: 'column1', name: 'Column 1b', groupName: 'Group 2'},
                {id: 4, field: 'column2', name: 'Column 2b', groupName: 'Group 2'},
                {id: 5, field: 'lonelycolumn', name: 'Lonely Column', groupName: 'Lonely Group'}
            ], {
                plugins: [columnGrouper],
                cellClassName: 'cell',
                columnGrouper: {
                    groupHeaderCellClassName: 'columngroupheader',
                    firstCellInGroupClassName: 'fist',
                    lastCellInGroupClassName: 'lst'
                }
            });

            table.load([
                {column1: 'column 1a', column2: 'column 2a'},
                {column1: 'column 1b', column2: 'column 2b'}
            ]);
            table.render();

            expect(table.$('thead tr:eq(0) th:eq(0)').attr('class')).toEqual('group-1 columngroupheader');
            expect(table.$('thead tr:eq(0) th:eq(1)').attr('class')).toEqual('group-2 columngroupheader');
            expect(table.$('thead tr:eq(0) th:eq(2)').attr('class')).toEqual('lonely-group columngroupheader');
            expect(table.$('thead tr:eq(1) th:eq(0)').attr('class')).toEqual('fist');
            expect(table.$('thead tr:eq(1) th:eq(1)').attr('class')).toEqual('lst');
            expect(table.$('thead tr:eq(1) th:eq(2)').attr('class')).toEqual('fist')
            expect(table.$('thead tr:eq(1) th:eq(3)').attr('class')).toEqual('lst');
            expect(table.$('thead tr:eq(1) th:eq(4)').attr('class')).toEqual('fist lst');
            expect(table.$('tbody tr:first td:eq(0)').attr('class')).toEqual('cell fist');
            expect(table.$('tbody tr:first td:eq(1)').attr('class')).toEqual('cell lst');
            expect(table.$('tbody tr:first td:eq(2)').attr('class')).toEqual('cell fist');
            expect(table.$('tbody tr:first td:eq(3)').attr('class')).toEqual('cell lst');
            expect(table.$('tbody tr:first td:eq(4)').attr('class')).toEqual('cell fist lst');
        });
        it('adding classnames do not modify original colspec', function(){
            var colSpec = [
                {id: 1, field: 'column1', name: 'Column 1a', groupName: 'Group 1'},
                {id: 2, field: 'column2', name: 'Column 2a', groupName: 'Group 1'},
                {id: 3, field: 'column1', name: 'Column 1b', groupName: 'Group 2'},
                {id: 4, field: 'column2', name: 'Column 2b', groupName: 'Group 2'}
            ];
            table = tabler.create(_.clone(colSpec), {
                plugins: [columnGrouper],
                cellClassName: 'cell',
                columnGrouper: {
                    groupHeaderCellClassName: 'columngroupheader',
                    firstCellInGroupClassName: 'fist',
                    lastCellInGroupClassName: 'lst'
                }
            });

            table.load([
                {column1: 'column 1a', column2: 'column 2a'},
                {column1: 'column 1b', column2: 'column 2b'}
            ]);
            table.render();

            expect(table.spec).toEqual(colSpec);
        });
    });
});
