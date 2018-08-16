#!/usr/bin/env node

const process = require('process')
const cp = require('child_process')
const fs = require('fs')

const walk = require('./util/walk')
const homedir = require('os').homedir()

const defaultConfig = {
  release: false,
  optimization: '-O1'
}

for (var i = 2; i < process.argv.length; i++) {
  const argv = process.argv[i]
  let params = argv.split('=')
  switch (params[0]) {
    case '--release':
      defaultConfig.release = true
      defaultConfig.optimization = `-O3`
      break
    case 'optimization':
      defaultConfig.optimization = `-O${params[1]}`
      break
  }
}

walk('.').then(dirs => {
  if (!dirs.includes(process.cwd() + '/package.json')) {
    console.log('This is not the root of a node package.')
    console.log('Please run in a directory with a `package.json` file.')
    return
  }
  for (let i in dirs) {
    const dir = dirs[i].replace(process.cwd(), '')
    if (dir.endsWith('.cpp') && !dir.endsWith('wcpp-temp.cpp')) {
      console.log(dir)
      let newFile = dir.replace('.cpp', '.js')
      const data = fs.readFileSync(`.${dir}`, 'utf8')
      const lines = data.split('\n')
      lines.unshift('#include <emscripten/emscripten.h>')
      let functions = []
      let isExportStarted = false
      for (let j in lines) {
        const line = lines[j]
        if (line.startsWith('export ')) {
          // Remove export declaration
          if (isExportStarted) {
            lines[j] = line.replace('export ', 'EMSCRIPTEN_KEEPALIVE\n')
          } else {
            lines[j] = line.replace(
              'export ',
              '#ifdef __cplusplus\nextern "C" {\n#endif\nEMSCRIPTEN_KEEPALIVE\n'
            )
          }
          isExportStarted = true
          const functionName = line
            .split('(')[0]
            .split(' ')
            .pop()
          functions.push(`'_${functionName}'`)
        }
      }
      if (isExportStarted) {
        lines.push('#ifdef __cplusplus\n}\n#endif')
      }
      functions = functions.join(',')
      const newData = lines.join('\n')
      const tempFile = 'temp' + dir.replace(new RegExp('/', 'g'), '.')
      fs.writeFileSync(`./${tempFile}`, newData, 'utf8')
      const command =
        `source ${homedir}/.wcpp/emsdk/emsdk_env.sh; ` +
        `emcc ./${tempFile} ` +
        `-o ./wasm${newFile} ` +
        `-s EXPORTED_FUNCTIONS="[${functions}]" ` +
        `${defaultConfig.optimization}`
      const result = cp.exec(
        command,
        { shell: '/bin/bash' },
        (err, stdout, stderr) => {
          if (err) {
            console.log(err)
          }
          if (stderr) {
            console.log(stderr)
          }
          fs.unlinkSync(`./${tempFile}`)
        }
      )
    }
  }
})
