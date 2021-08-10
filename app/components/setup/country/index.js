import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Text, ActivityIndicator } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { withSafeArea } from 'react-native-safe-area';

import SearchSelector from 'components/common/search-selector';
import ActionButton from 'components/common/action-button';
import Callout from 'components/common/callout';
import Theme from 'config/theme';
import i18n from 'i18next';
import { trackAreaCreationFlowStarted, trackScreenView } from 'helpers/analytics';
import debounceUI from 'helpers/debounceUI';
import styles from './styles';
import { launchAppRoot, showWelcomeScreen } from 'screens/common';
import { pushMapSetupScreen } from 'screens/maps';

const SafeAreaView = withSafeArea(View, 'margin', 'bottom');
const backIcon = require('assets/previous.png');

class SetupCountry extends Component {
  static options(passProps) {
    return {
      topBar: {
        background: {
          color: Theme.colors.veryLightPink
        },
        leftButtons: passProps.goBackDisabled
          ? [
              {
                id: 'logout',
                text: 'Logout',
                icon: backIcon
              }
            ]
          : undefined,
        title: {
          text: i18n.t('commonText.setup')
        }
      }
    };
  }

  constructor(props) {
    super(props);
    Navigation.events().bindComponent(this);
  }

  componentDidMount() {
    trackAreaCreationFlowStarted();
    trackScreenView('Set Up - Select Country');
    this.showWelcomeScreenIfNecessary();
  }

  componentDidAppear() {
    // This is called both here and componentDidAppear because componentDidAppear isn't called when setting
    // the app root using RNN
    this.showWelcomeScreenIfNecessary();
  }

  navigationButtonPressed({ buttonId }) {
    if (buttonId === 'logout') {
      this.props.logout();
      launchAppRoot('ForestWatcher.Home');
    }
  }

  showWelcomeScreenIfNecessary = debounceUI(() => {
    if (!this.props.hasSeenWelcomeScreen) {
      this.props.setWelcomeScreenSeen();
      showWelcomeScreen();
    }
  });

  renderLoading() {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={Theme.colors.turtleGreen} style={{ height: 80 }} size={'large'} />
      </View>
    );
  }

  getCountrySelected(countries, iso) {
    for (let i = 0, length = countries.length; i < length; i++) {
      if (countries[i].iso === iso) {
        return {
          label: countries[i].name,
          id: iso
        };
      }
    }
    return { label: '', id: iso };
  }

  getCurrentCountry(countries, iso) {
    for (let i = 0, length = countries.length; i < length; i++) {
      if (countries[i].iso === iso) {
        return countries[i];
      }
    }
    return { label: '', id: iso };
  }

  onNextPress = debounceUI(() => {
    const { componentId, setupCountry, countries, user } = this.props;
    if (!(setupCountry && setupCountry.iso) && user.country) {
      const currentCountry = this.getCurrentCountry(countries, user.country);
      this.props.setSetupCountry(currentCountry);
    }
    pushMapSetupScreen(componentId);
  });

  render() {
    const { user, countries, setupCountry, setSetupCountry } = this.props;
    if (user && countries && countries.length) {
      const iso = (setupCountry && setupCountry.iso) || user.country;
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.text}>
              {i18n.t('setupCountry.welcomeText')}
              {user ? '!' : ` ${user.fullName}`}
            </Text>
            <Text style={styles.text}>{i18n.t('setupCountry.secondWelcomeText')}</Text>
          </View>

          <View style={styles.selector}>
            <Text style={styles.selectorLabel}>{i18n.t('setupCountry.firstInstruction')}</Text>
            <Callout
              body={i18n.t('setupCountry.tooltip.body')}
              title={i18n.t('setupCountry.tooltip.title')}
              visible={!this.props.areaCountryTooltipSeen}
            >
              <SearchSelector
                selected={this.getCountrySelected(countries, iso)}
                onFocus={() => {
                  this.props.setAreaCountryTooltipSeen(true);
                }}
                onOptionSelected={setSetupCountry}
                data={countries}
                placeholder={i18n.t('countries.searchPlaceholder')}
              />
            </Callout>
          </View>
          <ActionButton
            style={styles.buttonPos}
            disabled={!iso}
            onPress={this.onNextPress}
            text={i18n.t('commonText.next').toUpperCase()}
          />
        </SafeAreaView>
      );
    }
    return this.renderLoading();
  }
}

SetupCountry.propTypes = {
  areaCountryTooltipSeen: PropTypes.bool,
  logout: PropTypes.func,
  user: PropTypes.any,
  setupCountry: PropTypes.any,
  countries: PropTypes.any,
  setAreaCountryTooltipSeen: PropTypes.func.isRequired,
  setSetupCountry: PropTypes.func.isRequired,
  setWelcomeScreenSeen: PropTypes.func.isRequired,
  hasSeenWelcomeScreen: PropTypes.bool.isRequired,
  componentId: PropTypes.string.isRequired
};

export default SetupCountry;
