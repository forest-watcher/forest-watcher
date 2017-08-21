import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  Picker
} from 'react-native';

import I18n from 'locales';
import styles from './styles';

const Dropdown = (props) => {
  const { label, selectedValue, options, onValueChange } = props;
  return (
    <View style={styles.section}>
      <Text style={styles.containerLabel}>
        {I18n.t(label)}
      </Text>
      <View style={styles.container}>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedValue}
            onValueChange={onValueChange}
            itemStyle={{ height: 72 }} // Only for iOS platform
          >
            {options.map(option => (<Picker.Item {...option} label={I18n.t(option.label)} />))}
          </Picker>
        </View>
      </View>
    </View>
  );
};

Dropdown.propTypes = {
  label: PropTypes.string.isRequired,
  selectedValue: PropTypes.string.isRequired,
  onValueChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired
  })).isRequired
};

export default Dropdown;
