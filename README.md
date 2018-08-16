# WCPP

A node module to make writing C/C++ in JavaScript not painful.

Using the power of WebAssebly, wcpp projects run both in node and on the web.

## A C++ File

```cpp
// addTwo.cpp

export int addTwo(int a, int b) {
  return a + b;
}
```

We need `export` to tell our compiler to make this function available to node.

## Some JavaScript

All we have to do now is require our C++ file the same way we would require a JS file.

```js
const ourModule = await require('wcpp')('./addTwo.cpp')

console.log(ourModule.addTwo(2, 3))
```

Note the `await`. `require('wcpp')` returns a promise.

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
