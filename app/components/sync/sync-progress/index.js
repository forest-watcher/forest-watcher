import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text
} from 'react-native';
import I18n from 'locales';
import styles from './styles';

const SyncProgress = ({ label }) => (
  <View
    style={styles.container}
  >
    <Text style={styles.label}>
      {I18n.t(`sync.progress.${label}`)}
    </Text>
  </View>
);

SyncProgress.propTypes = {
  label: PropTypes.string.isRequired
};

export default SyncProgress;
