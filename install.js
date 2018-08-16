#!/usr/bin/env node

const fs = require('fs')
const exec = require('./util/exec')

const appRoot = require('app-root-path')
const homedir = require('os').homedir()
;(async () => {
  try {
    fs.mkdirSync(`${homedir}/.wcpp`)
  } catch (e) {}
  const command = fs
    .readFileSync(appRoot + '/install.sh', 'utf8')
    .replace(new RegExp('\n', 'g'), ';')
    .replace('{{homedir}}', homedir)
  exec(command)
    .then(out => {
      console.log('OUT ' + out)
    })
    .catch(err => {
      console.error('err ' + err)
    })
})()
