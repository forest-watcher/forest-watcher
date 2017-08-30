import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  ScrollView,
  Text
} from 'react-native';
import tracker from 'helpers/googleAnalytics';

import I18n from 'locales';
import Theme from 'config/theme';
import List from 'components/common/list';
import styles from './styles';

class TermsAndConditions extends Component {
  static navigatorStyle = {
    navBarTextColor: Theme.colors.color1,
    navBarButtonColor: Theme.colors.color1,
    topBarElevationShadowEnabled: false,
    navBarBackgroundColor: Theme.background.main
  };

  static propTypes = {
    navigator: PropTypes.object.isRequired
  };

  componentDidMount() {
    tracker.trackScreenView('TermsAndConditions');
  }

  handleStaticLinks = (section, text, list) => {
    this.props.navigator.push({
      screen: section,
      title: text,
      passProps: {
        contentTerm: list
      }
    });
  }

  render() {
    const terms = [
      {
        text: I18n.t('termsAndConditions.firstTerm.title'),
        title: I18n.t('termsAndConditions.firstTerm.title'),
        list: I18n.t('termsAndConditions.firstTerm.content'),
        section: 'ForestWatcher.TermsAndConditionsDetail',
        functionOnPress: this.handleStaticLinks

      },
      {
        text: I18n.t('termsAndConditions.secondTerm.title'),
        title: I18n.t('termsAndConditions.secondTerm.title'),
        list: I18n.t('termsAndConditions.secondTerm.content'),
        section: 'ForestWatcher.TermsAndConditionsDetail',
        functionOnPress: this.handleStaticLinks
      },
      {
        text: I18n.t('termsAndConditions.thirdTerm.title'),
        title: I18n.t('termsAndConditions.thirdTerm.title'),
        list: I18n.t('termsAndConditions.thirdTerm.content'),
        section: 'ForestWatcher.TermsAndConditionsDetail',
        functionOnPress: this.handleStaticLinks
      },
      {
        text: I18n.t('termsAndConditions.fourthTerm.title'),
        title: I18n.t('termsAndConditions.fourthTerm.title'),
        list: I18n.t('termsAndConditions.fourthTerm.content'),
        section: 'ForestWatcher.TermsAndConditionsDetail',
        functionOnPress: this.handleStaticLinks
      },
      {
        text: I18n.t('termsAndConditions.fifthTerm.title'),
        title: I18n.t('termsAndConditions.fifthTerm.title'),
        list: I18n.t('termsAndConditions.fifthTerm.content'),
        section: 'ForestWatcher.TermsAndConditionsDetail',
        functionOnPress: this.handleStaticLinks
      },
      {
        text: I18n.t('termsAndConditions.sixthTerm.title'),
        title: I18n.t('termsAndConditions.sixthTerm.title'),
        list: I18n.t('termsAndConditions.sixthTerm.content'),
        section: 'ForestWatcher.TermsAndConditionsDetail',
        functionOnPress: this.handleStaticLinks
      }
    ];
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.terms}>
          <Text style={styles.termsText}>{I18n.t('termsAndConditions.description')}</Text>
          <Text style={styles.termsText}>{I18n.t('termsAndConditions.agreeText')}</Text>
        </View>
        <List content={terms} bigSeparation={false}>{}</List>
      </ScrollView>
    );
  }
}

export default TermsAndConditions;
