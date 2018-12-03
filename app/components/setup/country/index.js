import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Text, ActivityIndicator } from 'react-native';
import { Navigation } from 'react-native-navigation';

import SearchSelector from 'components/common/search-selector';
import ActionButton from 'components/common/action-button';
import Theme from 'config/theme';
import i18n from 'locales';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';

const backIcon = require('assets/previous.png');
const layersIcon = require('assets/layers.png');

function renderLoading() {
  return (
    <View style={[styles.container, styles.center]}>
      <ActivityIndicator color={Theme.colors.color1} style={{ height: 80 }} size={'large'} />
    </View>
  );
}

function getCountrySelected(countries, iso) {
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

function getCurrentCountry(countries, iso) {
  for (let i = 0, length = countries.length; i < length; i++) {
    if (countries[i].iso === iso) {
      return countries[i];
    }
  }
  return { label: '', id: iso };
}

class SetupCountry extends Component {
  static options(passProps) {
    return {
      topBar: {
        leftButtons: passProps.goBackDisabled ? [
          {
            id: 'logout',
            text: "Logout",
            icon: backIcon
          }
        ] : undefined,
        title: {
          text: i18n.t('commonText.setup')
        }
      }
    };
  }

  constructor(props: Props) {
    super(props);
    Navigation.events().bindComponent(this);
  }

  componentDidMount() {
    tracker.trackScreenView('Set Up - Select Country');
  }

  navigationButtonPressed({ buttonId }) {
    if (buttonId === 'logout') {
      //this.props.logout();
      Navigation.setStackRoot(this.props.componentId, {
        component: {
          name: 'ForestWatcher.Home'
        }
      });
    }
  }

  onNextPress = () => {
    const { componentId, setupCountry, countries, user } = this.props;
    if (!(setupCountry && setupCountry.iso) && user.country) {
      const currentCountry = getCurrentCountry(countries, user.country);
      this.props.setSetupCountry(currentCountry);
    }
    Navigation.push(componentId, {
        component: {
          name: 'ForestWatcher.SetupBoundaries'
        }
    });
  };

  render() {
    const { user, countries, setupCountry, setSetupCountry } = this.props;
    if (user && countries && countries.length) {
      const iso = (setupCountry && setupCountry.iso) || user.country;
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.text}>
              {i18n.t('setupCountry.welcomeText')}
              {user ? '!' : ` ${user.fullName}`}
            </Text>
            <Text style={styles.text}>{i18n.t('setupCountry.secondWelcomeText')}</Text>
          </View>

          <View style={styles.selector}>
            <Text style={styles.selectorLabel}>{i18n.t('setupCountry.firstInstruction')}</Text>
            <SearchSelector
              selected={getCountrySelected(countries, iso)}
              onOptionSelected={setSetupCountry}
              data={countries}
              placeholder={i18n.t('countries.searchPlaceholder')}
            />
          </View>

          <ActionButton
            style={styles.buttonPos}
            disabled={!iso}
            onPress={this.onNextPress}
            text={i18n.t('commonText.next').toUpperCase()}
          />
        </View>
      );
    }
    return renderLoading();
  }
}

SetupCountry.propTypes = {
  logout: PropTypes.func,
  user: PropTypes.any,
  setupCountry: PropTypes.any,
  countries: PropTypes.any,
  setSetupCountry: PropTypes.func.isRequired
};

export default SetupCountry;
