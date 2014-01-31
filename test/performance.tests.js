define([
        'lib/tabler/tabler',
        'lib/tabler/tabler.aggregator',
        'lib/tabler/tabler.columnGrouper',
        'lib/tabler/tabler.jumpToPage',
        'lib/tabler/tabler.pager',
        'lib/tabler/tabler.pageSize',
        'lib/tabler/tabler.removeColumns',
        'lib/tabler/tabler.sortable',
        'lib/tabler/tabler.toggleColumns'
    ],
    function(
        tabler,
        aggregator,
        columnGrouper,
        jumpToPage,
        pager,
        pageSize,
        removeColumns,
        sortable,
        toggleColumns
    ){
    'use strict';
    /*globals console*/
    describe('performance', function(){
        var iters = 50,
            massiveSpec = [
            {id: '0', field: 'field0', groupName: 'group1', formatter: function(){return 'field0';}},
            {id: '1', field: 'field1', groupName: 'group1', formatter: function(){return 'field1';}},
            {id: '2', field: 'field2', groupName: 'group2', formatter: function(){return 'field2';}},
            {id: '3', field: 'field3', groupName: 'group2', formatter: function(){return 'field3';}},
            {id: '4', field: 'field4', groupName: 'group3', formatter: function(){return 'field4';}},
            {id: '5', field: 'field5', groupName: 'group3', formatter: function(){return 'field5';}},
            {id: '6', field: 'field6', groupName: 'group4', formatter: function(){return 'field6';}},
            {id: '7', field: 'field7', groupName: 'group4', formatter: function(){return 'field7';}},
            {id: '8', field: 'field8', groupName: 'group5', formatter: function(){return 'field8';}},
            {id: '9', field: 'field9', groupName: 'group5', formatter: function(){return 'field9';}},
            {id: '10', field: 'field10', groupName: 'group1', formatter: function(){return 'field10';}},
            {id: '11', field: 'field11', groupName: 'group1', formatter: function(){return 'field11';}},
            {id: '12', field: 'field12', groupName: 'group2', formatter: function(){return 'field12';}},
            {id: '13', field: 'field13', groupName: 'group2', formatter: function(){return 'field13';}},
            {id: '14', field: 'field14', groupName: 'group3', formatter: function(){return 'field14';}},
            {id: '15', field: 'field15', groupName: 'group3', formatter: function(){return 'field15';}},
            {id: '16', field: 'field16', groupName: 'group4', formatter: function(){return 'field16';}},
            {id: '17', field: 'field17', groupName: 'group4', formatter: function(){return 'field17';}},
            {id: '18', field: 'field18', groupName: 'group5', formatter: function(){return 'field18';}},
            {id: '19', field: 'field19', groupName: 'group5', formatter: function(){return 'field19';}},
            {id: '20', field: 'field20', groupName: 'group6', formatter: function(){return 'field20';}},
            {id: '21', field: 'field21', groupName: 'group6', formatter: function(){return 'field21';}},
            {id: '22', field: 'field22', groupName: 'group6', formatter: function(){return 'field22';}},
            {id: '23', field: 'field23', groupName: 'group7', formatter: function(){return 'field23';}},
            {id: '24', field: 'field24', groupName: 'group7', formatter: function(){return 'field24';}},
            {id: '25', field: 'field25', groupName: 'group8', formatter: function(){return 'field25';}},
            {id: '26', field: 'field26', groupName: 'group8', formatter: function(){return 'field26';}},
            {id: '27', field: 'field27', groupName: 'group8', formatter: function(){return 'field27';}},
            {id: '28', field: 'field28', groupName: 'group8', formatter: function(){return 'field28';}},
            {id: '29', field: 'field29', groupName: 'group9', formatter: function(){return 'field29';}},
            {id: '30', field: 'field30', groupName: 'group9', formatter: function(){return 'field30';}},
            {id: '31', field: 'field31', groupName: 'group10', formatter: function(){return 'field31';}},
            {id: '32', field: 'field32', groupName: 'group10', formatter: function(){return 'field32';}},
            {id: '33', field: 'field33', groupName: 'group11', formatter: function(){return 'field33';}}
        ];
        function createFullyLoadedTabler(){
            return tabler.create(massiveSpec, {
                plugins: [
                    aggregator,
                    columnGrouper,
                    pager,
                    pageSize,
                    jumpToPage,
                    removeColumns,
                    sortable,
                    toggleColumns
                ]
            });
        }
        it('can instantiate a regular instance in < 1ms', function(){
            var start = new Date().getTime(),
                i = iters;

            while(i--){
                tabler.create(massiveSpec);
            }

            expect((new Date().getTime() - start) / iters).toBeLessThan(1);
        });
        it('can instantiate a fully-loaded instance in < 2ms', function(){
            var start = new Date().getTime(),
                i = iters;

            console.profile('fully loaded');
            while(i--){
                createFullyLoadedTabler();
            }
            console.profileEnd('fully loaded');

            expect((new Date().getTime() - start) / iters).toBeLessThan(2);
        });
    });
});
