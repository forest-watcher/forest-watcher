import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  ScrollView,
  Text,
  Linking
} from 'react-native';
// import tracker from 'helpers/googleAnalytics';

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

  componentDidMount() {
    // tracker.trackScreenView('TermsAndConditions');
  }

  handleStaticLinks = (section, text, list, description) => {
    this.props.navigator.push({
      screen: section,
      title: text,
      passProps: {
        contentTerm: list,
        descriptionTerm: description
      }
    });
  }

  render() {
    const terms = [
      {
        text: I18n.t('termsAndConditions.firstTerm.title'),
        title: I18n.t('termsAndConditions.firstTerm.title'),
        list: I18n.t('termsAndConditions.firstTerm.list'),
        description: I18n.t('termsAndConditions.firstTerm.description'),
        section: 'ForestWatcher.TermsAndConditionsDetail',
        functionOnPress: this.handleStaticLinks

      },
      {
        text: I18n.t('termsAndConditions.secondTerm.title'),
        title: I18n.t('termsAndConditions.secondTerm.title'),
        list: I18n.t('termsAndConditions.secondTerm.list'),
        description: I18n.t('termsAndConditions.secondTerm.description'),
        section: 'ForestWatcher.TermsAndConditionsDetail',
        functionOnPress: this.handleStaticLinks
      },
      {
        text: I18n.t('termsAndConditions.thirdTerm.title'),
        title: I18n.t('termsAndConditions.thirdTerm.title'),
        list: I18n.t('termsAndConditions.thirdTerm.list'),
        description: I18n.t('termsAndConditions.thirdTerm.description'),
        section: 'ForestWatcher.TermsAndConditionsDetail',
        functionOnPress: this.handleStaticLinks
      },
      {
        text: I18n.t('termsAndConditions.fourthTerm.title'),
        title: I18n.t('termsAndConditions.fourthTerm.title'),
        list: I18n.t('termsAndConditions.fourthTerm.list'),
        description: I18n.t('termsAndConditions.fourthTerm.description'),
        section: 'ForestWatcher.TermsAndConditionsDetail',
        functionOnPress: this.handleStaticLinks
      },
      {
        text: I18n.t('termsAndConditions.fifthTerm.title'),
        title: I18n.t('termsAndConditions.fifthTerm.title'),
        list: I18n.t('termsAndConditions.fifthTerm.list'),
        description: I18n.t('termsAndConditions.fifthTerm.description'),
        section: 'ForestWatcher.TermsAndConditionsDetail',
        functionOnPress: this.handleStaticLinks
      },
      {
        text: I18n.t('termsAndConditions.sixthTerm.title'),
        title: I18n.t('termsAndConditions.sixthTerm.title'),
        list: I18n.t('termsAndConditions.sixthTerm.list'),
        description: I18n.t('termsAndConditions.sixthTerm.description'),
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

TermsAndConditions.propTypes = {
  partners: PropTypes.array
};

export default TermsAndConditions;
