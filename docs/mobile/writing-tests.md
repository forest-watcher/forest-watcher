
# Writing Tests

**First, get jest types in IDE:** In webstorm (or IntelliJ) go to Settings > Languages & Frameworks > JavaScript > Libraries > Find `jest` > Download & Install

See `__tests__/jestTest.js` for a full example of jest and redux test functionality.

## Running Tests

`yarn test` will run all tests (relating to changed files).

`yarn test:watch` will run an interactive CLI. Where you can individually update snapshots and re-run all tests.

## Basic test template:

```javascript
//__tests__/newTest.js
import 'react-native';

describe('Unit Tests', () => {
  it('runs test', () => {
    expect(true);
  });
  
  it('runs this test too', () => {
    expect(!false);
    // Best practise: Write tests in separate 'it' method.
  });
});
```

## Snapshot tests

```javascript
import 'react-native';

describe('Unit Tests', () => {
  it('runs', () => {
    expect({object: 'value'}).toMatchSnapshot();
  });
});
```

## Testing an Action

```javascript
...
import { action, action2 } from 'redux-modules/module';
...
      expect(action()).toMatchSnapshot();
      expect(action2('argument')).toMatchSnapshot();
...
```

## Testing a Reducer

```javascript
...
import reducer, {action} from 'redux-modules/module';
...
      // Tests initial state:
      expect(reducer(/* initial state: */ undefined, /* action: */ {type: 'NONE'})).toMatchSnapshot();
      // Tests effect of action:
      expect(reducer(/* initial state: */ undefined, /* action: */ action())).toMatchSnapshot();
...
```

## Troubleshooting

- Make sure you're using Node v8.12.0 (or similar)
