const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const plugin = require('../lib');

const inputPath = path.join(__dirname, '../example/input.js');
const outputPath = path.join(__dirname, '../example/output.js');

const code = babel.transformFileSync(inputPath, {
  plugins: [plugin],
}).code;

fs.writeFileSync(outputPath, code);
