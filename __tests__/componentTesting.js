import React from 'react';
import 'react-native';
import renderer from 'react-test-renderer';
import ActionCard from '../app/components/common/action-card';

// Small component ui testing doesn't look to be very useful,
// but this means we should be able to test screen component render method outputs.
describe('Component Tests', () => {
  it('test runs', () => {
    expect(true);
  });

  it('ActionCard renders', () => {
    const tree = renderer.create(
      <ActionCard label="test_label" />
    );
    expect(tree).toMatchSnapshot();
  });

  it('ActionCard renders all props', () => {
    const tree = renderer.create(
      <ActionCard label="test_label" width={10} height={20} icon={1234} action={() => {}} />
    );
    expect(tree).toMatchSnapshot();
  });
});
