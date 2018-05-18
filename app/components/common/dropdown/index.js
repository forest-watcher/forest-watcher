import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  Picker
} from 'react-native';

import i18n from 'locales';
import styles from './styles';

const Dropdown = (props) => {
  const { label, selectedValue, options, onValueChange } = props;
  return (
    <View style={styles.section}>
      <Text style={styles.containerLabel}>
        {i18n.t(label)}
      </Text>
      <View style={styles.container}>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedValue}
            onValueChange={onValueChange}
            itemStyle={{ height: 72 }} // Only for iOS platform
          >
            {options.map((option, i) => (
              <Picker.Item
                key={option.value + i}
                label={i18n.t(option.label)}
                value={option.value}
                style={styles.pickerItem}
              />
            ))}
          </Picker>
        </View>
      </View>
    </View>
  );
};

Dropdown.propTypes = {
  label: PropTypes.string.isRequired,
  selectedValue: PropTypes.any.isRequired,
  onValueChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.any.isRequired
  })).isRequired
};

export default Dropdown;
