#!/usr/bin/env node

var program = require('commander');

program
  .parse(process.argv);

var command = program.args[0];

if (!command) throw new Error('请您输入需要执行的命令');

if (command === 'transform') {
  require('art-velocity');
} else if (command === 'parse') {
  require('./parse');
}


