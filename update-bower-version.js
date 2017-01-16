// https://qubyte.codes/blog/tip-customizing-npm-version

var fs = require('fs');
var bowerJsonPath = require.resolve('./bower');
var bowerJson = require(bowerJsonPath);

bowerJson.version = process.env.npm_package_version; // npm injects this

fs.writeFileSync(bowerJsonPath, JSON.stringify(bowerJson, null, 2));
