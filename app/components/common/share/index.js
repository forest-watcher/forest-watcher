// @flow

import React, { Component, type ElementConfig } from 'react';

import i18n from 'i18next';
import { Text, TouchableOpacity, View } from 'react-native';
import styles from './styles';

import ActionButton from 'components/common/action-button';
import BottomTray from 'components/common/bottom-tray';
import Row from 'components/common/row';

import { Navigation, NavigationButtonPressedEvent } from 'react-native-navigation';

type Props = {
  ...ElementConfig<typeof View>,
  componentId?: string,
  enabled: boolean,
  disabled?: ?boolean,
  editButtonDisabledTitle?: string,
  editButtonEnabledTitle?: string,
  editEnabled?: boolean,
  onEdit?: () => void,
  onEditingToggled?: (editing: boolean) => void,
  onShare: () => void,
  onSharingToggled?: (sharing: boolean) => void,
  onToggleAllSelected?: (all: boolean) => void,
  selectAllCountText: string,
  shareButtonDisabledTitle: string,
  shareButtonEnabledTitle: string,
  shareEnabled?: boolean,
  showEditButton?: boolean,
  selected: number
};

type State = {|
  editing: boolean,
  sharing: boolean
|};

const KEY_EXPORT_DONE = 'key_export_done';

export default class ShareSelector extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      editing: false,
      sharing: false
    };
    Navigation.events().bindComponent(this);
  }

  setEditing = (editing: boolean) => {
    this.setDoneButtonVisible(editing);
    this.setState({
      editing
    });
  };

  setSharing = (sharing: boolean) => {
    this.setDoneButtonVisible(sharing);
    this.setState({
      sharing
    });
  };

  navigationButtonPressed({ buttonId }: NavigationButtonPressedEvent) {
    if (buttonId === KEY_EXPORT_DONE) {
      this.setEditing(false);
      this.setSharing(false);
      // Call this separately so we don't end up with recursion if someone calls `setSharing` by referencing this component
      this.props.onSharingToggled?.(false);
      this.props.onEditingToggled?.(false);
    }
  }

  onClickEdit = () => {
    this.setEditing(true);
    // Call this separately so we don't end up with recursion if someone calls `setEditing` by referencing this component
    this.props.onEditingToggled?.(true);
  };

  onClickShare = () => {
    this.setSharing(true);
    // Call this separately so we don't end up with recursion if someone calls `setSharing` by referencing this component
    this.props.onSharingToggled?.(true);
  };

  onToggleAllSelected = () => {
    const anySelected = this.props.selected > 0;
    this.props.onToggleAllSelected?.(!anySelected);
  };

  setDoneButtonVisible = (visible: boolean) => {
    if (!this.props.componentId) {
      return;
    }
    Navigation.mergeOptions(this.props.componentId, {
      topBar: {
        rightButtons: visible
          ? [
              {
                id: KEY_EXPORT_DONE,
                text: i18n.t('commonText.done'),
                ...styles.topBarTextButton
              }
            ]
          : []
      }
    });
  };

  render() {
    const { editing, sharing } = this.state;
    const { showEditButton } = this.props;

    return (
      <View
        onStartShouldSetResponder={this.props.onStartShouldSetResponder}
        style={[this.props.style, styles.container]}
      >
        {sharing && (
          <Row rowStyle={styles.header} style={styles.headerContent}>
            <Text style={styles.rowText}>{this.props.selectAllCountText}</Text>
            <TouchableOpacity onPress={this.onToggleAllSelected}>
              <Text style={styles.buttonText}>
                {this.props.selected > 0 ? i18n.t('commonText.deselectAll') : i18n.t('commonText.selectAll')}
              </Text>
            </TouchableOpacity>
          </Row>
        )}
        {this.props.children}
        {!editing && (
          <BottomTray
            requiresSafeAreaView={true}
            style={{ flexDirection: 'row', alignSelf: 'stretch', alignItems: 'stretch' }}
          >
            {showEditButton && !sharing && (
              <ActionButton
                disabled={this.props.disabled || (!this.props.enabled && editing)}
                noIcon
                onPress={this.props.disabled ? null : editing ? this.props.onEdit : this.onClickEdit}
                secondary={!editing}
                text={editing ? this.props.editButtonEnabledTitle : this.props.editButtonDisabledTitle}
              />
            )}
            {showEditButton && !editing && !sharing && <View style={{ width: 15 }} />}
            {!editing && (
              <ActionButton
                disabled={this.props.disabled || (!this.props.enabled && sharing)}
                noIcon
                onPress={this.props.disabled ? null : sharing ? this.props.onShare : this.onClickShare}
                secondary={!sharing}
                text={sharing ? this.props.shareButtonEnabledTitle : this.props.shareButtonDisabledTitle}
              />
            )}
          </BottomTray>
        )}
      </View>
    );
  }
}
