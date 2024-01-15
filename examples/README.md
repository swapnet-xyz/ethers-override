# How to run this example

## Preparation
If you haven't done it yet, run `npm install` or `yarn` to install all dependencies.

## Usage
The example has two versions, one uses esm (`index.ts`), the other one uses commonJs (`index.cts`). 

First build both files with tsc:
```bash
yarn build
```
```bash
npm build
```

Then choose one of the versions to run:
```bash
yarn start # default is esm: dist/index.js
# yarn start:esm
```
```bash
npm start
# npm start:esm
```
or
```bash
yarn start:commonjs # run cjs file: dist/index.cjs
```
```bash
npm start:commonjs
```