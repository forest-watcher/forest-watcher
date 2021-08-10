// @flow
import type { TextStyle } from 'types/reactElementStyles.types';

import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';

import ActionSheet from 'react-native-actions-sheet';
import Row from 'components/common/row';
import styles from './styles';

import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import i18n from 'i18next';

const nextIcon = require('assets/next.png');

type OptionValue = { value: string | number, id: string };
type Option = { label?: string, labelKey: string, value: OptionValue, id: string };

type Props = {
  description: ?string,
  label: string,
  labelStyle?: TextStyle,
  selectedValue: OptionValue,
  onValueChange: OptionValue => void,
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
    // $FlowFixMe
    this.actionSheet?.setModalVisible(false);
  };

  onSelectedOption = (value: OptionValue) => {
    this.props.onValueChange(value);
  };

  onShowActionSheet = () => {
    if (this.props.inactive) {
      return;
    }

    // $FlowFixMe
    this.actionSheet?.setModalVisible();
  };

  render() {
    const { description, labelStyle = {}, label, selectedValue, options } = this.props;

    const optionsWithLabel = options.map(option => ({
      ...option,
      label: option.label ?? i18n.t(option.labelKey)
    }));
    const selectedLabel =
      optionsWithLabel.find((option: Option) => option.id === selectedValue.id)?.label ?? `${selectedValue.value}`;
    const rowStyle = [styles.dropdownRow, this.props.inactive ? styles.inactiveDropdownRow : {}];
    return (
      <Row opacity={this.props.inactive ? 0.2 : 0.5} action={this.showActionSheetAction} rowStyle={rowStyle}>
        {label && !this.props.hideLabel && <Text style={[styles.label, labelStyle]}>{label}</Text>}
        <Text style={[styles.label, labelStyle]}>
          {selectedLabel.charAt(0).toUpperCase() + selectedLabel.substring(1)}
        </Text>
        <ActionSheet
          ref={ref => {
            this.actionSheet = ref;
          }}
        >
          <SafeAreaInsetsContext.Consumer>
            {insets => {
              const dropdownContainerStyle = Platform.select({
                android: { marginBottom: insets.top },
                ios: { marginBottom: insets.bottom }
              });
              return (
                <View style={dropdownContainerStyle}>
                  <View style={styles.pickerHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.label}>{label}</Text>
                      {description && <Text style={styles.smallLabel}>{description}</Text>}
                    </View>
                    <TouchableOpacity onPress={this.onDismissActionSheet} style={styles.doneButtonContainer}>
                      <Text style={styles.doneLabel}>{i18n.t('dropdown.done')}</Text>
                    </TouchableOpacity>
                  </View>
                  <View>
                    {optionsWithLabel.map((option, i) => (
                      <Row
                        action={{
                          callback: this.onSelectedOption.bind(this, option)
                        }}
                        key={option.id}
                        rowStyle={styles.optionRow}
                        style={styles.optionRowContainer}
                      >
                        <View style={[styles.switch, option.id === selectedValue.id ? styles.switchOn : null]}>
                          {option.id === selectedValue.id && <View style={styles.switchInterior} />}
                        </View>
                        <Text style={styles.smallLabel}>{option.label ?? ''}</Text>
                      </Row>
                    ))}
                  </View>
                </View>
              );
            }}
          </SafeAreaInsetsContext.Consumer>
        </ActionSheet>
      </Row>
    );
  }
}
