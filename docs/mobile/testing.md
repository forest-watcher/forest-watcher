
# Testing  
  
## Testing that I've done, and how to write them.   
  
### Redux Testing  
  
#### Testing Actions  
Actions return an action object { type: ..., payload: ... } or a thunk (see redux-thunk).  
Redux Action Snapshot tests check that actions return the same object.  
  
*todo: Snapshot test thunk outputs (if possible)?*  
*todo: Test what other actions are called in a thunked action*  
  
#### Testing Reducers  
Reducers take an action and optional state (otherwise they use an initial state).  
This is the core functionality of redux. Instead of mocking the whole store state,   
calling actions and then comparing the final state, we can test this this same functionality   
by just testing reducer functions (or the single combined reducer function) output given an action.  
  
*todo: How this handles thunked actions*  
  
## Mocking dependencies  
  
  
## Types of Testing  
  
- Unit Tests  
- Redux  
  - Actions / Action creators  
  - Reducer functions / State  
- end-to-end UI Tests  
  
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

## Why Snapshot Tests?  
**todo
