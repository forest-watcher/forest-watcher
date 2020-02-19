import React, { Component } from 'react';

import i18n from 'locales';
import { View } from 'react-native';
import styles from './styles';

import ActionButton from 'components/common/action-button';
import BottomTray from 'components/common/bottom-tray';

import { Navigation } from 'react-native-navigation';

type Props = {
  children: Array<any>,
  componentId?: string,
  enabled: boolean,
  onShare: () => void,
  onSharingToggled?: (sharing: boolean) => void,
  shareButtonDisabledTitle: string,
  shareButtonEnabledTitle: string,
  shareEnabled: boolean
};

const KEY_EXPORT_DONE = 'key_export_done';

const BUTTON_EXPORT_DONE = [
  {
    id: KEY_EXPORT_DONE,
    text: i18n.t('commonText.done')
  }
];

export default class ShareSelector extends Component<Props> {

  constructor(props) {
    super(props);
    this.state = {
      sharing: false
    }
    Navigation.events().bindComponent(this);
  }

  setSharing = (sharing) => {
    this.setDoneButtonVisible(sharing);
    this.setState({
      sharing
    })
  }

  navigationButtonPressed({ buttonId }) {
    if (buttonId === KEY_EXPORT_DONE) {
      this.setSharing(false);
      // Call this separately so we don't end up with recursion if someone calls `setSharing` by referencing this component
      this.props.onSharingToggled?.(false);
    }
  }

  onClickShare = () => {
    this.setSharing(true);
    // Call this separately so we don't end up with recursion if someone calls `setSharing` by referencing this component
    this.props.onSharingToggled?.(true);
  }

  setDoneButtonVisible = (visible) => {
    if (!this.props.componentId) {
      return;
    }
    Navigation.mergeOptions(this.props.componentId, {
      topBar: {
        rightButtons: visible ? BUTTON_EXPORT_DONE : []
      }
    });
  }

  render() {  

    const { sharing } = this.state;

    return (
      <View
        style={[this.props.style, styles.container]}
      >
        {this.props.children}
        <BottomTray>
          <ActionButton
            disabled={!this.props.enabled && sharing}
            noIcon
            onPress={sharing ? this.props.onShare : this.onClickShare}
            secondary={!sharing}
            text={sharing ? this.props.shareButtonEnabledTitle : this.props.shareButtonDisabledTitle}
          />
        </BottomTray>
      </View>
    )
  }
}