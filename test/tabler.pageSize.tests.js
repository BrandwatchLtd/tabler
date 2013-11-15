define([
        'lib/tabler/tabler',
        'lib/tabler/tabler.pager',
        'lib/tabler/tabler.pageSize'],
    function(tabler,
        pager,
        pageSize){
    'use strict';
    describe('tabler.pageSize', function(){
        var table,
            rowData = [],
            i;

        for (i = 0; i < 200; i++){
            rowData.push({
                column1 : 'a' + i,
                column2 : 'b' + i
            });
        }

        afterEach(function(){
            if(table){
                table.destroy();
                table = undefined;
            }
        });

        beforeEach(function(){
            table = tabler.create([
                {field: 'column1'}
            ], {plugins: [pager, pageSize]});

            table.pager.pageSize =  2;
            table.load(rowData);
        });

        it('throws error when pager plugin not loaded', function(){
            try{
                table = tabler.create([], [pageSize]);
            }catch(e){
                expect(e.message).toEqual('pageSize plugin cannot be used without the pager plugin');
            }
        });
        it('can add a pageSize plugin with default page sizes', function(){
            table.render();

            expect(table.$('tfoot td p.pageSize').length).toEqual(1);
            expect(table.$('tfoot td p.pageSize select option').length).toEqual(3);
            expect(table.$('tfoot td p.pageSize select option').eq(0).val()).toEqual('20');
            expect(table.$('tfoot td p.pageSize select option').eq(1).val()).toEqual('50');
            expect(table.$('tfoot td p.pageSize select option').eq(2).val()).toEqual('100');
        });
        it('renders with correct page size value selected', function(){
            table.pager.pageSize = 100;

            table.render();

            expect(table.$('tfoot td p.pageSize select').val()).toEqual('100');
        });
        it('renders with a label and span around the select', function(){
            table.render();

            expect(table.$('tfoot td p.pageSize select').prev().is('label')).toEqual(true);
            expect(table.$('tfoot td p.pageSize select').prev().text()).toEqual('Show');
            expect(table.$('tfoot td p.pageSize select').next().is('span')).toEqual(true);
            expect(table.$('tfoot td p.pageSize select').next().text()).toEqual('items / page');
        });
        it('can set custom before text', function(){
            table.pageSize.beforeText = 'Page Size';
            table.pageSize.afterText = 'somethings / page';

            table.render();

            expect(table.$('tfoot td p.pageSize select').prev().text()).toEqual('Page Size');
            expect(table.$('tfoot td p.pageSize select').next().text()).toEqual('somethings / page');
        });
        it('can add a pageSize plugin with custom page sizes', function(){
            table.pageSize.sizes = [10, 20];

            table.render();

            expect(table.$('tfoot td p.pageSize').length).toEqual(1);
            expect(table.$('tfoot td p.pageSize select option').length).toEqual(2);
            expect(table.$('tfoot td p.pageSize select option').eq(0).val()).toEqual('10');
            expect(table.$('tfoot td p.pageSize select option').eq(1).val()).toEqual('20');
        });
        it('re-renders the table with the correct number of results on page size update', function(){

            var pageSize = 50,
                expectedRows = Math.min(pageSize, rowData.length);

            table.pager.currentPage = 2;
            table.render();

            table.$('tfoot p.pageSize select').val(50).change();

            expect(table.pager.pageSize).toEqual(pageSize);
            expect(table.pager.currentPage).toEqual(0);

            expect(table.$('tbody tr').length).toEqual(expectedRows);
        });
        describe('standalone', function(){
            it('can be used without a tabler instance', function(){
                var PageSize = pageSize,
                    Pager = pager,
                    p = new Pager(),
                    ps = new PageSize(),
                    $pageSize;

                ps.attach({
                    $el: $('<div />'),
                    pager: p
                });

                p.currentPage = 3;
                p.totalResults = 10;

                $pageSize = $(ps.render());

                expect($pageSize.is('p')).toEqual(true);
                expect($pageSize.hasClass('pageSize')).toEqual(true);
                expect($pageSize.find('select option').length).toEqual(3);
            });
            it('can be used when rendered from pager', function(){
                var PageSize = pageSize,
                    Pager = pager,
                    p = new Pager(),
                    ps = new PageSize(),
                    $pager,

                    $div = $('<div />'),
                    instance = {
                        $el: $div,
                        pager: p
                    };

                p.attach(instance);
                ps.attach(instance);

                p.currentPage = 3;
                p.totalResults = 10;

                $pager = $(p.render());

                expect($pager.is('p')).toEqual(true);
                expect($pager.hasClass('pageSize')).toEqual(true);
                expect($pager.find('select option').length).toEqual(3);
            });
        });
    });
});
