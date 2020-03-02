// @flow
import React, { Component } from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { Navigation } from 'react-native-navigation';

import i18n from 'i18next';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';

import ActionButton from 'components/common/action-button';

import { withSafeArea } from 'react-native-safe-area';
const SafeAreaView = withSafeArea(View, 'margin', 'vertical');

const UPDATE_ITEMS = [
  {
    icon: require('assets/shareAndroid.png'),
    title: () => i18n.t('whatsNew.share.title'),
    body: () => i18n.t('whatsNew.share.body')
  },
  {
    icon: require('assets/contextualLayers.png'),
    title: () => i18n.t('whatsNew.layers.title'),
    body: () => i18n.t('whatsNew.layers.body')
  },
  {
    icon: require('assets/deforestation.png'),
    title: () => i18n.t('whatsNew.deforestationAlerts.title'),
    body: () => i18n.t('whatsNew.deforestationAlerts.body')
  },
  {
    icon: require('assets/subscription.png'),
    title: () => i18n.t('whatsNew.subscriptions.title'),
    body: () => i18n.t('whatsNew.subscriptions.body')
  },
  {
    icon: require('assets/areas.png'),
    title: () => i18n.t('whatsNew.areaSize.title'),
    body: () => i18n.t('whatsNew.areaSize.body')
  }
];

const WELCOME_ITEMS = [
  {
    icon: require('assets/deforestation.png'),
    title: () => i18n.t('welcome.deforestationAlerts.title'),
    body: () => i18n.t('welcome.deforestationAlerts.body')
  },
  {
    icon: require('assets/reports.png'),
    title: () => i18n.t('welcome.reports.title'),
    body: () => i18n.t('welcome.reports.body')
  },
  {
    icon: require('assets/routes.png'),
    title: () => i18n.t('welcome.routes.title'),
    body: () => i18n.t('welcome.routes.body')
  },
  {
    icon: require('assets/contextualLayers.png'),
    title: () => i18n.t('welcome.layers.title'),
    body: () => i18n.t('welcome.layers.body')
  },
  {
    icon: require('assets/shareAndroid.png'),
    title: () => i18n.t('welcome.share.title'),
    body: () => i18n.t('welcome.share.body')
  }
];

type Props = {
  componentId: string,
  isAppUpdate: boolean
};

export default class Welcome extends Component<Props> {
  onContinue = () => {
    Navigation.dismissModal(this.props.componentId);
  };

  componentDidMount() {
    tracker.trackScreenView('Custom Components');
  }

  render() {
    const { isAppUpdate } = this.props;
    const items = isAppUpdate ? UPDATE_ITEMS : WELCOME_ITEMS;
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.contentContainer}>
          <Text style={styles.titleText}>{isAppUpdate ? i18n.t('whatsNew.title') : i18n.t('welcome.title')}</Text>
          <ScrollView
            alwaysBounceVertical={false}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            {items.map((item, index) => {
              return (
                <View key={index} style={styles.itemContainer}>
                  <Image style={styles.itemIcon} source={item.icon} />
                  <View style={styles.itemContentContainer}>
                    <Text style={styles.itemTitleText}>{item.title()}</Text>
                    <Text style={styles.itemBodyText}>{item.body()}</Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
          <ActionButton onPress={this.onContinue} noIcon text={i18n.t('commonText.continue')} />
        </View>
      </SafeAreaView>
    );
  }
}
