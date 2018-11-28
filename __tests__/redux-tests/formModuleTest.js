import 'react-native';
import formReducer from 'redux-modules/form';

describe('Redux Form Module', () => {
  it('Initial reducer state', () => {
    expect(formReducer(undefined, { type: 'NONE' })).toMatchSnapshot();
  });
});
