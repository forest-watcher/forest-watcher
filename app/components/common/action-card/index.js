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
    activeOpacity={0.5}
    underlayColor="transparent"
    onPress={action}
  >
    <View
      style={[styles.card, { width, height }]}
    >
      <Image style={Theme.icon} source={icon} />
      <Text>
        {label}
      </Text>
    </View>
  </TouchableHighlight>
);

ActionCard.propTypes = {
  label: PropTypes.string.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  action: PropTypes.func.isRequired,
  icon: PropTypes.node
};

export default ActionCard;
