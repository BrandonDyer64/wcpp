// From https://stackoverflow.com/a/13227808/4208022

function getCallerDir(shift = 1) {
  var stack = getStack()

  // Return caller's caller
  return /\(([^)]+)\)/
    .exec(stack[shift].toString())[1]
    .split(':')[0]
    .split('/')
    .slice(0, -1)
    .join('/')
}

function getStack() {
  // Save original Error.prepareStackTrace
  var origPrepareStackTrace = Error.prepareStackTrace

  // Override with function that just returns `stack`
  Error.prepareStackTrace = function(_, stack) {
    return stack
  }

  // Create a new `Error`, which automatically gets `stack`
  var err = new Error()

  // Evaluate `err.stack`, which calls our new `Error.prepareStackTrace`
  var stack = err.stack

  // Restore original `Error.prepareStackTrace`
  Error.prepareStackTrace = origPrepareStackTrace

  // Remove superfluous function call on stack
  stack.shift() // getStack --> Error

  return stack
}

module.exports = { getCallerDir }
