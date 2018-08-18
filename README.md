# WCPP

A node module to make writing C/C++ in JavaScript not painful.

Using the power of WebAssebly, wcpp projects run both in node and on the web.

```bash
npm i -g wcpp
```

## Installing Emscripten

WCPP comes with an Emscripten installer and will automatically source environment variables upon compile.

```bash
$ wcpp-install
```

## A C++ File

```cpp
// addTwo.cpp

export int addTwo(int a, int b) {
  return a + b;
}
```

We need `export` to tell our compiler to make this function available to JavaScript.

To compile all of our C/C++ files to wasm, we enter our project root and run:

```bash
$ wcpp
```

The first time running this command will be a bit slow.

You should see a list of C/C++ files that have been compiled.

## Our JavaScript

All we have to do now is require our C++ file the same way we would require a JS file.

```js
require('wcpp')

const ourModule = require('./addTwo.cpp')

console.log(ourModule.addTwo(2, 3))
```

If you want to both use wcpp in the web and inculde a lare C++ file, you'll
need to use it asynchronously.

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

## Use Functions as Modules

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

require('wcpp')

const addTwo = await require('./addTwo.cpp')

console.log(addTwo(2, 3))
console.log(addTwo.timesTwo(2, 3)) // Our other function
```
