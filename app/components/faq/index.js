// @flow
import React, { Component } from 'react';
import { Image, View, Text, ScrollView } from 'react-native';
import { Navigation } from 'react-native-navigation';

import i18n from 'i18next';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';

import Theme from 'config/theme';

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

export default class FaqCategories extends Component<Props> {
  static options(passProps: {}) {
    return {
      topBar: {
        background: {
          color: Theme.colors.veryLightPink
        },
        title: {
          text: i18n.t('faq.categories.title')
        }
      }
    };
  }

  constructor(props: Props) {
    super(props);
    this.categories = [
      {
        icon: featuresIcon,
        title: i18n.t('faq.categories.features.title'),
        questions: i18n.t('faq.categories.features.questions', { returnObjects: true })
      },
      {
        icon: alertsIcon,
        title: i18n.t('faq.categories.alertsAndData.title'),
        questions: i18n.t('faq.categories.alertsAndData.questions', { returnObjects: true })
      },
      {
        icon: inTheFieldIcon,
        title: i18n.t('faq.categories.inTheField.title'),
        questions: i18n.t('faq.categories.inTheField.questions', { returnObjects: true })
      },
      {
        icon: helpIcon,
        title: i18n.t('faq.categories.help.title'),
        questions: i18n.t('faq.categories.help.questions', { returnObjects: true })
      },
      {
        icon: aboutIcon,
        title: i18n.t('faq.categories.about.title'),
        questions: i18n.t('faq.categories.about.questions', { returnObjects: true })
      }
    ];
  }

  componentDidMount() {
    tracker.trackScreenView('FAQ');
  }

  onCategoryPress = (category: FAQCategory) => {
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.FaqCategory',
        passProps: {
          category
        }
      }
    });
  };

  render() {
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
                  icon: nextIcon
                }}
                key={index}
                style={styles.row}
              >
                <Image style={styles.rowIcon} source={category.icon} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitleLabel}>{category.title}</Text>
                  <Text style={styles.rowSubtitleLabel}>
                    {i18n.t(
                      category.questions.count === 1
                        ? 'faq.categories.questionCountSingular'
                        : 'faq.categories.questionCountPlural',
                      { count: category.questions.length }
                    )}
                  </Text>
                </View>
              </Row>
            );
          })}
        </ScrollView>
      </View>
    );
  }
}
