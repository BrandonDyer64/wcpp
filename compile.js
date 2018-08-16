#!/usr/bin/env node

const cp = require('child_process')
const fs = require('fs')

const walk = require('./util/walk')

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
      fs.writeFileSync(`./wcpp-temp.cpp`, newData, 'utf8')
      const command = `emcc ./wcpp-temp.cpp -o ./wasm${newFile} -s EXPORTED_FUNCTIONS="[${functions}]"`
      const result = cp.exec(command, (err, stdout, stderr) => {
        if (err) {
          console.log(err)
        }
        if (stdout) {
          console.log(stdout)
        }
        if (stderr) {
          console.log(stderr)
        }
      })
    }
  }
})
