import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  ScrollView,
  Text
} from 'react-native';
import tracker from 'helpers/googleAnalytics';

import i18n from 'locales';
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
        text: i18n.t('termsAndConditions.firstTerm.title'),
        title: i18n.t('termsAndConditions.firstTerm.title'),
        list: i18n.t('termsAndConditions.firstTerm.content'),
        section: 'ForestWatcher.TermsAndConditionsDetail',
        functionOnPress: this.handleStaticLinks

      },
      {
        text: i18n.t('termsAndConditions.secondTerm.title'),
        title: i18n.t('termsAndConditions.secondTerm.title'),
        list: i18n.t('termsAndConditions.secondTerm.content'),
        section: 'ForestWatcher.TermsAndConditionsDetail',
        functionOnPress: this.handleStaticLinks
      },
      {
        text: i18n.t('termsAndConditions.thirdTerm.title'),
        title: i18n.t('termsAndConditions.thirdTerm.title'),
        list: i18n.t('termsAndConditions.thirdTerm.content'),
        section: 'ForestWatcher.TermsAndConditionsDetail',
        functionOnPress: this.handleStaticLinks
      },
      {
        text: i18n.t('termsAndConditions.fourthTerm.title'),
        title: i18n.t('termsAndConditions.fourthTerm.title'),
        list: i18n.t('termsAndConditions.fourthTerm.content'),
        section: 'ForestWatcher.TermsAndConditionsDetail',
        functionOnPress: this.handleStaticLinks
      },
      {
        text: i18n.t('termsAndConditions.fifthTerm.title'),
        title: i18n.t('termsAndConditions.fifthTerm.title'),
        list: i18n.t('termsAndConditions.fifthTerm.content'),
        section: 'ForestWatcher.TermsAndConditionsDetail',
        functionOnPress: this.handleStaticLinks
      },
      {
        text: i18n.t('termsAndConditions.sixthTerm.title'),
        title: i18n.t('termsAndConditions.sixthTerm.title'),
        list: i18n.t('termsAndConditions.sixthTerm.content'),
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
          <Text style={styles.termsText}>{i18n.t('termsAndConditions.description')}</Text>
          <Text style={styles.termsText}>{i18n.t('termsAndConditions.agreeText')}</Text>
        </View>
        <List content={terms} bigSeparation={false}>{}</List>
      </ScrollView>
    );
  }
}

export default TermsAndConditions;
