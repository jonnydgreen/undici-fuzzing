# undici-fuzzing

Undici fuzzing investigations using [`jsfuzz`](https://gitlab.com/gitlab-org/security-products/analyzers/fuzzers/jsfuzz).

## Installation

Install `undici` dependencies

```sh
cd undici && npm i
```

## Usage

In the folder `fuzzing`, you will find all the different types of fuzzing operations to be run. When run, these will run indefinitely and will output coverage reports to the `coverage` folder.

To trigger a run:

```sh
npx jsfuzz fuzzing/<fuzz-definition>.js corpus
```

For a request options test:

```sh
npx jsfuzz fuzzing/request-options.js corpus
```
