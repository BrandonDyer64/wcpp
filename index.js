const { getCallerDir } = require('./util/caller')
const path = require('path')
const fs = require('fs')
const util = require('util')

const ENVIRONMENT_IS_WEB = typeof window === 'object'

function toArrayBuffer(buf) {
  var ab = new ArrayBuffer(buf.length)
  var view = new Uint8Array(ab)
  for (var i = 0; i < buf.length; ++i) {
    view[i] = buf[i]
  }
  return ab
}

const cppExportCache = {}

// Override require to accept C++ files
const Module = require('module')
const originalRequire = Module.prototype.require

Module.prototype.require = function() {
  const file = arguments[0]
  if (file.endsWith('.cpp')) {
    return module.exports(file, 4)
  } else {
    return originalRequire.apply(this, arguments)
  }
}

// Load as js
module.exports = (file, shift = 2) => {
  if (!file) {
    return
  }
  const callerDir = getCallerDir(shift)
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

module.exports.sync = () => {
  if (ENVIRONMENT_IS_WEB) {
    console.error(
      'It is not reccomended to use wcpp.sync() in a web environment.',
      'Large files will not be imported.'
    )
  }
  const Module = require('module')

  Module.prototype.require = function() {
    const file = arguments[0]
    if (file.endsWith('.cpp')) {
      return requireSync(file, 4)
    } else {
      return originalRequire.apply(this, arguments)
    }
  }
}

// Load file synchronously
const requireSync = (file, shift = 2) => {
  file = (file + '%').replace('.cpp%', '').replace('%', '')
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

  const callerDir = getCallerDir(shift)
  const source = fs.readFileSync(`${callerDir}/wasm/${file}.wasm`)
  if (source in cppExportCache) {
    return cppExportCache[source]
  }
  const module = new WebAssembly.Module(new Uint8Array(source), {
    env: env
  })
  const instance = new WebAssembly.Instance(module)
  let exports = {}
  for (let i in instance.exports) {
    if (i.toString() == '_module') {
      exports = instance.exports[i]
    }
  }
  cppExportCache[source] = exports
  for (let i in instance.exports) {
    if (i.toString().startsWith('_')) {
      exports[i.substr(1)] = instance.exports[i]
    }
  }
  return exports
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
