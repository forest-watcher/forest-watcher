import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, ScrollView } from 'react-native';
import tracker from 'helpers/googleAnalytics';

import i18n from 'i18next';
import List from 'components/common/list';
import styles from './styles';
import { Navigation } from 'react-native-navigation';

class FaqList extends Component {
  constructor() {
    super();
    this.terms = [
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
    ].filter(term => term.list && Object.values(term.list).some(text => !!text));
  }

  static propTypes = {
    componentId: PropTypes.string.isRequired
  };

  componentDidMount() {
    tracker.trackScreenView('FaqList');
  }

  handleStaticLinks = (section, text, list) => {
    Navigation.push(this.props.componentId, {
      component: {
        name: section,
        passProps: {
          contentFaq: list
        },
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
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.containerContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <List content={this.terms} bigSeparation={false}>
            {}
          </List>
        </ScrollView>
      </View>
    );
  }
}

export default FaqList;
