const cp = require('child_process')

module.exports = command => {
  return new Promise((resolve, reject) => {
    const result = cp.exec(command, (err, stdout, stderr) => {
      if (err) {
        reject(err)
      } else if (stderr) {
        reject(stderr)
      } else {
        resolve(stdout)
      }
    })
  })
}
