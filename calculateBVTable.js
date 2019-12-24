const bvToRgb =require('./util/bvToRgb');
const fs = require('fs');

//calculate a BV from values 0-5.5
const MIN = 0;
const MAX = 5;
const ROWS = 100;
const STEP = (MAX - MIN) / ROWS;

let data = {min: MIN, max: MAX, step: STEP, bv: []};

for(let i = 0; i < ROWS; i++) {
    data.bv[i] = bvToRgb(i * STEP);
}

fs.writeFile('bvTable.js', `export default ${JSON.stringify(data)};`, () => {});

