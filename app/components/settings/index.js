// @flow
import React, { Component } from 'react';
import { View, Text, TouchableHighlight, ScrollView, Image, Alert } from 'react-native';
import { Navigation } from 'react-native-navigation';
import Hyperlink from 'react-native-hyperlink';

import List from 'components/common/list';
import AreaList from 'containers/common/area-list';
import Theme from 'config/theme';
import CoordinatesDropdown from 'containers/settings/coordinates-dropdown';
import Row from 'components/common/row';
import { getVersionName } from 'helpers/app';
import debounceUI from 'helpers/debounceUI';

import { launchAppRoot } from 'main';
import i18n from 'locales';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';

const plusIcon = require('assets/plus.png');

type Props = {
  user: any,
  loggedIn: boolean, // eslint-disable-line
  componentId: string,
  logout: () => void,
  isUnsafeLogout: boolean,
  setOfflineMode: () => void,
  offlineMode: boolean,
};

export default class Settings extends Component<Props> {
  static options(passProps) {
    return {
      topBar: {
        title: {
          text: i18n.t('settings.title')
        }
      }
    };
  }

  constructor() {
    super();
    this.aboutSections = [
      {
        text: i18n.t('settings.aboutPartners'),
        image: null,
        section: 'ForestWatcher.Partners',
        functionOnPress: this.handleStaticLinks
      },
      {
        text: i18n.t('settings.aboutTerms'),
        image: null,
        section: 'ForestWatcher.TermsAndConditions',
        functionOnPress: this.handleStaticLinks
      },
      {
        text: i18n.t('settings.aboutFAQ'),
        image: null,
        section: 'ForestWatcher.FaqList',
        functionOnPress: this.handleStaticLinks
      },
      {
        text: i18n.t('settings.aboutContactUs'),
        image: null,
        section: 'ForestWatcher.ContactUs',
        functionOnPress: this.handleStaticLinks
      }
    ];

    this.state = {
      versionName: getVersionName()
    };
  }

  componentDidMount() {
    tracker.trackScreenView('Settings');
  }

  onLogoutPress = debounceUI(() => {
    const { logout, isUnsafeLogout } = this.props;
    const proceedWithLogout = () => {
      logout();
      launchAppRoot('ForestWatcher.Login');
    };
    if (isUnsafeLogout) {
      Alert.alert(i18n.t('settings.unsafeLogout'), i18n.t('settings.unsavedDataLost'), [
        { text: 'OK', onPress: proceedWithLogout },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]);
    } else proceedWithLogout();
  });

  handleStaticLinks = debounceUI((section: string, text: string) => {
    Navigation.push(this.props.componentId, {
      component: {
        name: section,
        options: {
          topBar: {
            title: {
              text: text
            }
          }
        }
      }
    });
  });

  render() {
    const { setOfflineMode, offlineMode } = this.props;
    const hasUserData = this.props.user.fullName && this.props.user.email;

    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <Row style={styles.user}>
            {hasUserData ? (
              <View style={styles.info}>
                <Text style={styles.name}>{this.props.user.fullName}</Text>
                <Text style={styles.email} numberOfLines={1} ellipsizeMode="tail">
                  {this.props.user.email}
                </Text>
              </View>
            ) : (
              <View style={styles.info}>
                <Hyperlink
                  linkDefault
                  linkStyle={Theme.link}
                  linkText={url => (url === 'https://www.globalforestwatch.org/my_gfw' ? 'my GFW' : url)}
                >
                  <Text selectable style={styles.completeProfile}>
                    {`${i18n.t('settings.completeYourProfileOn')} https://www.globalforestwatch.org/my_gfw`}
                  </Text>
                </Hyperlink>
              </View>
            )}
            <TouchableHighlight activeOpacity={0.5} underlayColor="transparent" onPress={this.onLogoutPress}>
              <Text style={styles.logout}>{i18n.t('settings.logOut')}</Text>
            </TouchableHighlight>
          </Row>
          <Text style={styles.label}>{i18n.t('settings.coordinatesFormat')}</Text>
          <CoordinatesDropdown/>
          <View style={styles.offlineMode}>
            <Row value={offlineMode} onValueChange={setOfflineMode}>
              <Text style={[styles.rowLabel, { marginLeft: 0 }]}>{i18n.t('settings.offlineMode')}</Text>
            </Row>
          </View>
          <View style={styles.aboutSection}>
            <Text style={styles.label}>{i18n.t('settings.aboutApp')}</Text>
            <List content={this.aboutSections} bigSeparation={false}>
              {}
            </List>
            <View style={styles.footerText}>
              <Text style={[styles.label, { marginLeft: 0 }]}>{i18n.t('commonText.appName')}</Text>
              <Text style={styles.versionText}>{this.state.versionName}</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
}
