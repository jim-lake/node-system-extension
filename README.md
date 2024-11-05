# node-system-extension

Allow Electron to install a system extension

Requires GCD, so will need to run on something running NSRunLoop.
In modern electron the render processes don't run NSRunLoop.

## Prerequisites

You will need a SystemExtension in `PACKAGE/Contents/Library/SystemExtensions`

You will need to copy your app to `/Applications` before you run it.

## Usage

`
const SystemExtension = require('node-system-extension');

SystemExtension.setDebug(true);
SystemExtension.install("com.example.name.Extension", (reason, ident, result) => {
  console.log("got event:", reason, ident, result);
});
`
