define([
        'lib/tabler/tabler',
        'lib/tabler/tabler.pager',
        'lib/tabler/tabler.jumpToPage'],
    function(tabler,
        pager,
        jumpToPage){
    'use strict';
    describe('tabler.jumpToPage', function(){
        var table;
        afterEach(function(){
            if(table){
                table.destroy();
                table = undefined;
            }
        });
        beforeEach(function(){
            table = tabler.create([
                {field: 'column1'}
            ], {plugins: [pager, jumpToPage]});

            table.pager.pageSize =  2;
            table.load([
                {column1: '1a', column2: '2a'},
                {column1: '1b', column2: '2b'},
                {column1: '1c', column2: '2c'},
                {column1: '1d', column2: '2d'},
                {column1: '1e', column2: '2e'}
            ]);
        });
        it('throws error when pager plugin not loaded', function(){
            try{
                table = tabler.create([], [jumpToPage]);
            }catch(e){
                expect(e.message).toEqual('jumpToPage plugin cannot be used without the pager plugin');
            }
        });
        it('renders itself after the pager', function(){
            table.render();

            expect(table.$('ol.pager').next().is('p.jumpToPage')).toEqual(true);
        });
        it('renders as a label, input and button', function(){
            table.render();

            expect(table.$('p.jumpToPage').children().length).toEqual(3);
            expect(table.$('p.jumpToPage').children().eq(0).is('label')).toEqual(true);
            expect(table.$('p.jumpToPage').children().eq(1).is('input[type=text]')).toEqual(true);
            expect(table.$('p.jumpToPage').children().eq(2).is('button')).toEqual(true);
        });
        it('changes the page index & re-renders the table when "Go" button clicked', function(){
            var renderStub;
            table.render();

            renderStub = sinon.stub(table, 'render');

            table.$('p.jumpToPage input').val('2');
            table.$('p.jumpToPage button').click();

            expect(table.pager.currentPage).toEqual(1);
            expect(renderStub.calledOnce).toEqual(true);

            renderStub.restore();
        });
        it('changes the page index & re-renders the table when Enter key pressed in input', function(){
            var renderStub,
                enterKey = jQuery.Event('keydown', {which: 13});

            table.render();

            renderStub = sinon.stub(table, 'render');

            table.$('p.jumpToPage input').val('2');
            table.$('p.jumpToPage input').trigger(enterKey);

            expect(enterKey.isDefaultPrevented()).toEqual(true);
            expect(table.pager.currentPage).toEqual(1);
            expect(renderStub.calledOnce).toEqual(true);

            renderStub.restore();
        });
        it('does not react to other key presses', function(){
            var renderStub;

            table.render();

            renderStub = sinon.stub(table, 'render');

            table.$('p.jumpToPage input').keydown();

            expect(renderStub.called).toEqual(false);

            renderStub.restore();
        });
        it('ignores submission attempts when no value input', function(){
            var renderStub;

            table.render();

            renderStub = sinon.stub(table, 'render');

            table.$('p.jumpToPage button').click();

            expect(renderStub.called).toEqual(false);

            renderStub.restore();
        });
        it('goes to the last page when a large number is entered', function(){
            var renderStub;

            table.render();

            renderStub = sinon.stub(table, 'render');

            table.$('p.jumpToPage input').val('20000000');
            table.$('p.jumpToPage button').click();

            expect(table.pager.currentPage).toEqual(2);
            expect(renderStub.calledOnce).toEqual(true);

            renderStub.restore();
        });
        it('sets input to invalid & clears when a non-numeric value entered', function(){
            var renderStub;

            table.render();

            renderStub = sinon.stub(table, 'render');

            table.$('p.jumpToPage input').val('breaken');
            table.$('p.jumpToPage button').click();

            expect(renderStub.called).toEqual(false);
            expect(table.$('p.jumpToPage input').hasClass('invalid')).toEqual(true);

            renderStub.restore();
        });
        it('sets input to invalid & clears when a value smaller than 1 is entered', function(){
            var renderStub;

            table.render();

            renderStub = sinon.stub(table, 'render');

            table.$('p.jumpToPage input').val(0);
            table.$('p.jumpToPage button').click();

            expect(renderStub.called).toEqual(false);
            expect(table.$('p.jumpToPage input').hasClass('invalid')).toEqual(true);

            renderStub.restore();
        });

        describe('standalone', function() {
            it('can be used without a tabler instance', function() {
                var JumpToPage = jumpToPage,
                    Pager = pager,
                    p = new Pager(),
                    jtp = new JumpToPage(),
                    $jumpToPage;

                jtp.attach({
                    $el: $('<div />'),
                    pager: p
                });

                $jumpToPage = $(jtp.render());

                expect($jumpToPage.is('p')).toEqual(true);
                expect($jumpToPage.hasClass('jumpToPage')).toEqual(true);
            });

            it('when attached renders in pager', function() {
                var JumpToPage = jumpToPage,
                    Pager = pager,
                    p = new Pager(),
                    jtp = new JumpToPage(),
                    $pager,

                    $div = $('<div />'),
                    instance = {
                        $el: $div,
                        pager: p
                    };

                p.attach(instance);
                jtp.attach(instance);

                p.currentPage = 3;
                p.totalResults = 10;

                $pager = $('<div>' + p.render() + '</div>');

                expect($pager.find('.jumpToPage').length).toEqual(1);
            });
        });
    });
});
