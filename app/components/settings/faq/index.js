import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  ScrollView
} from 'react-native';
import tracker from 'helpers/googleAnalytics';

import I18n from 'locales';
import Theme from 'config/theme';
import List from 'components/common/list';
import styles from './styles';

class FaqList extends Component {
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
    tracker.trackScreenView('FaqList');
  }

  handleStaticLinks = (section, text, list) => {
    this.props.navigator.push({
      screen: section,
      title: text,
      passProps: {
        contentFaq: list
      }
    });
  }

  render() {
    const terms = [
      {
        text: I18n.t('faq.firstQuestion.title'),
        title: I18n.t('faq.firstQuestion.title'),
        list: I18n.t('faq.firstQuestion.content'),
        section: 'ForestWatcher.FaqDetail',
        functionOnPress: this.handleStaticLinks

      },
      {
        text: I18n.t('faq.secondQuestion.title'),
        title: I18n.t('faq.secondQuestion.title'),
        list: I18n.t('faq.secondQuestion.content'),
        section: 'ForestWatcher.FaqDetail',
        functionOnPress: this.handleStaticLinks

      },
      {
        text: I18n.t('faq.thirdQuestion.title'),
        title: I18n.t('faq.thirdQuestion.title'),
        list: I18n.t('faq.thirdQuestion.content'),
        section: 'ForestWatcher.FaqDetail',
        functionOnPress: this.handleStaticLinks

      },
      {
        text: I18n.t('faq.fourthQuestion.title'),
        title: I18n.t('faq.fourthQuestion.title'),
        list: I18n.t('faq.fourthQuestion.content'),
        section: 'ForestWatcher.FaqDetail',
        functionOnPress: this.handleStaticLinks

      },
      {
        text: I18n.t('faq.fifthQuestion.title'),
        title: I18n.t('faq.fifthQuestion.title'),
        list: I18n.t('faq.fifthQuestion.content'),
        section: 'ForestWatcher.FaqDetail',
        functionOnPress: this.handleStaticLinks

      },
      {
        text: I18n.t('faq.sixthQuestion.title'),
        title: I18n.t('faq.sixthQuestion.title'),
        list: I18n.t('faq.sixthQuestion.content'),
        section: 'ForestWatcher.FaqDetail',
        functionOnPress: this.handleStaticLinks

      },
      {
        text: I18n.t('faq.seventhQuestion.title'),
        title: I18n.t('faq.seventhQuestion.title'),
        list: I18n.t('faq.seventhQuestion.content'),
        section: 'ForestWatcher.FaqDetail',
        functionOnPress: this.handleStaticLinks

      },
      {
        text: I18n.t('faq.eighthQuestion.title'),
        title: I18n.t('faq.eighthQuestion.title'),
        section: 'ForestWatcher.FaqDetail',
        functionOnPress: this.handleStaticLinks

      },
      {
        text: I18n.t('faq.ninethQuestion.title'),
        title: I18n.t('faq.ninethQuestion.title'),
        list: I18n.t('faq.ninethQuestion.content'),
        section: 'ForestWatcher.FaqDetail',
        functionOnPress: this.handleStaticLinks

      },
      {
        text: I18n.t('faq.tenthQuestion.title'),
        title: I18n.t('faq.tenthQuestion.title'),
        list: I18n.t('faq.tenthQuestion.content'),
        section: 'ForestWatcher.FaqDetail',
        functionOnPress: this.handleStaticLinks

      },
      {
        text: I18n.t('faq.eleventhQuestion.title'),
        title: I18n.t('faq.eleventhQuestion.title'),
        list: I18n.t('faq.eleventhQuestion.content'),
        section: 'ForestWatcher.FaqDetail',
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
        <List content={terms} bigSeparation={false}>{}</List>
      </ScrollView>
    );
  }
}

export default FaqList;
