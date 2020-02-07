import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity, Picker } from 'react-native';

import ActionSheet from 'react-native-actions-sheet';
import Row from 'components/common/row';
import styles from './styles';

import { withSafeArea } from "react-native-safe-area";

import i18n from 'locales';

const SafeAreaView = withSafeArea(View, 'padding', 'bottom')
const nextIcon = require('assets/next.png');

type Props = {
  description:? string,
  label: string,
  selectedValue: string,
  onValueChange: string => Void,
  options: Array<{ label: string, value: string }>
};

class Dropdown extends Component<Props> {

  showActionSheetAction: { callback: () => void, icon: any };

  constructor(props: Props) {
    super(props);

    this.showActionSheetAction = {
      callback: this.onShowActionSheet.bind(this),
      icon: nextIcon
    }

    this.onDismissActionSheet = this.onDismissActionSheet.bind(this);
  }

  onDismissActionSheet() {
    this.actionSheet?.setModalVisible(false);
  }

  onSelectedOption(value) {
    this.props.onValueChange(value);
  }

  onShowActionSheet() {
    this.actionSheet?.setModalVisible();
  }

  render() {  
    const { description, label, selectedValue, options } = this.props;
    // const onValueChangeHandler = value => {
    //   if (value !== selectedValue) {
    //     onValueChange(value);
    //   }
    // };
    return (
      <Row 
        action={this.showActionSheetAction}
      >
        <Text style={styles.label}>{selectedValue.charAt(0).toUpperCase() + selectedValue.substring(1)}</Text>
        <ActionSheet 
          ref={ref => { this.actionSheet = ref }}
        >
          <View>
            <View style={styles.pickerHeader}>
              <View>
                <Text style={styles.label}>{label}</Text>
                {description && (
                  <Text style={styles.smallLabel}>{description}</Text>
                )}
              </View>
              <TouchableOpacity 
                onPress={this.onDismissActionSheet}
                style={styles.doneButtonContainer}
              >
                <Text style={styles.doneLabel}>{i18n.t('dropdown.done')}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.pickerContent}>
              {options.map((option, i) => (
                <Row 
                  action={{
                    callback: this.onSelectedOption.bind(this, option.value)
                  }}
                  key={option.value + i} 
                  rowStyle={styles.optionRow}
                  style={styles.optionRowContainer}
                >
                  <View style={[styles.switch, option.value == selectedValue ? styles.switchOn : ' ']}>
                    {option.value == selectedValue && (
                      <View style={styles.switchInterior}/>
                    )}
                  </View>
                  <Text style={styles.smallLabel}>
                    {option.label}
                  </Text>
                </Row>
              ))}
            </View>
          </View>
        </ActionSheet>
      </Row>
    );
  }
}

export default Dropdown;
