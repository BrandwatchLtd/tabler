define([
        'lib/tabler/tabler',
        'lib/tabler/tabler.columnGrouper',
        'lib/tabler/tabler.removeColumns'],
    function(tabler,
        columnGrouper,
        removeColumns){
    'use strict';
    describe('tabler.removeColumns', function(){
        var table;
        afterEach(function(){
            if(table){
                table.destroy();
                table = undefined;
            }
        });
        beforeEach(function(){
            table = tabler.create([
                {field: 'column1', groupName: 'Group 1', title: 'column1'},
                {field: 'column2', groupName: 'Group 1', title: 'column1'},
                {field: 'column3', groupName: 'Group 1', title: 'column1'},
                {field: 'column4', groupName: 'Group 2', title: ''},
                {field: 'column5', groupName: 'Group 2', title: 'column1', toggleable: false}
            ], {plugins: [columnGrouper, removeColumns]});

            table.load([
                {column1: '1a', column2: '2a', column3: '3a', column4: '4a', column5: '5a'},
                {column1: '1b', column2: '2b', column3: '3b', column4: '4b', column5: '5b'},
                {column1: '1c', column2: '2c', column3: '3c', column4: '4c', column5: '5c'},
                {column1: '1d', column2: '2d', column3: '3d', column4: '4d', column5: '5d'},
                {column1: '1e', column2: '2e', column3: '3e', column4: '4e', column5: '5e'}
            ]);
            table.render();
        });
        it('renders a remove link in every toggleable column header', function(){
            expect(table.$('thead tr:last th:eq(0) a.removeColumn').length).toEqual(1);
            expect(table.$('thead tr:last th:eq(1) a.removeColumn').length).toEqual(1);
            expect(table.$('thead tr:last th:eq(2) a.removeColumn').length).toEqual(1);
            expect(table.$('thead tr:last th:eq(3) a.removeColumn').length).toEqual(0);
            expect(table.$('thead tr:last th:eq(4) a.removeColumn').length).toEqual(0);
        });
        it('renders a remove link in every toggleable column group header', function(){
            expect(table.$('thead tr.columnGroups th:eq(0) a.removeColumn').length).toEqual(1);
            expect(table.$('thead tr.columnGroups th:eq(1) a.removeColumn').length).toEqual(0);
        });
        it('wraps each th contents in a span', function(){
            expect(table.$('thead tr:eq(0) th > span').length).toEqual(table.$('thead tr:eq(0) th').length);
            expect(table.$('thead tr:eq(1) th > span').length).toEqual(table.$('thead tr:eq(1) th').length);
        });
        it('escapes the value if no heading formatter is provided', function(){
            table = tabler.create([
                {field: 'column1', name: '<script>alert("foobar");</script>'}
            ], {plugins: [columnGrouper, removeColumns]});

            table.load([{column1: '1a'}]);
            table.render();

            expect(table.$('thead th').html()).toContain('&lt;script&gt;alert("foobar");&lt;/script&gt;');
        });
        it('escapes the value if no group formatter is provided', function(){
            table = tabler.create([
                {field: 'column1', groupName: '<script>alert("foobar");</script>'}
            ], {plugins: [columnGrouper, removeColumns]});

            table.load([{column1: '1a'}]);
            table.render();

            expect(table.$('thead th').html()).toContain('&lt;script&gt;alert("foobar");&lt;/script&gt;');
        });
        it('disables the column on click of a.removeColumn', function(){
            table.$('thead tr:last th:eq(0) a.removeColumn').click();

            expect(table.spec[0].disabled).toEqual(true);
            expect(table.spec[1].disabled).not.toBeDefined();
            expect(table.spec[2].disabled).not.toBeDefined();
            expect(table.spec[3].disabled).not.toBeDefined();
            expect(table.spec[4].disabled).not.toBeDefined();
        });
        it('disables the column group on click of a.removeColumn', function(){
            table.$('thead tr.columnGroups th:eq(0) a.removeColumn').click();

            expect(table.spec[0].disabled).toEqual(true);
            expect(table.spec[1].disabled).toEqual(true);
            expect(table.spec[2].disabled).toEqual(true);
            expect(table.spec[3].disabled).not.toBeDefined();
            expect(table.spec[4].disabled).not.toBeDefined();
        });
        it('can disable a column group when extra columns added to that column group after init', function(){
            table.addToSpec({
                field: 'column6',
                groupName: 'Group 1',
                title: 'column6'
            });

            table.render();
            table.$('thead tr.columnGroups th:eq(0) a.removeColumn').click();

            expect(table.spec[0].disabled).toEqual(true);
            expect(table.spec[1].disabled).toEqual(true);
            expect(table.spec[2].disabled).toEqual(true);
            expect(table.spec[3].disabled).not.toBeDefined();
            expect(table.spec[4].disabled).not.toBeDefined();
            expect(table.spec[5].disabled).toEqual(true);
        });
        it('raises columnsToggle on click of a.removeColumn', function(){
            var columnsToggledSpy = sinon.spy();

            table.bind('columnsToggled', columnsToggledSpy);

            table.$('thead tr.columnGroups th:eq(0) a.removeColumn').click();

            expect(columnsToggledSpy.calledOnce).toEqual(true);
        });
    });
});
