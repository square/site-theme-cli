import path from 'path'
// const path = require('path')
process.env.TS_NODE_PROJECT = path.resolve('test/tsconfig.json');
console.log(process.env.TS_NODE_PROJECT)
process.env.NODE_ENV = 'development'

global.oclif = global.oclif || {}
global.oclif.columns = 80
