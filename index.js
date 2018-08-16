const { getCallerDir } = require('./util/caller')
const path = require('path')
const fs = require('fs')
const util = require('util')

function toArrayBuffer(buf) {
  var ab = new ArrayBuffer(buf.length)
  var view = new Uint8Array(ab)
  for (var i = 0; i < buf.length; ++i) {
    view[i] = buf[i]
  }
  return ab
}

// Load as js
module.exports = file => {
  const callerDir = getCallerDir(2)
  file = (file + '%').replace('.cpp%', '').replace('%', '')
  const module = require(`${callerDir}/wasm/${file}.js`)
  let exports = {}
  for (let i in module) {
    if (i.toString() == '_module') {
      exports = module[i]
    }
  }
  for (let i in module) {
    if (i.toString().startsWith('_')) {
      exports[i.substr(1)] = module[i]
    }
  }
  return new Promise((resolve, reject) => {
    module['onRuntimeInitialized'] = function() {
      resolve(exports)
    }
  })
}

// Load file synchronously
module.exports.w = file => {
  const env = {
    memoryBase: 0,
    tableBase: 0,
    memory: new WebAssembly.Memory({
      initial: 256
    }),
    table: new WebAssembly.Table({
      initial: 0,
      element: 'anyfunc'
    })
  }

  const callerDir = getCallerDir()
  const source = fs.readFileSync(`${callerDir}/wasm/${file}.wasm`)
  const module = new WebAssembly.Module(new Uint8Array(source), {
    env: env
  })
  const instance = new WebAssembly.Instance(module)
  return instance.exports
}

// Load file asynchronously
module.exports.as = file => {
  return new Promise((resolve, reject) => {
    const env = {
      memoryBase: 0,
      tableBase: 0,
      memory: new WebAssembly.Memory({
        initial: 256
      }),
      table: new WebAssembly.Table({
        initial: 0,
        element: 'anyfunc'
      })
    }

    const callerDir = getCallerDir()
    const source = fs.readFileSync(`${callerDir}/wasm/${file}.wasm`)
    const instance = WebAssembly.instantiate(new Uint8Array(source), {
      env: env
    })
      .then(result => {
        resolve(result.instance.exports)
      })
      .catch(e => {
        // error caught
        reject(e)
      })
  })
}
