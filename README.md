Tabler.js
========

[![Build Status](https://travis-ci.org/BrandwatchLtd/tabler.png?branch=master)](https://travis-ci.org/BrandwatchLtd/tabler)

A lightweight library for building dynamic tables. [View the demos](http://brandwatchltd.github.com/tabler/demo/)

## Including tabler in your project

Tabler works as an AMD module or standalone

### AMD

    define(['lib/tabler/tabler', 'lib/tabler/tabler.sortable'], function(tabler, sortable){
        // Your module code
        var table = tabler.create(columns, {plugins: [sortable]});

        table.load([..data..]);
        table.render();

        $(..el..).append(table.$el);
        // More your module code
    });

### Standalone

Just reference the scripts directly, ensuring any plugins are added *after* the tabler.js script itself.

Tabler will be available via the `tabler` global object.  The plugins will hang off `tabler.pluginName`.

## Usage

This is the simplest way to use tabler:

    var table = tabler.create();
    table.load([..array of objects..]);
    table.render();

    $(..el..).append(table.$el);

Tabler will automatically create a "spec" from the objects you passed in and render the data.

### Customising the output

Of course you probably want to change which columns are shown, change the formatting of cells, add column titles etc.

This is done by passing an array of column "specs" to the `tabler.create()` method, a typical example:

    var table = tabler.create([
        {field: 'name', name: 'Name'},
        {field: 'apples', name: '# Apples'},
        {field: 'bananas', name: '# Bananas'}
    ]);

    table.load([
        {name: 'Steve', apples: 2, bananas: 4},
        {name: 'Graham', apples: 1, bananas: 6},
        {name: 'Dan', apples: 9, bananas: 2},
        {name: 'Jon', apples: 5, bananas: 6}
    ]);
    table.render();

The Default set of configuration parameters are:

* id: A unique ID for the row, if not specified then one will be generated from either the `field` or `name` property (in that order).  If an ID is not unique, then an error will be thrown.
* field: The field from each row to render
* name: The title for the column that will appear in the header. If you do not specify a name attribute for any column then the table will not have any columns
* defaultText: text to show in each cell if the "value" is one of '', null, undefined or NaN
* className: a CSS class name to give each cell in this column (header th's and body td's)
* headerClassName: CSS class name to give the header cell (th) in this column (overrides className if set)
* width: a width (set via CSS width: attribute) to give this column
* formatter: A function(value, colSpec, row, index) that returns formatted HTML for the row (eg wrap each number in a link)
* headerFormatter: A function(colSpec, title) that returns formatted HTML for the column header (eg wrap in a link)
* disabled: true/false whether the table should render the column at all

NOTE: If a formatter is provided, it is the responsibility of that function to escape any user input such as `row` values using `_.escape()` or equivalent. Tabler will always escape the `value` argument for you.

Plugins may add support for additional parameters (see below)

### Additional tabler options

You can also pass an options hash to the tabler.create method:

    var table = tabler.create([..spec..], {..options..});

It supports the following set of parameters:

* plugins: An array of plugins to load into this instance (see below)
* className: A CSS classname to put on the <table> element
* fetch: A function(options, callback) that will be called during `render` to fetch the data to be displayed.  If this is given the `load` method will have no effect and you will be responsible for applying paging, sorting etc - you will be supplied the necessary values through the `options` hash.  When you are ready to call back with the data to render, you can call `callback` with an object with an `items` array of the returned results and a `totalResults` value which is the total number of results in the overall results set (ie not just the current page but *all* items across all pages)


### Partial updates of rows

Call `update(index, object, options)` to update the row at `index` with the data given in `object`, allows you to partially update one row of the table at a time

The updates are actually applied at a _td_ level, by inspecting the fields given in `object` and only updating cells with a `field` set to those values.

This can cause issues if you have a customer `formatter` that looks at other fields, so you can use the `updateFields` property to give tabler an extra *hint* about which columns should update

If you want to turn this off completely, and force a re-render of the entire row, pass `invalidateRow: true` in the `options`

## Using Plugins

Simply pass the plugins in the options to the `create` method:

    var table = tabler.create([..spec..], {plugins: [pager], pager: {pageSize: 10, currentPage: 0}});
    // table.pager and table.sortable are now available and automatically applied on the next call to `render`

Or add plugins later on:

    table.addPlugin(pager, {pageSize: 10, currentPage: 0})

As you can see some plugins have options that you can pass in the create options or in the second parameter to `addPlugin`.  They can also be accessed/changed after the fact on the plugin object itself (eg `tabler.pager.pageSize` etc)

The included plugins also work as AMD modules or standalone scripts

## Included Plugins

Tabler has a number of plugins that come out-of-the-box

### aggregator

Allows you to add an aggregator function to each column which can perform calculations, the function runs a reduce-like function on each row of data, displaying the final result in the footer of the table:

    function totaliser(memo, value){
        return (memo || 0) + value;
    }

    var table = tabler.create([
        {name: 'Apples', field: 'apples', aggregator: totaliser}
    ]);
    table.render();

    // The Apples tfoot td now has the total of all apples cells

### columnGrouper

Allows you to group columns

    var table = tabler.create([
        {field: 'name', name: 'Name'},
        {field: 'apples', name: '# Apples', columnGroup: 'Fruit'},
        {field: 'bananas', name: '# Bananas', columnGroup: 'Fruit'}
    ]);
    table.render();

    The table will now have a th spanning the second and third column with the content "Fruit"

### pager

Adds a pager to the footer of the table, with next/prev/first/last links & client-side paging capabilities (by default)

    table.addPlugin(pager, {
        pageSize: 20,
        currentPage: 1,
        hideWhenOnePage: true
    });
    table.render();

Options:

* pageSize: The size of each page. Defaults to `20`
* currentPage: The current page index, zero-based. Defaults to `0`
* hideWhenOnePage: Hides the controls when there is just one page to display. Defaults to `false`
* totalResults: The total number of results (useful for server-side paging)

If you have your own `fetch` override function, you will get a `pageSize` and `currentPage` parameter in the `options` hash to perform your own paging with

### pageSize

Adds a simple page size dropdown to the pager footer row (requires pager plugin)

    table.addPlugin(pageSize, {sizes: [10, 25, 50]});

If the `sizes` option is not passed in, then a default set of sizes of [20, 50, 100] is used

### sortable

Adds anchors to designated column headers, making them sortable on click

    var table = tabler.create([
        {field: 'name', name: 'Name'},
        {field: 'apples', name: '# Apples', columnGroup: 'Fruit', sortable: true},
        {field: 'bananas', name: '# Bananas', columnGroup: 'Fruit', sortable: true}
    ]);

Options:

* field: the (default) field to sort by
* dir: the (default) sort direction (`asc`, `desc`) - defaults to `desc`

If you have your own `fetch` override function, you will get a `field` and `direction` parameter in the `options` hash to perform your own sorting with

### toggleColumns

This adds a "Columns" button into the table header, which when clicked allows the user to choose which columns to show/hide.

Internally, hiding a column is the same as setting `disabled: true` on it. Columns can be opted out of being toggleable by setting `toggleable: false` on the spec.

### jumpToPage

Used in conjunction with the pager plugin, adds a "Jump to page" input box into the pager row, which allows the user to jump directly to a specific page of results.

### removeColumns

Adds an "x" link to each toggleable column header and column group, which disables the column when clicked
