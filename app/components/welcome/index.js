// @flow
import React, { Component } from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { Navigation } from 'react-native-navigation';

import debounceUI from 'helpers/debounceUI';

import i18n from 'i18next';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';

import ActionButton from 'components/common/action-button';

import { withSafeArea } from 'react-native-safe-area';
const SafeAreaView = withSafeArea(View, 'margin', 'vertical');

const UPDATE_ITEMS = [
  {
    icon: require('assets/shareAndroid.png'),
    titleKey: 'whatsNew.share.title',
    bodyKey:  'whatsNew.share.body'
  },
  {
    icon: require('assets/contextualLayers.png'),
    titleKey: 'whatsNew.layers.title',
    bodyKey:  'whatsNew.layers.body'
  },
  {
    icon: require('assets/deforestation.png'),
    titleKey: 'whatsNew.deforestationAlerts.title',
    bodyKey:  'whatsNew.deforestationAlerts.body'
  },
  {
    icon: require('assets/subscription.png'),
    titleKey: 'whatsNew.subscriptions.title',
    bodyKey:  'whatsNew.subscriptions.body'
  },
  {
    icon: require('assets/areas.png'),
    titleKey: 'whatsNew.areaSize.title',
    bodyKey:  'whatsNew.areaSize.body'
  },
  
]

const WELCOME_ITEMS = [
  {
    icon: require('assets/deforestation.png'),
    titleKey: 'welcome.deforestationAlerts.title',
    bodyKey:  'welcome.deforestationAlerts.body'
  },
  {
    icon: require('assets/reports.png'),
    titleKey: 'welcome.reports.title',
    bodyKey:  'welcome.reports.body'
  },
  {
    icon: require('assets/routes.png'),
    titleKey: 'welcome.routes.title',
    bodyKey:  'welcome.routes.body'
  },
  {
    icon: require('assets/contextualLayers.png'),
    titleKey: 'welcome.layers.title',
    bodyKey:  'welcome.layers.body'
  },
  {
    icon: require('assets/shareAndroid.png'),
    titleKey: 'welcome.share.title',
    bodyKey:  'welcome.share.body'
  }
]


type Props = {
  componentId: string,
  isAppUpdate: boolean,
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
                  <Image style={styles.itemIcon} source={item.icon}/>
                  <View style={styles.itemContentContainer}>
                    <Text style={styles.itemTitleText}>{i18n.t(item.titleKey)}</Text>
                    <Text style={styles.itemBodyText}>{i18n.t(item.bodyKey)}</Text>
                  </View>
                </View>
              )
            })}
          </ScrollView>
          <ActionButton
            onPress={this.onContinue}
            noIcon
            text={i18n.t('commonText.continue')}
          />
        </View>
      </SafeAreaView>
    );
  }
}
