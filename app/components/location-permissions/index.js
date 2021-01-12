// @flow
import React, { Component } from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { Navigation } from 'react-native-navigation';

import i18n from 'i18next';
import { trackScreenView } from 'helpers/analytics';
import styles from './styles';

import ActionButton from 'components/common/action-button';

import { request, PERMISSIONS } from 'react-native-permissions';

import { withSafeArea } from 'react-native-safe-area';
const SafeAreaView = withSafeArea(View, 'margin', 'vertical');

const locationPermissionsImage = require('assets/locationPermissions.jpg');

type Props = {
  componentId: string
};

export default class Welcome extends Component<Props> {
  static options(passProps: {}) {
    return {
      topBar: {
        drawBehind: true,
        background: {
          color: 'transparent'
        }
      }
    };
  }

  onContinue = async () => {
    await request(PERMISSIONS.IOS.LOCATION_ALWAYS);
    Navigation.dismissModal(this.props.componentId);
  };

  componentDidMount() {
    trackScreenView('Location Permissions');
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.headerImageContainer}>
            <Image source={locationPermissionsImage} style={styles.headerImage} />
          </View>
          <Text style={styles.titleText}>{i18n.t('locationPermissions.title')}</Text>
          <Text style={styles.subtitleText}>{i18n.t('locationPermissions.subTitle')}</Text>
          <ScrollView
            alwaysBounceVertical={false}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            <View style={styles.itemContainer}>
              <View style={styles.bullet} />
              <View style={styles.itemContentContainer}>
                <Text style={styles.itemText}>{i18n.t('locationPermissions.bullet1')}</Text>
              </View>
            </View>
            <View style={[styles.itemContainer, styles.itemContainerLast]}>
              <View style={styles.bullet} />
              <View style={styles.itemContentContainer}>
                <Text style={styles.itemText}>{i18n.t('locationPermissions.bullet2')}</Text>
              </View>
            </View>
          </ScrollView>
          <ActionButton onPress={this.onContinue} noIcon text={i18n.t('locationPermissions.enablePermissions')} />
        </View>
      </SafeAreaView>
    );
  }
}
