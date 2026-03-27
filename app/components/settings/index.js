// @flow
import React, { Component } from 'react';
import { ActivityIndicator, View, Text, ScrollView, Image, Alert, Linking } from 'react-native';
import { Navigation } from 'react-native-navigation';

import List from 'components/common/list';
import Theme from 'config/theme';
import CoordinatesDropdown from 'containers/settings/coordinates-dropdown';
import Row from 'components/common/row';
import { getVersionName } from 'helpers/app';
import debounceUI from 'helpers/debounceUI';

import { launchAppRoot } from 'screens/common';
import i18n from 'i18next';
import { trackScreenView } from 'helpers/analytics';
import styles from './styles';

const layersIcon = require('assets/contextualLayers.png');
const nextIcon = require('assets/next.png');
const shareIcon = require('assets/share.png');
const basemapsIcon = require('assets/basemap.png');

type Props = {
  user: any,
  socialEmail: ?string,
  loggedIn: boolean, // eslint-disable-line
  componentId: string,
  logout: (?string) => void,
  isUnsafeLogout: boolean,
  setOfflineMode: boolean => void,
  offlineMode: boolean,
  shareAppData: () => Promise<string>
};

type State = {
  isExportInProgress: boolean,
  versionName: string
};

type AboutSection = {
  text: string,
  image: ?any,
  section: string,
  functionOnPress: (string, string) => void
};

export default class Settings extends Component<Props, State> {
  static options(passProps: {}) {
    return {
      topBar: {
        title: {
          text: i18n.t('settings.title')
        }
      }
    };
  }

  aboutSections: Array<AboutSection>;
  shareAction: { callback: () => Promise<void>, icon: any };

  contextualLayersAction: { callback: () => void, icon: any };

