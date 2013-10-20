define([
        'lib/tabler/tabler',
        'lib/tabler/tabler.pager'],
    function(tabler,
        pager){
    'use strict';
    describe('tabler.pager', function(){
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
            ], {plugins: [pager]});

            table.load([
                {column1: '1a', column2: '2a'},
                {column1: '1b', column2: '2b'},
                {column1: '1c', column2: '2c'},
                {column1: '1d', column2: '2d'},
                {column1: '1e', column2: '2e'}
            ]);
        });

        it('adds pager ul to the tfoot of the table', function(){
            table.render();

            expect(table.$('tfoot').length).toEqual(1);
            expect(table.$('tfoot tr td').length).toEqual(1);
            expect(table.$('tfoot tr td').attr('colspan')).toEqual('2');
            expect(table.$('tfoot tr td ol.pager').length).toEqual(1);
        });
        it('can add a pager wirh a custom css class', function(){
            var customClassName = 'fancyPantsClassName';

            table.pager.cssClass = customClassName;

            table.render();

            expect(table.$('tfoot tr td ol').length).toEqual(1);
            expect(table.$('tfoot tr td ol').hasClass(customClassName)).toEqual(true);
        });
        it('only renders pageSize worth of data', function(){
            table.pager.pageSize = 2;
            table.render();

            expect(table.$('tbody tr').length).toEqual(2);
        });
        it('shows current page li with a class of current', function(){
            table.pager.pageSize = 2;
            table.render();

            expect(table.$('tfoot tr td ol.pager li').length).toEqual(4);
            expect(table.$('tfoot tr td ol.pager li').eq(0).hasClass('current')).toEqual(true);
            expect(table.$('tfoot tr td ol.pager li').eq(0).data('page')).toEqual(0);
            expect(table.$('tfoot tr td ol.pager li').eq(0).text()).toEqual('1');
            expect(table.$('tfoot tr td ol.pager li').eq(1).hasClass('current')).toEqual(false);
            expect(table.$('tfoot tr td ol.pager li').eq(1).data('page')).toEqual(1);
            expect(table.$('tfoot tr td ol.pager li').eq(1).text()).toEqual('2');
            expect(table.$('tfoot tr td ol.pager li').eq(2).hasClass('current')).toEqual(false);
            expect(table.$('tfoot tr td ol.pager li').eq(2).text()).toEqual('3');
            expect(table.$('tfoot tr td ol.pager li').eq(2).data('page')).toEqual(2);
            expect(table.$('tfoot tr td ol.pager li').eq(3).text()).toEqual('Next');
            expect(table.$('tfoot tr td ol.pager li').eq(3).data('page')).toEqual(1);
            expect(table.$('tfoot tr td ol.pager li').eq(3).hasClass('next')).toEqual(true);
        });
        it('can page through results by clicking on page links', function(){
            table.pager.pageSize = 2;
            table.render();

            table.$('tfoot tr td ol.pager li[data-page=1]').click();

            expect(table.$('tbody tr').eq(0).find('td').eq(0).text()).toEqual('1c');
            expect(table.$('tbody tr').eq(0).find('td').eq(1).text()).toEqual('2c');
            expect(table.$('tbody tr').eq(1).find('td').eq(0).text()).toEqual('1d');
            expect(table.$('tbody tr').eq(1).find('td').eq(1).text()).toEqual('2d');

            table.$('tfoot tr td ol.pager li[data-page=2]').click();

            expect(table.$('tbody tr').eq(0).find('td').eq(0).text()).toEqual('1e');
            expect(table.$('tbody tr').eq(0).find('td').eq(1).text()).toEqual('2e');
        });
        it('triggers "paged" events on clicking page links', function(){
            var pagedSpy = sinon.spy();

            table.bind('paged', pagedSpy);
            table.pager.pageSize = 2;
            table.render();

            table.$('tfoot tr td ol.pager li[data-page=1]').click();

            expect(pagedSpy.calledOnce).toEqual(true);
            expect(pagedSpy.args[0][0]).toEqual({
                currentPage: 1,
                pageSize: 2
            });
        });

        it('triggers "paged" events on clicking page links, when the pager has a custom css class', function(){
            var pagedSpy = sinon.spy(),
                customClassName = 'fancyPantsClassName';

            table.pager.cssClass = customClassName;

            table.bind('paged', pagedSpy);
            table.pager.pageSize = 2;

            table.render();

            table.$('tfoot tr td ol.' + customClassName +  ' li[data-page=1]').click();

            expect(pagedSpy.calledOnce).toEqual(true);
            expect(pagedSpy.args[0][0]).toEqual({
                currentPage: 1,
                pageSize: 2
            });
        });

        it('renders Previous link when on page > 1', function(){
            table.pager.pageSize = 2;

            table.render();

            table.$('tfoot tr td ol.pager li[data-page=1]').click();

            expect(table.$('tfoot tr td ol.pager li:first').text()).toEqual('Previous');
            expect(table.$('tfoot tr td ol.pager li:first').data('page')).toEqual(0);
            expect(table.$('tfoot tr td ol.pager li:first').hasClass('prev')).toEqual(true);
        });
        it('Does not render Next link when on last page', function(){
            table.pager.pageSize = 2;

            table.render();

            table.$('tfoot tr td ol.pager li[data-page=2]').click();

            expect(table.$('tfoot tr td ol.pager li:last').text()).toEqual('3');
            expect(table.$('tfoot tr td ol.pager li:last').data('page')).toEqual(2);
        });
        it('calls renderFootTr on render', function(){
            table.renderFootTr = function(){
                return '<tr class="rabbitfoot">';
            };

            table.render();

            expect(table.$('tfoot tr.rabbitfoot').length).toEqual(1);
            // didn't render this anywhere else
            expect(table.$('.rabbitfoot').length).toEqual(1);
        });
        describe('links when lots of pages', function(){
            var testData = (function generateData(i, data){
                if(i-- === 0){
                    return data;
                }
                data.push({
                    column1: '1' + String.fromCharCode(i), column2: '2' + String.fromCharCode(i)
                });
                return generateData(i, data);
            })(250, []);
            beforeEach(function(){
                table.pager.pageSize = 20;
                table.load(testData);
            });
            describe('on first page', function(){
                beforeEach(function(){
                    table.render();
                });
                it('renders the current page li', function(){
                    expect(table.$('tfoot ol.pager li.current').length).toEqual(1);
                    expect(table.$('tfoot ol.pager li.current').text()).toEqual('1');
                    expect(table.$('tfoot ol.pager li.current').data('page')).toEqual(0);
                });
                it('renders the next 5 page links', function(){
                    expect(table.$('tfoot ol.pager li:not(.current,.next,.last)').length).toEqual(5);
                    expect(table.$('tfoot ol.pager li:not(.current,.next,.last)').eq(0).data('page')).toEqual(1);
                    expect(table.$('tfoot ol.pager li:not(.current,.next,.last)').eq(1).data('page')).toEqual(2);
                    expect(table.$('tfoot ol.pager li:not(.current,.next,.last)').eq(2).data('page')).toEqual(3);
                    expect(table.$('tfoot ol.pager li:not(.current,.next,.last)').eq(3).data('page')).toEqual(4);
                    expect(table.$('tfoot ol.pager li:not(.current,.next,.last)').eq(4).data('page')).toEqual(5);
                });
                it('renders the last page link', function(){
                    expect(table.$('tfoot ol.pager li:not(.next):last').text()).toEqual('13');
                    expect(table.$('tfoot ol.pager li:not(.next):last').hasClass('last')).toEqual(true);
                    expect(table.$('tfoot ol.pager li:not(.next):last').data('page')).toEqual(12);
                });
            });
            describe('on mid-point page', function(){
                beforeEach(function(){
                    table.pager.currentPage = 5;
                    table.render();
                });
                it('renders the current page li', function(){
                    expect(table.$('tfoot ol.pager li.current').text()).toEqual('6');
                    expect(table.$('tfoot ol.pager li.current').data('page')).toEqual(5);
                });
                it('renders the first page link with "skipped" class', function(){
                    expect(table.$('tfoot ol.pager li:not(.prev):first').text()).toEqual('1');
                    expect(table.$('tfoot ol.pager li:not(.prev):first').hasClass('first')).toEqual(true);
                    expect(table.$('tfoot ol.pager li:not(.prev):first').hasClass('skipped')).toEqual(true);
                    expect(table.$('tfoot ol.pager li:not(.prev):first').data('page')).toEqual(0);
                });
                it('renders the previous 2 page links before current', function(){
                    var previousLinks = table.$('tfoot ol.pager li.current').prevAll('li:not(.first,.prev)');

                    expect(previousLinks.length).toEqual(2);
                    expect(previousLinks.eq(0).text()).toEqual('4');
                    expect(previousLinks.eq(0).data('page')).toEqual(3);
                    expect(previousLinks.eq(1).text()).toEqual('5');
                    expect(previousLinks.eq(1).data('page')).toEqual(4);
                });
                it('renders the next 3 page links after current', function(){
                    var previousLinks = table.$('tfoot ol.pager li.current').nextAll('li:not(.last,.next)');

                    expect(previousLinks.length).toEqual(3);
                    expect(previousLinks.eq(0).text()).toEqual('7');
                    expect(previousLinks.eq(0).data('page')).toEqual(6);
                    expect(previousLinks.eq(1).text()).toEqual('8');
                    expect(previousLinks.eq(1).data('page')).toEqual(7);
                    expect(previousLinks.eq(2).text()).toEqual('9');
                    expect(previousLinks.eq(2).data('page')).toEqual(8);
                });
                it('renders the last page link with "skipped" class', function(){
                    expect(table.$('tfoot ol.pager li:not(.next):last').text()).toEqual('13');
                    expect(table.$('tfoot ol.pager li:not(.next):last').hasClass('last')).toEqual(true);
                    expect(table.$('tfoot ol.pager li:not(.next):last').hasClass('skipped')).toEqual(true);
                    expect(table.$('tfoot ol.pager li:not(.next):last').data('page')).toEqual(12);
                });
            });
            describe('on last page', function(){
                beforeEach(function(){
                    table.pager.currentPage = 12;
                    table.render();
                });
                it('renders the current page li', function(){
                    expect(table.$('tfoot ol.pager li.current').text()).toEqual('13');
                    expect(table.$('tfoot ol.pager li.current').data('page')).toEqual(12);
                });
                it('renders the first page link', function(){
                    expect(table.$('tfoot ol.pager li:not(.prev):first').text()).toEqual('1');
                    expect(table.$('tfoot ol.pager li:not(.prev):first').hasClass('first')).toEqual(true);
                    expect(table.$('tfoot ol.pager li:not(.prev):first').data('page')).toEqual(0);
                });
                it('renders the last 5 page links', function(){
                    expect(table.$('tfoot ol.pager li:not(.current,.prev,.first)').length).toEqual(5);
                    expect(table.$('tfoot ol.pager li:not(.current,.prev,.first)').eq(0).data('page')).toEqual(7);
                    expect(table.$('tfoot ol.pager li:not(.current,.prev,.first)').eq(0).text()).toEqual('8');
                    expect(table.$('tfoot ol.pager li:not(.current,.prev,.first)').eq(1).data('page')).toEqual(8);
                    expect(table.$('tfoot ol.pager li:not(.current,.prev,.first)').eq(1).text()).toEqual('9');
                    expect(table.$('tfoot ol.pager li:not(.current,.prev,.first)').eq(2).data('page')).toEqual(9);
                    expect(table.$('tfoot ol.pager li:not(.current,.prev,.first)').eq(2).text()).toEqual('10');
                    expect(table.$('tfoot ol.pager li:not(.current,.prev,.first)').eq(3).data('page')).toEqual(10);
                    expect(table.$('tfoot ol.pager li:not(.current,.prev,.first)').eq(3).text()).toEqual('11');
                    expect(table.$('tfoot ol.pager li:not(.current,.prev,.first)').eq(4).data('page')).toEqual(11);
                    expect(table.$('tfoot ol.pager li:not(.current,.prev,.first)').eq(4).text()).toEqual('12');
                });
                it('renders last link', function(){
                    expect(table.$('tfoot ol.pager li.last').length).toEqual(1);
                });
            });
            describe('edge-cases', function(){
                describe('on 4th page out of 4', function(){
                    beforeEach(function(){
                        table.pager.totalResults = 80;
                        table.pager.currentPage = 3;
                        table.render();
                    });
                    it('renders the first 3 pages correctly', function(){
                        var prevLinks = table.$('tfoot ol.pager li.current').prevAll(':not(.prev)');

                        expect(prevLinks.length).toEqual(3);
                        expect(prevLinks.eq(0).data('page')).toEqual(2);
                        expect(prevLinks.eq(1).data('page')).toEqual(1);
                        expect(prevLinks.eq(2).data('page')).toEqual(0);
                        expect(prevLinks.eq(2).hasClass('first')).toEqual(true);
                    });
                });
                describe('on 4th to last page', function(){
                    beforeEach(function(){
                        table.pager.currentPage = 9;
                        table.render();
                    });
                    it('renders the next 4 pages correctly', function(){
                        var nextLinks = table.$('tfoot ol.pager li.current').nextAll(':not(.next)');

                        expect(nextLinks.length).toEqual(3);
                        expect(nextLinks.eq(0).data('page')).toEqual(10);
                        expect(nextLinks.eq(1).data('page')).toEqual(11);
                        expect(nextLinks.eq(2).data('page')).toEqual(12);
                        expect(nextLinks.eq(2).hasClass('last')).toEqual(true);
                    });
                });
                describe('on second page', function(){
                    beforeEach(function(){
                        table.pager.currentPage = 1;
                        table.render();
                    });
                    it('does not give "skipped" class to first element', function(){
                        expect(table.$('tfoot ol.pager li:not(.prev):first').hasClass('first')).toEqual(true);
                        expect(table.$('tfoot ol.pager li:not(.prev):first').hasClass('skipped')).toEqual(false);
                    });
                });
                describe('on third page', function(){
                    beforeEach(function(){
                        table.pager.currentPage = 2;
                        table.render();
                    });
                    it('does not give "skipped" class to first element', function(){
                        expect(table.$('tfoot ol.pager li:not(.prev):first').hasClass('first')).toEqual(true);
                        expect(table.$('tfoot ol.pager li:not(.prev):first').hasClass('skipped')).toEqual(false);
                    });
                });
                describe('on fourth page', function(){
                    beforeEach(function(){
                        table.pager.currentPage = 3;
                        table.render();
                    });
                    it('does not give "skipped" class to first element', function(){
                        expect(table.$('tfoot ol.pager li:not(.prev):first').hasClass('first')).toEqual(true);
                        expect(table.$('tfoot ol.pager li:not(.prev):first').hasClass('skipped')).toEqual(false);
                    });
                });
                describe('on fifth page', function(){
                    beforeEach(function(){
                        table.pager.currentPage = 4;
                        table.render();
                    });
                    it('gives "skipped" class to first element', function(){
                        expect(table.$('tfoot ol.pager li:not(.prev):first').hasClass('first')).toEqual(true);
                        expect(table.$('tfoot ol.pager li:not(.prev):first').hasClass('skipped')).toEqual(true);
                    });
                });
                describe('on last but one page', function(){
                    beforeEach(function(){
                        table.pager.currentPage = 12;
                        table.render();
                    });
                    it('does not give "skipped" class to last element', function(){
                        expect(table.$('tfoot ol.pager li:not(.next):last').hasClass('last')).toEqual(true);
                        expect(table.$('tfoot ol.pager li:not(.next):last').hasClass('skipped')).toEqual(false);
                    });
                });
                describe('on last but two page', function(){
                    beforeEach(function(){
                        table.pager.currentPage = 11;
                        table.render();
                    });
                    it('does not give "skipped" class to last element', function(){
                        expect(table.$('tfoot ol.pager li:not(.next):last').hasClass('last')).toEqual(true);
                        expect(table.$('tfoot ol.pager li:not(.next):last').hasClass('skipped')).toEqual(false);
                    });
                });
                describe('on last but three page', function(){
                    beforeEach(function(){
                        table.pager.currentPage = 10;
                        table.render();
                    });
                    it('does not give "skipped" class to last element', function(){
                        expect(table.$('tfoot ol.pager li:not(.next):last').hasClass('last')).toEqual(true);
                        expect(table.$('tfoot ol.pager li:not(.next):last').hasClass('skipped')).toEqual(false);
                    });
                });
                describe('on last but four page', function(){
                    beforeEach(function(){
                        table.pager.currentPage = 9;
                        table.render();
                    });
                    it('does not give "skipped" class to last element', function(){
                        expect(table.$('tfoot ol.pager li:not(.next):last').hasClass('last')).toEqual(true);
                        expect(table.$('tfoot ol.pager li:not(.next):last').hasClass('skipped')).toEqual(false);
                    });
                });
                describe('on last but five page', function(){
                    beforeEach(function(){
                        table.pager.currentPage = 8;
                        table.render();
                    });
                    it('does not give "skipped" class to last element', function(){
                        expect(table.$('tfoot ol.pager li:not(.next):last').hasClass('last')).toEqual(true);
                        expect(table.$('tfoot ol.pager li:not(.next):last').hasClass('skipped')).toEqual(true);
                    });
                });
                describe('"6 pages results', function(){
                    beforeEach(function(){
                        table.pager.pageSize = 42; // equals 6 pages
                    });
                    it('does not add "skipped" to any element on any page', function(){
                        _.each([0,1,2,3,4,5], function(i) {
                            table.pager.currentPage = i;
                            table.render();
                            expect(table.$('tfoot ol.pager li:not(.next, .prev).skipped').length).toEqual(0);
                        });
                    });
                });
            });
        });
        describe('works with server-side paging', function(){
            var fetchSpy;
            beforeEach(function(){
                table.pager.pageSize = 2;

                table.fetch = fetchSpy = sinon.spy(function(options, done){
                    done({items: [], totalResults: 5});
                });

                table.render();
            });
            it('calls fetch override with correct paging options', function(){
                expect(table.$('tfoot ol.pager li.next').length).toEqual(1);

                table.$('tfoot ol.pager li.next').click();

                expect(fetchSpy.calledTwice).toEqual(true);
                expect(fetchSpy.args[0][0].currentPage).toEqual(0);
                expect(fetchSpy.args[0][0].pageSize).toEqual(2);
                expect(fetchSpy.args[1][0].currentPage).toEqual(1);
                expect(fetchSpy.args[1][0].pageSize).toEqual(2);
            });
        });
        describe('standalone', function(){
            it('can be rendered without a tabler instance', function(){
                var Pager = pager,
                    p = new Pager(),
                    $pager;

                p.attach({
                    $el: $('<div />')
                });

                p.currentPage = 3;
                p.totalResults = 300;

                $pager = $(p.render());

                expect($pager.is('ol')).toEqual(true);
                expect($pager.hasClass('pager')).toEqual(true);
                expect($pager.find('li').length).toEqual(10);
                expect($pager.find('li').eq(4).hasClass('current')).toEqual(true);
            });
            it('can be used without a tabler instance', function(){
                var Pager = pager,
                    fetchSpy = sinon.spy(function(options, callback){
                        callback({items: []});
                    }),
                    p = new Pager(),
                    $el = $('<div />');

                p.attach({
                    $el: $el,
                    fetch: fetchSpy
                });

                p.totalResults = 300;

                $el.append(p.render());

                $el.find('li:eq(3)').click();

                expect(p.currentPage).toEqual(3);
                expect(fetchSpy.calledOnce).toEqual(true);
                expect(fetchSpy.args[0][0].currentPage).toEqual(3);
                expect(fetchSpy.args[0][0].pageSize).toEqual(20);
            });
        });
    });
});
