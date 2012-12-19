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
require(['jquery', 'tabler.tests.js'], function(){
    'use strict';
    mocha.run();
});