define([
    'lib/tabler/tabler'
], function(
    tabler
){
    'use strict';
    describe('tabler', function(){
        var table;
        afterEach(function(){
            if(table){
                table.destroy();
                table = undefined;
            }
        });
        describe('rendering', function(){
            it('gives the table a class if specified', function(){
                table = tabler.create(null, {className: 'testClass'});

                expect(table.$el.hasClass('testClass')).toEqual(true);
            });

            it('uses the first argument to create as options if its an object', function(){
                table = tabler.create({className: 'testClass'});

                expect(table.$el.hasClass('testClass')).toEqual(true);
            });

            it('renders as a table with rows from results', function(){
                table = tabler.create();

                table.load([
                    {column1: 'column 1a', column2: 'column 2a'},
                    {column1: 'column 1b', column2: 'column 2b'}
                ]);

                table.render();

                expect(table.$el[0].nodeName.toLowerCase()).toEqual('table');
                expect(table.$('tr').length).toEqual(2);
                expect(table.$('tr').eq(0).find('td').length).toEqual(2);
                expect(table.$('tr').eq(0).find('td').eq(0).text()).toEqual('column 1a');
                expect(table.$('tr').eq(0).find('td').eq(1).text()).toEqual('column 2a');
                expect(table.$('tr').eq(1).find('td').eq(0).text()).toEqual('column 1b');
                expect(table.$('tr').eq(1).find('td').eq(1).text()).toEqual('column 2b');
            });
            it('will only render the fields given in the spec, when there is a spec', function(){
                table = tabler.create([
                    {field: 'column1'}
                ]);

                table.load([
                    {column1: 'column 1a', column2: 'column 2a'},
                    {column1: 'column 1b', column2: 'column 2b'}
                ]);

                table.render();

                expect(table.$('tr').eq(0).find('td').length).toEqual(1);
                expect(table.$('tr').eq(0).find('td').eq(0).text()).toEqual('column 1a');
                expect(table.$('tr').eq(1).find('td').eq(0).text()).toEqual('column 1b');
            });
            it('can have default values for columns', function(){
                table = tabler.create([
                    {field: 'column1', defaultText: 'n/a'}
                ]);

                table.load([
                    {column1: 'column 1a'},
                    {column1: ''},
                    {column1: undefined},
                    {column1: null},
                    {column1: NaN},
                    {column1: false},
                    {column1: 0}
                ]);

                table.render();

                expect(table.$('tr').eq(0).find('td').eq(0).text()).toEqual('column 1a');
                expect(table.$('tr').eq(1).find('td').eq(0).text()).toEqual('n/a');
                expect(table.$('tr').eq(2).find('td').eq(0).text()).toEqual('n/a');
                expect(table.$('tr').eq(3).find('td').eq(0).text()).toEqual('n/a');
                expect(table.$('tr').eq(4).find('td').eq(0).text()).toEqual('n/a');
                expect(table.$('tr').eq(5).find('td').eq(0).text()).toEqual('false');
                expect(table.$('tr').eq(6).find('td').eq(0).text()).toEqual('0');
            });
            it('escapes html entities in cells', function(){
                table = tabler.create([
                    {field: 'column1'}
                ]);
                table.load([{column1: '<script>alert("yolo");</script>'}]);
                table.render();

                expect(table.$('tbody td:first').length).toEqual(1);
                expect(table.$('tbody td:first').html()).toEqual('&lt;script&gt;alert("yolo");&lt;/script&gt;');
            });
            it('escapes html entities in cells for default values', function(){
                table = tabler.create([
                    {field: 'column1', defaultText: '<script>alert("yolo");</script>'}
                ]);
                table.load([{column1: ''}]);
                table.render();

                expect(table.$('tbody td:first').length).toEqual(1);
                expect(table.$('tbody td:first').html()).toEqual('&lt;script&gt;alert("yolo");&lt;/script&gt;');
            });
            it('escapes html entities in heading cells', function(){
                table = tabler.create([
                    {name:'<script>alert("yolo");</script>', field: 'column1'}
                ]);
                table.load([{column1: ''}]);
                table.render();

                expect(table.$('thead th:first').length).toEqual(1);
                expect(table.$('thead th:first').html()).toEqual('&lt;script&gt;alert("yolo");&lt;/script&gt;');
            });
            it('can have a global className addition for cells', function(){
                table = tabler.create([
                    {field: 'column1'}
                ], {
                    cellClassName: 'foo'
                });

                table.load([
                    {column1: 'column 1a', column2: 'column 2a'}
                ]);

                table.render();

                _(table.$('tbody td')).forEach(function(td){
                    expect(td.className.split(' ')).toContain('foo');
                });
            });
            it('cellClassName does not modify colSpec', function(){
                table = tabler.create([
                    {field: 'column1', className: 'bar'}
                ], {
                    cellClassName: 'foo'
                });

                table.load([
                    {column1: 'column 1a', column2: 'column 2a'}
                ]);

                table.render();

                expect(table.spec[0].className).toEqual('bar');
            });
            it('can have a global className addition override for header cells', function(){
                table = tabler.create([
                    {field: 'column1'}
                ], {
                    headerCellClassName: 'foo'
                });

                table.load([
                    {column1: 'column 1a', column2: 'column 2a'}
                ]);

                table.render();

                _(table.$('thead th')).forEach(function(th){
                    expect(th.className.split(' ')).toContain('foo');
                });
            });
        });
        describe('specs', function(){
            it('does not allow duplicate fieldnames', function(){
                var err;
                try{
                    tabler.create([
                        {field: 'column1'},
                        {field: 'column1'}
                    ]);
                }catch(e){
                    err = e;
                }
                expect(err).toBeDefined();
            });
            it('allows duplicate fieldnames when one field has a unique "id" attribute', function(){
                var err;
                try{
                    tabler.create([
                        {field: 'column1'},
                        {id: 'column1_id', field: 'column1'}
                    ]);
                }catch(e){
                    err = e;
                }

                expect(err).not.toBeDefined();
            });
            it('does not allow duplicate ids', function(){
                var err;
                try{
                    tabler.create([
                        {id: 'id', field: 'column2'},
                        {id: 'id', field: 'column2'}
                    ]);
                }catch(e){
                    err = e;
                }
                expect(err).toBeDefined();
            });
            it('does not allow specs without an id or field', function(){
                var err;
                try{
                    tabler.create([
                        {}
                    ]);
                }catch(e){
                    err = e;
                }
                expect(err).toBeDefined();
            });
            it('allows specs to be added via the addToSpec method', function(){
                table = tabler.create([]);

                table.addToSpec({field: 'column1'});

                expect(table.spec[0]).toEqual({id: 'column1', field: 'column1'});
            });
            it('allows specs to be removed via the removeFromSpec method', function(){
                table = tabler.create([
                    {id: 'column1', field: 'column1'}
                ]);

                table.removeFromSpec('column1');

                expect(table.spec.length).toEqual(0);
            });
            it('allows you to pull out column specs by fieldName', function(){
                var field;

                table = tabler.create([
                    {field: 'column1', name: 'testing', prop: 'customValue'}
                ]);

                field = table.getField('column1');

                expect(field).toEqual({field: 'column1', name: 'testing', prop: 'customValue', id: 'column1'});
            });
            it('allows you to pull out column specs by id', function(){
                var field;

                table = tabler.create([
                    {id: 'id', field: 'column1', name: 'testing', prop: 'customValue'}
                ]);

                field = table.getField('id');

                expect(field).toEqual({id: 'id', field: 'column1', name: 'testing', prop: 'customValue'});
            });
            it('allows you to pull out column specs by other attributes on their own', function(){
                var field;

                table = tabler.create([
                        {id: 1, field: 'column1', name: 'testing', prop: 'other'},
                        {id: 2, field: 'column1', name: 'testing', prop: 'customValue'},
                        {id: 3, field: 'column1', name: 'testing', prop: 'yetAnother'}
                    ]);

                field = table.getField({prop: 'customValue'});

                expect(field).toEqual({id: 2, field: 'column1', name: 'testing', prop: 'customValue'});
            });
        });
        describe('rendering (again)', function(){
            it('builds thead and th elements with labels and classes as defined in spec', function(){
                table = tabler.create([
                    {field: 'column1', name: 'Column 1', headerClassName: 'column1Class'},
                    {field: 'column2', name: 'Column 2', headerClassName: 'column2Class'}
                ]);

                table.load([
                    {column1: 'column 1a', column2: 'column 2a'},
                    {column1: 'column 1b', column2: 'column 2b'}
                ]);

                table.render();

                expect(table.$('thead').length).toEqual(1);
                expect(table.$('thead tr').length).toEqual(1);
                expect(table.$('thead th').length).toEqual(2);
                expect(table.$('thead th').eq(0).text().trim()).toEqual('Column 1');
                expect(table.$('thead th').eq(1).text().trim()).toEqual('Column 2');
                expect(table.$('thead th').eq(0).hasClass('column1Class')).toEqual(true);
                expect(table.$('thead th').eq(1).hasClass('column2Class')).toEqual(true);
                expect(table.$('tbody tr').length).toEqual(2);
            });
            it('builds columns with custom header text', function(){
                table = tabler.create([
                    {field: 'column1', name: 'Column 1', title: 'First Column'}
                ]);

                table.load([
                    {column1: 'column 1a'},
                    {column1: 'column 1b'}
                ]);

                table.render();

                expect(table.$('thead th').length).toEqual(1);
                expect(table.$('thead th').eq(0).text().trim()).toEqual('First Column');
            });
            it('builds columns with custom header text even when that text is an empty string', function(){
                table = tabler.create([
                    {field: 'column1', name: 'Column 1', title: ''}
                ]);

                table.load([
                    {column1: 'column 1a'},
                    {column1: 'column 1b'}
                ]);

                table.render();

                expect(table.$('thead th').length).toEqual(1);
                expect(table.$('thead th').eq(0).text().trim()).toEqual('');
            });
            it('can give columns CSS class names', function(){
                table = tabler.create([
                    {field: 'column1', name: 'Column 1'},
                    {field: 'column2', name: 'Column 2', className: 'testing'}
                ]);

                table.load([
                    {column1: 'column 1a', column2: 'column 2a'}
                ]);
                table.render();

                expect(table.$('thead').length).toEqual(1);
                expect(table.$('thead th').eq(0).attr('class')).not.toBeTruthy();
                expect(table.$('thead th').eq(1).attr('class')).toEqual('testing');

                expect(table.$('tbody tr td').eq(0).attr('class')).not.toBeTruthy();
                expect(table.$('tbody tr td').eq(1).attr('class')).toEqual('testing');
            });
            it('can give columns their own CSS class with a table-level cellClassName as well', function(){
                table = tabler.create([
                    {field: 'column1', name: 'Column 1'},
                    {field: 'column2', name: 'Column 2', className: 'testing'}
                ], {
                    cellClassName: 'foo'
                });

                table.load([
                    {column1: 'column 1a', column2: 'column 2a'}
                ]);
                table.render();

                expect(table.$('thead').length).toEqual(1);
                expect(table.$('thead th').eq(0).attr('class')).not.toBeTruthy();
                expect(table.$('thead th').eq(1).attr('class')).toEqual('testing');

                expect(table.$('tbody tr td').eq(0).attr('class')).toEqual('foo');
                expect(table.$('tbody tr td').eq(1).attr('class')).toEqual('testing foo');
            });
            it('can give rows their own CSS class with a table options', function(){
                table = tabler.create([
                    {field: 'column1', name: 'Column 1'},
                    {field: 'column2', name: 'Column 2', className: 'testing'}
                ], {
                    headRowClassName: 'headclass',
                    bodyRowClassName: 'bodyclass',
                    footRowClassName: 'footclass'
                });

                // needed to be able to test the footer
                table.renderFoot = function(){
                    return this.renderFootTr() + '<td colspan="2">dummy</td></tr>';
                };

                table.load([
                    {column1: 'column 1a', column2: 'column 2a'}
                ]);
                table.render();

                expect(table.$('thead tr').hasClass('headclass')).toEqual(true);
                expect(table.$('tbody tr').hasClass('bodyclass')).toEqual(true);
                expect(table.$('tfoot tr').hasClass('footclass')).toEqual(true);
            });
            it('can give columns a width and a CSS class', function(){
                table = tabler.create([
                    {field: 'column1', name: 'Column 1', width: '25%'},
                    {field: 'column2', name: 'Column 2', className: 'testing'}
                ]);

                table.load([
                    {column1: 'column 1a', column2: 'column 2a'},
                    {column1: 'column 1b', column2: 'column 2b'}
                ]);
                table.render();

                expect(table.$('thead').length).toEqual(1);
                expect(table.$('thead th').eq(0).attr('width')).toEqual('25%');
                expect(table.$('thead th').eq(1).attr('width')).not.toBeTruthy();
                expect(table.$('thead th').eq(0).attr('class')).not.toBeTruthy();
                expect(table.$('thead th').eq(1).attr('class')).toEqual('testing');

                expect(table.$('tbody tr').eq(0).find('td').eq(1).attr('class')).toEqual('testing');
                expect(table.$('tbody tr').eq(1).find('td').eq(1).attr('class')).toEqual('testing');
            });
            it('can have disabled columns that do not render', function(){
                table = tabler.create([
                    {field: 'column1', name: 'Column 1', disabled: true},
                    {field: 'column2', name: 'Column 2'}
                ]);

                table.load([
                    {column1: 'column 1a', column2: 'column 2a'},
                    {column1: 'column 1b', column2: 'column 2b'}
                ]);

                table.render();

                expect(table.$('thead tr').length).toEqual(1);
                expect(table.$('thead tr th').length).toEqual(1);
                expect(table.$('thead tr th').text()).toEqual('Column 2');

                expect(table.$('tbody tr').length).toEqual(2);
                expect(table.$('tbody tr').eq(0).find('td').length).toEqual(1);
                expect(table.$('tbody tr').eq(0).find('td').eq(0).text()).toEqual('column 2a');
                expect(table.$('tbody tr').eq(1).find('td').eq(0).text()).toEqual('column 2b');
            });
            it('can have formatter functions on headings', function(){
                var formatter = sinon.spy(function(columnSpec){
                        return '<span>' + columnSpec.field + '</span>';
                    });

                table = tabler.create([
                    {field: 'column1', headerFormatter: formatter}
                ]);

                table.load([
                    {column1: 'column 1a', column2: 'column 2a', column3: 'column 3a'},
                    {column1: 'column 1b', column2: 'column 2b', column3: 'column 3a'}
                ]);
                table.render();

                expect(formatter.calledOnce).toEqual(true);
                expect(formatter.args[0][0]).toEqual(table.spec[0]);
                expect(table.$('thead tr th').eq(0).html().toLowerCase()).toEqual('<span>column1</span>');
            });
            it('can have formatter functions on cells', function(){
                var formatter = sinon.spy(function(value){
                        return '<a href="#">' + value + '</a>';
                    });

                table = tabler.create([
                    {field: 'column1', formatter: formatter}
                ]);

                table.load([
                    {column1: 'column 1a', column2: 'column 2a', column3: 'column 3a'},
                    {column1: 'column 1b', column2: 'column 2b', column3: 'column 3a'}
                ]);
                table.render();

                expect(formatter.calledTwice).toEqual(true);
                expect(formatter.alwaysCalledOn(table)).toEqual(true);
                expect(formatter.args[0][0]).toEqual('column 1a');
                expect(formatter.args[0][1]).toEqual(table.spec[0]);
                expect(formatter.args[0][2]).toEqual(table._data.items[0]);
                expect(formatter.args[0][3]).toEqual(0);
                expect(table.$('tr').eq(0).find('td').eq(0).html().toLowerCase()).toEqual('<a href="#">column 1a</a>');
                expect(table.$('tr').eq(1).find('td').eq(0).html().toLowerCase()).toEqual('<a href="#">column 1b</a>');
            });
            it('cleans up on destroy', function(){
                var clickSpy = sinon.spy();

                table = tabler.create();

                table.load([
                    {column1: 'column 1a', column2: 'column 2a', column3: 'column 3a'},
                    {column1: 'column 1b', column2: 'column 2b', column3: 'column 3a'}
                ]);
                table.render();

                table.$el.click(clickSpy);

                table.destroy();
                table.$el.click();

                expect(table.$el.is(':empty')).toEqual(true);
                expect(clickSpy.called).toEqual(false);
            });
            it('properly disposes of plugins on destroy', function(){
                var attachSpy = sinon.spy(),
                    detachSpy = sinon.spy();

                table = tabler.create([], {
                    plugins: [
                        _.extend(function TestPlugin(){
                            return {attach: attachSpy, detach: detachSpy};
                        }, {pluginName: 'test'})
                    ]
                });

                expect(table._plugins).toEqual(['test']);
                expect(table.test).toEqual({attach: attachSpy, detach: detachSpy});

                table.destroy();

                expect(attachSpy.calledOnce).toEqual(true);
                expect(detachSpy.calledOnce).toEqual(true);
                expect(table._plugins.length).toEqual(0);
            });
        });
        describe('partial updates', function(){
            beforeEach(function(){
                table = tabler.create();

                table.load([
                    {column1: 'column 1a', column2: 'column 2a', column3: 'column 3a'},
                    {column1: 'column 1b', column2: 'column 2b', column3: 'column 3b'}
                ]);
                table.render();
            });
            it('can update the table via the update method', function(){
                table.update(0, {
                    column1: 'updated column 1a',
                    column2: 'updated column 2a',
                    column3: 'updated column 3a'
                });

                expect(table.$('> tbody tr:eq(0) td:eq(0)').text()).toEqual('updated column 1a');
                expect(table.$('> tbody tr:eq(0) td:eq(1)').text()).toEqual('updated column 2a');
                expect(table.$('> tbody tr:eq(0) td:eq(2)').text()).toEqual('updated column 3a');
                expect(table.$('> tbody tr:eq(1) td:eq(0)').text()).toEqual('column 1b');
                expect(table.$('> tbody tr:eq(1) td:eq(1)').text()).toEqual('column 2b');
                expect(table.$('> tbody tr:eq(1) td:eq(2)').text()).toEqual('column 3b');
            });
            it('does not replace the rows when updating', function(){
                var $row1 = table.$('> tbody tr:eq(0)'),
                    $row2 = table.$('> tbody tr:eq(1)');

                table.update(0, {
                    column1: 'updated column 1a',
                    column2: 'updated column 2a',
                    column3: 'updated column 3a'
                });

                expect($row1.parent().length).toEqual(1);
                expect($row2.parent().length).toEqual(1);
            });
            it('only touches the cells that have changed', function(){
                table.$('> tbody tr:eq(0) td:eq(0)').text('modified column 1a');

                table.update(0, {
                    column3: 'updated column 3a'
                });

                expect(table.$('> tbody tr:eq(0) td:eq(0)').text()).toEqual('modified column 1a');
                expect(table.$('> tbody tr:eq(0) td:eq(1)').text()).toEqual('column 2a');
                expect(table.$('> tbody tr:eq(0) td:eq(2)').text()).toEqual('updated column 3a');
            });
            it('updates other cells which have an updateFields property containing the modified field name', function(){
                table.$('> tbody tr:eq(0) td:eq(0)').text('modified column 1a');

                table.spec[0].updateFields = ['otherColumn'];
                table.spec[0].formatter = function(value, spec, row){
                    return row.otherColumn;
                };

                table.update(0, {
                    otherColumn: 'another column',
                    column3: 'updated column 3a'
                });

                expect(table.$('> tbody tr:eq(0) td:eq(0)').text()).toEqual('another column');
                expect(table.$('> tbody tr:eq(0) td:eq(1)').text()).toEqual('column 2a');
                expect(table.$('> tbody tr:eq(0) td:eq(2)').text()).toEqual('updated column 3a');
            });
            it('replaces the entire row when updating with invalidateRow: true', function(){
                var $row1 = table.$('> tbody tr:eq(0)'),
                    $row2 = table.$('> tbody tr:eq(1)');

                table.update(0, {
                    column1: 'updated column 1a',
                    column2: 'updated column 2a',
                    column3: 'updated column 3a'
                }, {invalidateRow: true});

                // Row 1 has been replaced with a new version
                expect($row1.parent().length).toEqual(0);
                expect($row2.parent().length).toEqual(1);

                expect(table.$('> tbody tr:eq(0) td:eq(0)').text()).toEqual('updated column 1a');
                expect(table.$('> tbody tr:eq(0) td:eq(1)').text()).toEqual('updated column 2a');
                expect(table.$('> tbody tr:eq(0) td:eq(2)').text()).toEqual('updated column 3a');
            });
            it('passes row index to renderCell', function(){
                var renderCellSpy = sinon.spy(table, 'renderCell');
                table.update(1, {
                    column1: 'updated column 1b'
                });

                expect(renderCellSpy.calledOnce).toEqual(true);
                expect(renderCellSpy.args[0][2]).toEqual(1);

                table.update(0, {
                    column3: 'updated column 3a'
                });

                expect(renderCellSpy.calledTwice).toEqual(true);
                expect(renderCellSpy.args[1][2]).toEqual(0);

                renderCellSpy.restore();
            });
        });
        describe('dynamic data', function(){
            it('calls "fetch" method on render if specified', function(){
                var fetchSpy = sinon.spy(),
                    table = tabler.create({
                        fetch: fetchSpy
                    });

                table.render();

                expect(fetchSpy.calledOnce).toEqual(true);
                expect(fetchSpy.args[0][0]).toEqual({});
            });
            it('has "loading" class on table while waiting for fetch', function(){
                var fetchSpy = sinon.spy(),
                    table = tabler.create({
                        fetch: fetchSpy
                    });

                table.render();

                expect(table.$el.hasClass('loading')).toEqual(true);
            });
            it('renders table with fetched data when fetch returns', function(){
                var fetchSpy = sinon.spy(),
                    table = tabler.create({
                        fetch: fetchSpy
                    });

                table.render();
                fetchSpy.args[0][1]({
                    items: [
                        {column1: 'Column 1 Value 1', column2: 'Column 2 Value 1'}
                    ]
                });

                expect(table.$('tr').length).toEqual(1);
                expect(table.$('tr td').eq(0).text()).toEqual('Column 1 Value 1');
                expect(table.$('tr td').eq(1).text()).toEqual('Column 2 Value 1');
            });
            it('removes "loading" class on table when fetch returns', function(){
                var fetchSpy = sinon.spy(),
                    table = tabler.create({
                        fetch: fetchSpy
                    });

                table.render();
                fetchSpy.args[0][1]({
                    items: [
                        {column1: 'Column 1 Value 1', column2: 'Column 2 Value 1'}
                    ]
                });

                expect(table.$el.hasClass('loading')).toEqual(false);
            });
        });
        describe('plugins', function(){
            it('can create with plugins', function(){
                function TestPlugin(options){
                    this.options = options;
                }
                TestPlugin.pluginName = 'testPlugin';
                TestPlugin.prototype.attach = sinon.spy();

                table = tabler.create([], {plugins: [TestPlugin], testPlugin: {property1: true}});

                expect(table.testPlugin).toBeDefined();
                expect(TestPlugin.prototype.attach.calledOnce).toEqual(true);
                expect(TestPlugin.prototype.attach.args[0][0]).toEqual(table);
                expect(table.testPlugin.options).toEqual({property1: true});
            });
            it('can add plugins', function(){
                table = tabler.create();

                function TestPlugin(options){
                    this.options = options;
                }
                TestPlugin.pluginName = 'testPlugin';
                TestPlugin.prototype.attach = sinon.spy();

                table.addPlugin(TestPlugin, {config: 'value'});

                expect(table.testPlugin).toBeDefined();
                expect(table.testPlugin.options).toEqual({config: 'value'});
                expect(TestPlugin.prototype.attach.calledOnce).toEqual(true);
                expect(TestPlugin.prototype.attach.args[0][0]).toEqual(table);
            });
        });
    });
});
