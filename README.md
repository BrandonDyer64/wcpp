# WCPP

A node module to make writing C/C++ in JavaScript not painful.

Using the power of WebAssebly, wcpp projects run both in node and on the web.

```bash
npm i -g wcpp
```

## Installing Emscripten

WCPP comes with an Emscripten installer and will automatically source environment variables upon comile.

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

const addTwo = await require('wcpp')('./addTwo.cpp')

console.log(addTwo(2, 3))
console.log(addTwo.timesTwo(2, 3)) // Our other function
```

## Optimizing

Running `wcpp` is usually enough in testing, but when your project is ready to
go public, you may want to use the `--release` flag.

### Release Mode

```
$ wcpp --release
```

This will run the compiler at full optimize mode. It will shrink the js includer
and wasm file tremendously, and apply asm.js optimizations.

### Custom Optimization Level

```
$ wcpp optimization=3
```

This will set the compiler flag `-O3`. For other flags, view
[this](https://kripken.github.io/emscripten-site/docs/tools_reference/emcc.html#emcc-compiler-optimization-options) page.
