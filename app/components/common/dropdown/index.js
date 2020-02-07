import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Text, Picker } from 'react-native';

import ActionSheet from 'react-native-actions-sheet';
import Row from 'components/common/row';
import styles from './styles';

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
  }

  onShowActionSheet() {
    console.log("Action sheet is!", this.actionSheet);
    this.actionSheet?.setModalVisible();
  }

  render() {  
    const { description, label, selectedValue, options, onValueChange } = this.props;
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
            </View>
          </View>
        </ActionSheet>
      </Row>
    );
  }
}

export default Dropdown;
