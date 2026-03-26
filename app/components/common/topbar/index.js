// @flow
import React from 'react';
import type { ComponentProps, Dispatch, State } from 'types/store.types';
import { useNetInfo } from '@react-native-community/netinfo';
import { TouchableOpacity, Text, Image, View, Platform } from 'react-native';
import styles from './styles';
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation';
import i18n from 'i18next';

const offlineIcon = require('assets/offline.png');
const onlineIcon = require('assets/online.png');

interface Props {
  offlineMode: boolean;
  componentId: string;
}

const Topbar = (props: Props) => {
  const netInfo = useNetInfo();
  const isOffline = props.offlineMode || !netInfo.isConnected;

  return (
    <View>
      <TouchableOpacity
        disabled={false}
        onPress={() => {
          Navigation.showModal({
            stack: {
              children: [
                {
                  component: {
                    name: 'ForestWatcher.OfflineModal',
                    options: {
                      topBar: {
                        visible: false
                      },
                      layout: {
                        backgroundColor: 'transparent',
                        componentBackgroundColor: 'rgba(0,0,0,0.74)'
                      },
                      screenBackgroundColor: 'rgba(0,0,0,0.74)',
                      modalPresentationStyle: Platform.OS === 'android' ? 'overCurrentContext' : 'overFullScreen',
                      animations: {
                        showModal: {
                          enter: {
                            enabled: true,
                            alpha: {
                              from: 0,
                              to: 1,
                              duration: 300
                            }
                          },
                          exit: {
                            enabled: true,
                            alpha: {
                              from: 1,
                              to: 0.5,
                              duration: 300
                            }
                          }
                        },
                        dismissModal: {
                          exit: {
                            enabled: true,
                            alpha: {
                              from: 1,
                              to: 0,
                              duration: 300
                            }
                          },
                          enter: {
                            enabled: false,
                            alpha: {
                              from: 0.5,
                              to: 1,
                              duration: 300
                            }
                          }
                        }
                      }
                    }
                  }
                }
              ]
            }
          });
        }}
        style={isOffline ? styles.bannerGrey : styles.bannerGreen}
      >
        <Image source={isOffline ? offlineIcon : onlineIcon} />
        <Text style={styles.bannerLabel}>
          {isOffline ? i18n.t('offline.bannerTitleOffline') : i18n.t('offline.bannerTitleOnline')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

function mapStateToProps(state: State, props: Props) {
  return {
    offlineMode: state.app.offlineMode
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {};
}

type PassedProps = ComponentProps<Props, typeof mapStateToProps, typeof mapDispatchToProps>;
export default (connect<PassedProps, Props, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(Topbar): Class<any> & ((props: any) => React$Element<any>));
