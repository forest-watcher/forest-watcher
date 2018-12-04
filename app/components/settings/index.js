// @flow
import type { Area } from 'types/areas.types';

import React, { Component } from 'react';
import List from 'components/common/list';
import AreaList from 'containers/common/area-list';
import Hyperlink from 'react-native-hyperlink';
import { View, Text, TouchableHighlight, ScrollView, Image, Alert } from 'react-native';

import Theme from 'config/theme';
import i18n from 'locales';
import tracker from 'helpers/googleAnalytics';
import CoordinatesDropdown from 'containers/settings/coordinates-dropdown';
import Row from 'components/common/row';

import styles from './styles';
import { Navigation } from 'react-native-navigation';

const plusIcon = require('assets/plus.png');

type Props = {
  user: any,
  version: string,
  loggedIn: boolean, // eslint-disable-line
  areas: Array<Area>,
  componentId: string,
  logout: () => void,
  isConnected: boolean,
  isUnsafeLogout: boolean,
  setOfflineMode: () => void,
  offlineMode: boolean,
  showNotConnectedNotification: () => void
};

class Settings extends Component<Props> {
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
  }

  componentDidMount() {
    tracker.trackScreenView('Settings');
  }

  componentWillReceiveProps(props: Props) {
    if (props.areas.length === 0 && props.loggedIn) {
      Navigation.push(this.props.componentId, {
        component: {
          name: 'ForestWatcher.SetupCountry'
        }
      });
    }
  }

  onAreaPress = (areaId: string, name: string) => {
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.AreaDetail',
        passProps: {
          id: areaId
        },
        options: {
          topBar: {
            title: {
              text: name
            }
          }
        }
      }
    });
  };

  onLogoutPress = () => {
    const { logout, componentId, isUnsafeLogout } = this.props;
    const proceedWithLogout = () => {
      logout();
      Navigation.setStackRoot(componentId, {
        component: {
          name: 'ForestWatcher.Home'
        }
      });
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
  };

  onPressAddArea = () => {
    const { isConnected, offlineMode, showNotConnectedNotification } = this.props;
    if (isConnected && !offlineMode) {
      Navigation.push(this.props.componentId, {
        component: {
          name: 'ForestWatcher.SetupCountry'
        }
      });
    } else {
      showNotConnectedNotification();
    }
  };

  handleStaticLinks = (section: string, text: string) => {
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
  };

  render() {
    const { version, areas, setOfflineMode, offlineMode } = this.props;
    const hasUserData = this.props.user.fullName && this.props.user.email;

    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <Text style={styles.label}>{i18n.t('settings.loggedIn')}</Text>

          <View style={styles.user}>
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
          </View>

          <View style={styles.coordinates}>
            <CoordinatesDropdown />
          </View>
          <View style={styles.offlineMode}>
            <Row value={offlineMode} onValueChange={setOfflineMode}>
              <Text style={[styles.label, { marginLeft: 0 }]}>{i18n.t('settings.offlineMode')}</Text>
            </Row>
          </View>

          {areas && areas.length ? (
            <View style={styles.areas}>
              <Text style={styles.label}>{i18n.t('settings.yourAreas')}</Text>
              <AreaList onAreaPress={(areaId, name) => this.onAreaPress(areaId, name)} />
            </View>
          ) : null}
          <TouchableHighlight activeOpacity={0.5} underlayColor="transparent" onPress={this.onPressAddArea}>
            <View style={styles.addButton}>
              <Image style={[Theme.icon, styles.addButtonIcon]} source={plusIcon} />
              <Text style={styles.addButtonText}>{i18n.t('settings.addArea').toUpperCase()}</Text>
            </View>
          </TouchableHighlight>

          <View style={styles.aboutSection}>
            <Text style={styles.label}>{i18n.t('settings.aboutApp')}</Text>
            <List content={this.aboutSections} bigSeparation={false}>
              {}
            </List>
            <View style={styles.footerText}>
              <Text style={[styles.label, { marginLeft: 0 }]}>{i18n.t('commonText.appName')}</Text>
              <Text style={styles.versionText}>v{version}</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
}

export default Settings;
