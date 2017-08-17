import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  TouchableHighlight,
  Image
} from 'react-native';
import Theme from 'config/theme';
import styles from './styles';

const ActionCard = ({ label, width, height, action, icon }) => (
  <TouchableHighlight
    activeOpacity={action ? 0.5 : 1}
    underlayColor="transparent"
    onPress={action}
  >
    <View
      style={[styles.card, { width, height }]}
    >
      <Image style={Theme.icon} source={icon} />
      <Text style={styles.text}>
        {label}
      </Text>
    </View>
  </TouchableHighlight>
);

ActionCard.propTypes = {
  label: PropTypes.string.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  action: PropTypes.func,
  icon: PropTypes.node
};

export default ActionCard;
