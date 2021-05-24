# Fuzzing investigations

Tools looked at:

- [`jsfuzz`](https://www.npmjs.com/package/jsfuzz)

## Table of Contents

- [Summary](#summary)
- [Structure](#structure)
- [Implementation details to resolve](#implementation-details-to-resolve)
- [CI considerations](#ci-considerations)
- [Open questions](#open-questions)

## Summary

As recommended in the initial issue https://github.com/nodejs/undici/issues/677, `jsfuzz` provides a simple way of fuzzing a library's methods. It has most of the functionality we need but there are a couple of things that still need to be [resolved](#issues).

`jsfuzz` has the following core features:

- Input buffer value provided as the argument to the entry function.
- Can store a corpus for replayability.
- Runs indefinitely.
- Provides metrics as it is run.
- Will quit with the appropriate information if an error is thrown.

Its simplicity allows us to provide a flexible solution to running fuzz operations in the CI. When implementing a full solution, it will be key to make sure that contributors can define additional functions with ease within the overall framework. This repo has a basic example that could be used as a basic starting point.

## Structure

This initial fuzzing framework has the following structure:

```txt
fuzzing
├── client
│   ├── fuzz-body.js
│   ├── fuzz-headers.js
│   └── index.js
├── fuzz.js
└── server
    ├── append-data.js
    ├── index.js
    └── split-data.js
```

We have a central entry point which uses client fuzz functions and server fuzz functions:

```sh
 npx jsfuzz fuzzing/fuzz.js corpus
```

### Entry point

This exports a default function that `jsfuzz` runs. We setup a single net server to avoid running into issues with port allocations when running at scale. When triggered, we use the buffer input to select a client function to run, which is turns triggers a server function that runs with the net server receives data from the undici connection.

### Client

These functions allow one to provide a variety of ways of specifying an input to undici. This is selected on the input buffer value from `jsfuzz`.

### Server

These functions allow one to provide a variety of workflows when handling the data undici sends up to the server. This allows one to fuzz undici's handling of server responses.

The function is currently randomly selected, but we should make this selection based on the data. As the input data is relatively large, we lose precision so we must normalize after stripping down the data somewhat (or consider other techniques) when determining the function to run.

## Implementation details to resolve

To maximise the effectiveness, we must be able to provide replayability as a bare minimum. If we detect an error, we must have all the information needed to quickly rerun the fuzz test and write a test in undici for resolving the issue. At present, we have most (but not all) of the information. However some is currently missing/hard to replay:

- Upon failure, indicating which server function failed is hard to determine.
- Not easy to deterministically re-play server flows. We can try all of the functions, but this does not scale.

To resolve these, we may need to sanitise the input data, consider other data conversion techniques or even another way to run these flows.

Please, these are not issues with `jsfuzz`, more to do with the current implementation in this repo.

## CI considerations

By default, the fuzzer runs indefinitely. A timer of 5 minutes has been added which gracefully terminates the fuzz process. This opens the door to run jsfuzz in the CI. Note, we can easily make this configurable if needed (e.g. using an environment variable)

There are 2 options available when running in the CI.

### All in one

We can run the fuzzer from a single entry point:

```sh
npx jsfuzz fuzzing/fuzz.js corpus
```

Once run (timed out or errored), we can make the corpus files available as a GH action artifact so we can replicate the issue if needed.

### Matrix approach

We can run in matrix mode where each generated run would xorrespond with a single client/server function permutation. E.g. for this repo, we would get 4 runs in the matrix:

- `fuzz-body` <=> `append-data`
- `fuzz-body` <=> `split-data`
- `fuzz-headers` <=> `append-data`
- `fuzz-headers` <=> `split-data`

We would want to do this by generating a matrix file either from a static definition or looking at the files from a directory and generating the files from there (maximum flexibility).

Some research is required to see if we can read files dynamically from the contents of a folder. If this is not possible, then defining statically is also fine.

## Open questions

- Can we get server functions to be replayed deterministically?
- Can we generate matrices from files?
- Are there any additional features we should add to this base example repo?
