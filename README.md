# WCPP

A node module to make writing C/C++ in JavaScript not painful.

Using the power of WebAssebly, wcpp projects run both in node and on the web.

```bash
npm i -g wcpp
```

## A C++ File

```cpp
// addTwo.cpp

export int addTwo(int a, int b) {
  return a + b;
}
```

We need `export` to tell our compiler to make this function available to node.

To compile all of our C/C++ files to wasm, we enter our project root and run:

```bash
$ wcpp
```

You should see a list of C/C++ files that have been compiled.

## Some JavaScript

All we have to do now is require our C++ file the same way we would require a JS file.

```js
const ourModule = await require('wcpp')('./addTwo.cpp')

console.log(ourModule.addTwo(2, 3))
```

Note the `await`. `require('wcpp')` returns a promise.

We could put this in an anonymous async function:

```js
;(async () => {
  // Require our module
  const addTwo = await require('wcpp')('./addTwo.cpp')

  console.log(addTwo(2, 3))
})()
```

Or use it as a promise:

```js
require('wcpp')('./addTwo.cpp').then(addTwo => {
  console.log(addTwo(2, 3))
})
```

## Function as a Module

We can make our function into a module by naming the function `module`

```cpp
// C++

export int module(int a, int b) {
  return a + b;
}

export int timesTwo(int a, int b) { // We can still make other functions
  return a * b;
}
```

```js
// JavaScript

const addTwo = await require('wcpp')('./addTwo.cpp')

console.log(addTwo(2, 3))
console.log(addTwo.timesTwo(2, 3)) // Our other function
```
