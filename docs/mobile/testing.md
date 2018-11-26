
# Testing

## Commands

`yarn test` will run all tests (relating to changed files).

`yarn test:watch` **todo: explain! will run an interactive test. Where you can individually update snapshots, or re-run all tests.

## What we test

- Unit Tests
  - Redux
  - Component UI **todo
  - Other functions **todo
- E2E Tests

### Unit Tests

**Redux testing** involves testing reducers and actions, explained below.

**Component UI** involves rendering a UI component and checking the output. 

**Other functions**, usually hard to understand and pure functions (no dependencies used).

### E2E Tests

End to End UI Tests build and run the app on a device / emulator and mock user interaction (taps and typing).
This is tests user stories and obvious bugs (crashing, missing UI components).

This test can be combined with throttled or patchy networks and run on many different devices, 
locally or on cloud services which can record videos of the tests being executed.

## Redux Testing

### Testing Actions

Actions return an action object { type: ..., payload: ... } or a thunk (see redux-thunk).
Redux Action Snapshot tests check that actions return the same object.

*todo: Snapshot test thunk outputs (if possible)?*
*todo: Test what other actions are called in a thunked action*

### Testing Reducers

**This is the main type of testing for redux we'll do**

Reducers take an action and optional state (otherwise they use an initial state).
This is the core functionality of redux. 

Instead of mocking the whole store state, 
calling actions and then comparing the final state, we can test this this same functionality 
by just testing reducer functions (or the single combined reducer function) output given an action.

*todo: How this handles thunked actions*

## Mocking dependencies

Because unit tests are run on the code, not the built app, some native dependencies have to be mocked.
These are usually very easy to do:
`jest.mock('react-native-library', () => { methodName: jest.fn(); });`

## Libraries used

- jest-fetch-mock
- redux-mock-store

> ## Why Unit Tests?
>
> **No flakiness:** Because tests are run in a command line runner instead of a real browser or on a real phone, the test runner doesn’t have to wait for builds, spawn browsers, load a page and drive the UI to get a component into the expected state which tends to be flaky and the test results become noisy.
>
> **Fast iteration speed:** Engineers want to get results in less than a second rather than waiting for minutes or even hours. If tests don’t run quickly like in most end-to-end frameworks, engineers don’t run them at all or don’t bother writing them in the first place.
>
> **Debugging:** It’s easy to step into the code of an integration test in JS instead of trying to recreate the screenshot test scenario and debugging what happened in the visual diff.

## Why Snapshot Tests? **todo

- Prevents duplicating the code in method being tested. Simple way to show if method output changes, very quick to check and change.
