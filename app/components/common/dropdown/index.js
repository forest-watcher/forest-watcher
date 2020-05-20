// @flow
import type { AppAction } from 'types/app.types';
import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';

import ActionSheet from 'react-native-actions-sheet';
import Row from 'components/common/row';
import styles from './styles';

import { SafeAreaConsumer } from 'react-native-safe-area-context';

import i18n from 'i18next';

const nextIcon = require('assets/next.png');

type Option = { labelKey: string, value: string };

type Props = {
  description: ?string,
  label: string,
  selectedValue: string,
  onValueChange: string => AppAction,
  options: Array<Option>,
  inactive?: ?boolean,
  hideLabel?: boolean
};

export default class Dropdown extends Component<Props> {
  actionSheet: ?ActionSheet;
  showActionSheetAction: { callback: () => void, icon: any };

  constructor(props: Props) {
    super(props);

    this.showActionSheetAction = {
      callback: this.onShowActionSheet,
      icon: nextIcon
    };
  }

  onDismissActionSheet = () => {
    this.actionSheet?.setModalVisible(false);
  };

  onSelectedOption = (value: string) => {
    this.props.onValueChange(value);
  };

  onShowActionSheet = () => {
    if (this.props.inactive) {
      return;
    }
    this.actionSheet?.setModalVisible();
  };

  render() {
    const { description, label, selectedValue, options } = this.props;
    const selectedLabel =
      options
        .map((option: Option) => {
          return {
            ...option,
            label: i18n.t(option.labelKey)
          };
        })
        .find((option: Option) => {
          return option.value === selectedValue;
        })?.label ?? selectedValue;
    const rowStyle = [styles.dropdownRow, this.props.inactive ? styles.inactiveDropdownRow : {}];
    return (
      <Row opacity={this.props.inactive ? 0.2 : 0.5} action={this.showActionSheetAction} rowStyle={rowStyle}>
        {label && !this.props.hideLabel && <Text style={styles.label}>{label}</Text>}
        <Text style={styles.label}>{selectedLabel.charAt(0).toUpperCase() + selectedLabel.substring(1)}</Text>
        <ActionSheet
          ref={ref => {
            this.actionSheet = ref;
          }}
        >
          <SafeAreaConsumer>
            {insets => {
              const dropdownContainerStyle = Platform.select({
                android: { marginBottom: insets.top },
                ios: { marginBottom: insets.bottom }
              });
              return (
                <View style={dropdownContainerStyle}>
                  <View style={styles.pickerHeader}>
                    <View>
                      <Text style={styles.label}>{label}</Text>
                      {description && <Text style={styles.smallLabel}>{description}</Text>}
                    </View>
                    <TouchableOpacity onPress={this.onDismissActionSheet} style={styles.doneButtonContainer}>
                      <Text style={styles.doneLabel}>{i18n.t('dropdown.done')}</Text>
                    </TouchableOpacity>
                  </View>
                  <View>
                    {options.map((option, i) => (
                      <Row
                        action={{
                          callback: this.onSelectedOption.bind(this, option.value)
                        }}
                        key={option.value + i}
                        rowStyle={styles.optionRow}
                        style={styles.optionRowContainer}
                      >
                        <View style={[styles.switch, option.value === selectedValue ? styles.switchOn : ' ']}>
                          {option.value === selectedValue && <View style={styles.switchInterior} />}
                        </View>
                        <Text style={styles.smallLabel}>{i18n.t(option.labelKey)}</Text>
                      </Row>
                    ))}
                  </View>
                </View>
              );
            }}
          </SafeAreaConsumer>
        </ActionSheet>
      </Row>
    );
  }
}
