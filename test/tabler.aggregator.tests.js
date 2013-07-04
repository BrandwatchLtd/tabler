define([
        'lib/tabler/tabler',
        'lib/tabler/tabler.aggregator'],
    function(tabler,
        aggregator){
    'use strict';
    describe('tabler.aggregator', function(){
        var table;
        afterEach(function(){
            if(table){
                table.destroy();
                table = undefined;
            }
        });
        it('adds footer row with totals', function(){
            var totaliser = sinon.spy(function(memo, value){
                    memo = memo + value;
                    return memo;
                });
            table = tabler.create([
                {field: 'column1', aggregator: totaliser}
            ], {plugins: [aggregator]});

            table.load([
                {column1: 2},
                {column1: 4}
            ]);
            table.render();

            expect(totaliser.calledTwice).toEqual(true);
            expect(table.$('tfoot').length).toEqual(1);
            expect(table.$('tfoot td').length).toEqual(1);
            expect(table.$('tfoot td').text()).toEqual('6');
        });
        it('can have text instead of total in footer cell', function(){
            var totaliser = sinon.spy(function(memo, value){
                    memo = (memo || 0) + value;
                    return memo;
                });
            table = tabler.create([
                {field: 'column1', aggregatorText: 'Total'},
                {field: 'column2', aggregator: totaliser}
            ], {plugins: [aggregator]});

            table.load([
                {column1: 'Thing 1', column2: 2},
                {column1: 'Thing 2', column2: 4}
            ]);
            table.render();

            expect(totaliser.calledTwice).toEqual(true);
            expect(table.$('tfoot').length).toEqual(1);
            expect(table.$('tfoot td').eq(0).text()).toEqual('Total');
            expect(table.$('tfoot td').eq(1).text()).toEqual('6');
        });
        it('adds classNames to footer row cells', function(){
            var totaliser = sinon.spy(function(memo, value){
                    memo = memo + value;
                    return memo;
                });
            table = tabler.create([
                {field: 'column1', className: 'firstColumn', aggregatorText: 'Total'},
                {field: 'column2', className: 'secondColumn', aggregator: totaliser}
            ], {plugins: [aggregator]});

            table.load([
                {column1: 2},
                {column1: 4}
            ]);
            table.render();

            expect(table.$('tfoot td').eq(0).hasClass('firstColumn')).toEqual(true);
            expect(table.$('tfoot td').eq(1).hasClass('secondColumn')).toEqual(true);
        });
        it('adds cell classes to all columns', function(){
            var totaliser = sinon.spy(function(memo, value){
                    memo = memo + value;
                    return memo;
                });
            table = tabler.create([
                {field: 'column1', className: 'firstColumn', aggregatorText: 'Total'},
                {field: 'column2', className: 'secondColumn', aggregator: totaliser}
            ], {plugins: [aggregator], cellClassName: 'tablecell'});

            table.load([
                {column1: 2},
                {column1: 4}
            ]);
            table.render();

            expect(table.$('tfoot td').eq(0).hasClass('tablecell')).toEqual(true);
            expect(table.$('tfoot td').eq(1).hasClass('tablecell')).toEqual(true);
        });
        it('adds cell classes to cells with no aggregate', function(){
            var totaliser = sinon.spy(function(memo, value){
                    memo = memo + value;
                    return memo;
                });
            table = tabler.create([
                {field: 'column1', className: 'firstColumn', aggregatorText: 'Total'},
                {field: 'column2', className: 'secondColumn', aggregator: totaliser},
                {field: 'column3', className: 'nonAggregateColumn'}
            ], {plugins: [aggregator], cellClassName: 'tablecell'});

            table.load([
                {column1: 2},
                {column1: 4}
            ]);
            table.render();

            expect(table.$('tfoot td').eq(2).hasClass('tablecell')).toEqual(true);
            expect(table.$('tfoot td').eq(2).hasClass('nonAggregateColumn')).toEqual(true);
        });
    });
});
