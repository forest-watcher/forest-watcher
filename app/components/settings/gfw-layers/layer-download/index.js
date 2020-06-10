// @flow
import React, { PureComponent } from 'react';
import { View } from 'react-native';

import type { ContextualLayer } from 'types/layers.types';

import styles from './styles';

type Props = {
  componentId: string,
  layer: ContextualLayer
};

type State = {};

class LayerDownload extends PureComponent<Props, State> {
  render() {
    return <View style={styles.container} />;
  }
}

export default LayerDownload;
