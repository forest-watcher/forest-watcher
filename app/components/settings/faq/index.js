import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  ScrollView
} from 'react-native';
import tracker from 'helpers/googleAnalytics';

import i18n from 'locales';
import Theme from 'config/theme';
import List from 'components/common/list';
import styles from './styles';

const terms = [
  {
    text: i18n.t('faq.firstQuestion.title'),
    title: i18n.t('faq.firstQuestion.title'),
    list: i18n.t('faq.firstQuestion.content'),
    section: 'ForestWatcher.FaqDetail',
    functionOnPress: this.handleStaticLinks
  },
  {
    text: i18n.t('faq.secondQuestion.title'),
    title: i18n.t('faq.secondQuestion.title'),
    list: i18n.t('faq.secondQuestion.content'),
    section: 'ForestWatcher.FaqDetail',
    functionOnPress: this.handleStaticLinks
  },
  {
    text: i18n.t('faq.thirdQuestion.title'),
    title: i18n.t('faq.thirdQuestion.title'),
    list: i18n.t('faq.thirdQuestion.content'),
    section: 'ForestWatcher.FaqDetail',
    functionOnPress: this.handleStaticLinks
  },
  {
    text: i18n.t('faq.fourthQuestion.title'),
    title: i18n.t('faq.fourthQuestion.title'),
    list: i18n.t('faq.fourthQuestion.content'),
    section: 'ForestWatcher.FaqDetail',
    functionOnPress: this.handleStaticLinks
  },
  {
    text: i18n.t('faq.fifthQuestion.title'),
    title: i18n.t('faq.fifthQuestion.title'),
    list: i18n.t('faq.fifthQuestion.content'),
    section: 'ForestWatcher.FaqDetail',
    functionOnPress: this.handleStaticLinks
  },
  {
    text: i18n.t('faq.sixthQuestion.title'),
    title: i18n.t('faq.sixthQuestion.title'),
    list: i18n.t('faq.sixthQuestion.content'),
    section: 'ForestWatcher.FaqDetail',
    functionOnPress: this.handleStaticLinks
  },
  {
    text: i18n.t('faq.seventhQuestion.title'),
    title: i18n.t('faq.seventhQuestion.title'),
    list: i18n.t('faq.seventhQuestion.content'),
    section: 'ForestWatcher.FaqDetail',
    functionOnPress: this.handleStaticLinks
  },
  {
    text: i18n.t('faq.eighthQuestion.title'),
    title: i18n.t('faq.eighthQuestion.title'),
    section: 'ForestWatcher.FaqDetail',
    functionOnPress: this.handleStaticLinks
  },
  {
    text: i18n.t('faq.ninethQuestion.title'),
    title: i18n.t('faq.ninethQuestion.title'),
    list: i18n.t('faq.ninethQuestion.content'),
    section: 'ForestWatcher.FaqDetail',
    functionOnPress: this.handleStaticLinks
  },
  {
    text: i18n.t('faq.tenthQuestion.title'),
    title: i18n.t('faq.tenthQuestion.title'),
    list: i18n.t('faq.tenthQuestion.content'),
    section: 'ForestWatcher.FaqDetail',
    functionOnPress: this.handleStaticLinks
  },
  {
    text: i18n.t('faq.eleventhQuestion.title'),
    title: i18n.t('faq.eleventhQuestion.title'),
    list: i18n.t('faq.eleventhQuestion.content'),
    section: 'ForestWatcher.FaqDetail',
    functionOnPress: this.handleStaticLinks
  }
].filter(term => (term.list && Object.values(term.list).some(text => (!!text))));

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
