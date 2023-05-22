// @flow
import React, { useEffect, useState } from 'react';
import type { Dispatch, State } from 'types/store.types';
import { View, Text, Image, TouchableHighlight } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { connect } from 'react-redux';
import ActionButton from 'components/common/action-button';
import Theme from 'config/theme';
import styles from './styles';
import i18n from 'i18next';
import { setOfflineMode } from 'redux-modules/app';
import { useNetInfo } from '@react-native-community/netinfo';

const offlineIcon = require('assets/offline_big.png');
const onlineIcon = require('assets/online_big.png');
import { trackScreenView } from 'helpers/analytics';

interface Props {
  componentId: string;
  toggleOfflineMode: (offline: boolean) => void;
  offlineMode: boolean;
}

const getContent = (offlineMode: boolean, isOffline: boolean) => {
  if (isOffline) {
    return {
      image: offlineIcon,
      title: 'No Connection',
      subtitle:
        'It looks like you are not connected to the internet. Please connect to a network to go back to online mode.',
      button: 'Back to Online Mode'
    };
  } else if (offlineMode) {
    return {
      image: offlineIcon,
      title: i18n.t('offline.modalTitle'),
      subtitle: i18n.t('offline.modalSubtitle'),
      button: i18n.t('offline.buttonTitle')
    };
  } else {
    return {
      image: onlineIcon,
      title: "You're in Online Mode",
      subtitle:
        'You can access any section of the app while you are connected to the internet. If you want to use the app with no connection, use offline mode.',
      button: 'Back to Offline Mode'
    };
  }
};

const OfflineModal = (props: Props) => {
  const netInfo = useNetInfo();
  const [content, setContent] = useState(getContent(props.offlineMode, !netInfo.isConnected));

  useEffect(
    () => {
      setContent(getContent(props.offlineMode, !netInfo.isConnected));
    },
    [props.offlineMode, netInfo.isConnected]
  );

  useEffect(() => trackScreenView('offline_mode_modal'), []);

  return (
    <TouchableHighlight
      underlayColor="transparent"
      onPress={() => Navigation.dismissModal(props.componentId)}
      style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'transparent' }}
    >
      <TouchableHighlight underlayColor="transparent">
        <View
          style={{
            backgroundColor: 'white',
            opacity: 1,
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10,
            padding: 24,
            alignItems: 'center'
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontFamily: Theme.font,
              color: Theme.colors.turtleGreen,
              alignSelf: 'flex-end'
            }}
            onPress={() => {
              Navigation.dismissModal(props.componentId);
            }}
          >
            {i18n.t('offline.doneButton')}
          </Text>
          <Image source={content.image} />
          <Text style={styles.offlineTitle}>{content.title}</Text>
          <Text style={styles.offlineSubTitle}>{content.subtitle}</Text>
          <ActionButton
            disabled={!netInfo.isConnected}
            style={{ height: 48, marginTop: 28, alignSelf: 'stretch' }}
            noIcon
            onPress={() => {
              if (netInfo.isConnected) {
                props.toggleOfflineMode(!props.offlineMode);
                Navigation.dismissModal(props.componentId);
              }
            }}
            secondary={netInfo.isConnected}
            text={content.button}
          />
        </View>
      </TouchableHighlight>
    </TouchableHighlight>
  );
};

function mapStateToProps(state: State, props: Props) {
  return {
    offlineMode: state.app.offlineMode
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    toggleOfflineMode: (offline: boolean) => {
      dispatch(setOfflineMode(offline));
    }
  };
}

export default (connect(
  mapStateToProps,
  mapDispatchToProps
)(OfflineModal): Class<any> & ((props: any) => React$Element<any>));