  basemapsAction: { callback: () => void, icon: any };

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
        section: 'ForestWatcher.FaqCategories',
        functionOnPress: this.handleStaticLinks
      },
      {
        text: i18n.t('settings.aboutContactUs'),
        image: null,
        section: 'ForestWatcher.ContactUs',
        functionOnPress: this.handleStaticLinks
      },
      {
        text: i18n.t('settings.deleteAcount'),
        image: null,
        section: 'ForestWatcher.DeleteAccount',
        functionOnPress: this.handleStaticLinks
      }
    ];

    this.shareAction = {
      callback: this.onPressShare,
      icon: nextIcon
    };

    this.basemapsAction = {
      callback: this.onPressBasemaps,
      icon: nextIcon
    };

    this.contextualLayersAction = {
      callback: this.onPressContextualLayers,
      icon: nextIcon
    };

    this.completeProfileAction = {
      callback: this.onCompleteProfilePress,
      icon: nextIcon
    };

    this.logoutAction = {
      callback: this.onLogoutPress,
      icon: null
    };

    this.state = {
      isExportInProgress: false,
      versionName: getVersionName()
    };
  }

  onPressContextualLayers = debounceUI(() => {
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.MappingFiles',
        passProps: {
          mappingFileType: 'contextual_layer'
        }
      }
    });
  });

  onPressBasemaps = debounceUI(() => {
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.MappingFiles',
        passProps: {
          mappingFileType: 'basemap'
        }
      }
    });
  });

  onPressShare = async () => {
    try {
      this.setState({
        ...this.state,
        isExportInProgress: true
      });
      await this.props.shareAppData();
    } finally {
      this.setState({
        ...this.state,
        isExportInProgress: false
      });
    }
  };

  onCompleteProfilePress = async () => {
    const myGfw = 'https://www.globalforestwatch.org/my-gfw';
    const supported = await Linking.canOpenURL(myGfw);
    if (supported) {
      await Linking.openURL(myGfw);
    }
  };

  componentDidMount() {
    trackScreenView('Settings');
  }

  onLogoutPress = debounceUI(() => {
    const { logout, isUnsafeLogout } = this.props;
    const proceedWithLogout = () => {
      logout();
      launchAppRoot('ForestWatcher.Login');
    };
    const questions = i18n.t('faq.categories.alertsAndData.questions', { returnObjects: true });
    const faqExists = Array.isArray(questions) && questions.length > 0;
    const onPressMoreInfo = () => {
      // Looking for "How does the Forest Watcher app store my data?" FAQ
      if (faqExists) {
        const question = questions[questions.length - 1];
        Navigation.push(this.props.componentId, {
          component: {
            name: 'ForestWatcher.FaqDetail',
            passProps: {
              contentFaq: question.content,
              title: question.title
            }
          }
        });
      }
    };
    // Only show more info button if FAQ exists.
    const alertButtons = faqExists
      ? [
          { text: i18n.t('settings.moreInfo'), onPress: onPressMoreInfo },
          { text: i18n.t('settings.logOut'), onPress: proceedWithLogout }
        ]
      : [{ text: i18n.t('settings.logOut'), onPress: proceedWithLogout }];
    if (isUnsafeLogout) {
      Alert.alert(i18n.t('settings.unsafeLogout'), i18n.t('settings.unsavedDataLost'), alertButtons);
    } else {
      proceedWithLogout();
    }
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

    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <Text style={styles.accountLabel}>{i18n.t('settings.accountLabel')}</Text>
          <Row action={this.completeProfileAction} style={styles.user} rowStyle={styles.userDetailRow}>
            <View style={styles.info}>
              <Text style={styles.completeProfile}>
                {this.props.user.firstName !== undefined && this.props.user.lastName !== undefined
                  ? `${i18n.t('settings.viewYourProfileOn')}\n`
                  : `${i18n.t('settings.completeYourProfileOn')}\n`}
                <Text style={Theme.link}>{i18n.t('settings.myGfw')}</Text>
              </Text>
            </View>
          </Row>

          <Row action={(this, this.logoutAction)} style={styles.user}>
            <View style={styles.info}>
              {this.props.user.firstName !== undefined && this.props.user.lastName !== undefined ? (
                <>
                  <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
                    {this.props.user.firstName} {this.props.user.lastName}
                  </Text>
                  <Text style={styles.email} numberOfLines={1} ellipsizeMode="tail">
                    {this.props.user.email ?? this.props.socialEmail}
                  </Text>
                </>
              ) : (
                <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
                  {this.props.socialEmail}
                </Text>
              )}
            </View>
            <Text style={styles.logout}>{i18n.t('settings.logOut')}</Text>
          </Row>

          <Text style={styles.label}>{i18n.t('settings.coordinatesFormat')}</Text>
          <CoordinatesDropdown />
          <View style={styles.offlineMode}>
            <Row value={offlineMode} onValueChange={setOfflineMode}>
              <View style={{ maxWidth: '85%' }}>
                <Text style={[styles.rowLabel, { marginLeft: 0 }]}>{i18n.t('settings.offlineMode')}</Text>
                <Text style={styles.rowSubText}>{i18n.t('settings.offlineModeDescription')}</Text>
              </View>
            </Row>
          </View>
          <Row action={this.basemapsAction} rowStyle={styles.noMarginsRow} style={styles.row}>
            <Image style={styles.rowIcon} source={basemapsIcon} />
            <Text style={styles.rowLabel}>{i18n.t('settings.basemaps')}</Text>
          </Row>
          <Row action={this.contextualLayersAction} rowStyle={styles.noMarginsRow} style={styles.row}>
            <Image style={styles.rowIcon} source={layersIcon} />
            <Text style={styles.rowLabel}>{i18n.t('settings.contextualLayers')}</Text>
          </Row>
          <Row
            action={this.shareAction}
            rowStyle={styles.noMarginsRow}
            style={styles.row}
          >
            <Image style={styles.rowIcon} source={shareIcon} />
            <Text style={styles.rowLabel}>{i18n.t('settings.shareData')}</Text>
            {this.state.isExportInProgress && <ActivityIndicator color={Theme.colors.turtleGreen} size={'large'} />}
          </Row>
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
