var fs = require('fs')
var path = require('path')

module.exports = dir => {
  var doWalk = function(dir, done) {
    var results = []
    fs.readdir(dir, function(err, list) {
      if (err) return done(err)
      var pending = list.length
      if (!pending) return done(null, results)
      list.forEach(function(file) {
        file = path.resolve(dir, file)
        fs.stat(file, function(err, stat) {
          if (stat && stat.isDirectory()) {
            doWalk(file, function(err, res) {
              results = results.concat(res)
              if (!--pending) done(null, results)
            })
          } else {
            results.push(file)
            if (!--pending) done(null, results)
          }
        })
      })
    })
  }
  return new Promise((resolve, reject) => {
    doWalk(dir, (err, dirs) => {
      if (err) reject(err)
      else resolve(dirs)
    })
  })
}
