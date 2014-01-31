/*globals mocha*/
require.config({
    baseUrl: '/',
    paths: {
        'tabler': '../',
        'jquery': 'test/lib/jquery-1.7.1',
        'underscore': 'test/lib/underscore'
    }
});
mocha.setup({
    ui: 'bdd',
    globals: ['jQuery']
});
require(['jquery',
        'test/tabler.tests',
        'test/tabler.aggregator.tests',
        'test/tabler.columnGrouper.tests',
        'test/tabler.jumpToPage.tests',
        'test/tabler.pageSize.tests',
        'test/tabler.pager.tests',
        'test/tabler.toggleColumns.tests',
        'test/tabler.removeColumns.tests',
        'test/tabler.sortable.tests',
        'test/tabler.columnGrouper.tests',
        'test/performance.tests'
    ], function(){
    'use strict';
    mocha.run();
});
