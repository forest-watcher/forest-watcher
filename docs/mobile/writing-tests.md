
# Writing Tests

1. Create a new file in the `__tests__` folder
2. Write your tests. (Use templates below or copy `__tests__/jestTest.js`.)
3. Run tests, make sure they pass and save snapshots: `yarn test:watch`.

**First, get jest types in IDE:** In webstorm (or IntelliJ) go to Settings > Languages & Frameworks > JavaScript > Libraries > Find `jest` > Download & Install

See `__tests__/jestTest.js` for a full example of jest and redux test functionality.

## Running Tests

`yarn test` will run all tests (relating to changed files).

`yarn test:watch` will run an interactive CLI. Pressing `w` will show all the options available. Here you can individually update snapshots and re-run all tests.

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

#### Matching nondeterministic field
Sometimes a reducer will not be deterministic. Some field(s) cannot be predicted, examples: synced timestamp, Date, GUID, generated random value, or exact response from an API request.
You can set the snapshot to accept any class by passing a property matcher object to the `toMatchSnapshot` method:

```javascript
    expect(nondeterministicFunction()).toMatchSnapshot({
      numberField: expect.any(Number),
      grandParent: { parent: { stringField: expect.any(String) } }
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
