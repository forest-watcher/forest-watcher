// @flow
import React, { Component } from 'react';
import { Image, View, Text, ScrollView } from 'react-native';
import { Navigation } from 'react-native-navigation';

import i18n from 'i18next';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';

import Row from 'components/common/row';

const featuresIcon = require('assets/faqFeatures.png');
const alertsIcon = require('assets/faqAlerts.png');
const inTheFieldIcon = require('assets/faqUsing.png');
const helpIcon = require('assets/faqHelp.png');
const aboutIcon = require('assets/faqAbout.png');
const nextIcon = require('assets/next.png');

import type { FAQCategory } from 'types/faq.types';

type Props = {
  componentId: string
};

    // this.terms = [
    //   {
    //     text: i18n.t('faq.firstQuestion.title'),
    //     title: i18n.t('faq.firstQuestion.title'),
    //     list: i18n.t('faq.firstQuestion.content'),
    //     section: 'ForestWatcher.FaqDetail',
    //     functionOnPress: this.handleStaticLinks
    //   },
    //   {
    //     text: i18n.t('faq.secondQuestion.title'),
    //     title: i18n.t('faq.secondQuestion.title'),
    //     list: i18n.t('faq.secondQuestion.content'),
    //     section: 'ForestWatcher.FaqDetail',
    //     functionOnPress: this.handleStaticLinks
    //   },
    //   {
    //     text: i18n.t('faq.thirdQuestion.title'),
    //     title: i18n.t('faq.thirdQuestion.title'),
    //     list: i18n.t('faq.thirdQuestion.content'),
    //     section: 'ForestWatcher.FaqDetail',
    //     functionOnPress: this.handleStaticLinks
    //   },
    //   {
    //     text: i18n.t('faq.fourthQuestion.title'),
    //     title: i18n.t('faq.fourthQuestion.title'),
    //     list: i18n.t('faq.fourthQuestion.content'),
    //     section: 'ForestWatcher.FaqDetail',
    //     functionOnPress: this.handleStaticLinks
    //   },
    //   {
    //     text: i18n.t('faq.fifthQuestion.title'),
    //     title: i18n.t('faq.fifthQuestion.title'),
    //     list: i18n.t('faq.fifthQuestion.content'),
    //     section: 'ForestWatcher.FaqDetail',
    //     functionOnPress: this.handleStaticLinks
    //   },
    //   {
    //     text: i18n.t('faq.sixthQuestion.title'),
    //     title: i18n.t('faq.sixthQuestion.title'),
    //     list: i18n.t('faq.sixthQuestion.content'),
    //     section: 'ForestWatcher.FaqDetail',
    //     functionOnPress: this.handleStaticLinks
    //   },
    //   {
    //     text: i18n.t('faq.seventhQuestion.title'),
    //     title: i18n.t('faq.seventhQuestion.title'),
    //     list: i18n.t('faq.seventhQuestion.content'),
    //     section: 'ForestWatcher.FaqDetail',
    //     functionOnPress: this.handleStaticLinks
    //   },
    //   {
    //     text: i18n.t('faq.eighthQuestion.title'),
    //     title: i18n.t('faq.eighthQuestion.title'),
    //     section: 'ForestWatcher.FaqDetail',
    //     functionOnPress: this.handleStaticLinks
    //   },
    //   {
    //     text: i18n.t('faq.ninethQuestion.title'),
    //     title: i18n.t('faq.ninethQuestion.title'),
    //     list: i18n.t('faq.ninethQuestion.content'),
    //     section: 'ForestWatcher.FaqDetail',
    //     functionOnPress: this.handleStaticLinks
    //   },
    //   {
    //     text: i18n.t('faq.tenthQuestion.title'),
    //     title: i18n.t('faq.tenthQuestion.title'),
    //     list: i18n.t('faq.tenthQuestion.content'),
    //     section: 'ForestWatcher.FaqDetail',
    //     functionOnPress: this.handleStaticLinks
    //   },
    //   {
    //     text: i18n.t('faq.eleventhQuestion.title'),
    //     title: i18n.t('faq.eleventhQuestion.title'),
    //     list: i18n.t('faq.eleventhQuestion.content'),
    //     section: 'ForestWatcher.FaqDetail',
    //     functionOnPress: this.handleStaticLinks
    //   }
    // ].filter(term => term.list && Object.values(term.list).some(text => !!text));

export default class FaqCategories extends Component<Props> {
  static options(passProps) {
    return {
      topBar: {
        title: {
          text: i18n.t('faq.placeholder.title')
        }
      }
    };
  }

  constructor(props) {
    super(props);
    this.categories = [
      {
        icon: featuresIcon,
        title: i18n.t('faq.categories.features.title'),
        questions: [

        ]
      },
      {
        icon: alertsIcon,
        title: i18n.t('faq.categories.alertsAndData.title'),
        questions: [
          
        ]
      },
      {
        icon: inTheFieldIcon,
        title: i18n.t('faq.categories.inTheField.title'),
        questions: [
          
        ]
      },
      {
        icon: helpIcon,
        title: i18n.t('faq.categories.help.title'),
        questions: [
          
        ]
      },
      {
        icon: aboutIcon,
        title: i18n.t('faq.categories.about.title'),
        questions: [
          {
            title: i18n.t('faq.categories.about.question1.title'),
            content: i18n.t('faq.categories.about.question1.content')
          }
        ]
      }
    ]
  }

  componentDidMount() {
    tracker.trackScreenView('FAQ');
  }

  onCategoryPress = ((category: FAQCategory) => {
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.FaqCategory',
        passProps: {
          category
        },
        options: {
          topBar: {
            title: {
              text: category.title
            }
          }
        }
      }
    })
  });

  render() {

    console.log("Categories!", this.categories);

    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        > 
          <Text style={styles.label}>{i18n.t('faq.categories.sectionHeader')}</Text>
          {this.categories.map((category, index) => {
            return (
              <Row 
                action={{
                  callback: this.onCategoryPress.bind(this, category),
                  icon: nextIcon,
                }}
                key={index} 
                style={styles.row}
              >
                <Image style={styles.rowIcon} source={category.icon}/>
                <View style={{flex: 1}}>
                  <Text style={styles.rowTitleLabel}>{category.title}</Text>
                  <Text style={styles.rowSubtitleLabel}>{i18n.t(category.questions.count === 1 ? 'faq.categories.questionCountSingular' : 'faq.categories.questionCountPlural', { count: category.questions.length })}</Text>
                </View>
              </Row>
            )
          })}
        </ScrollView>
      </View>
    );
  }
}