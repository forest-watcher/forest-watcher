// @flow

import React, { Component } from 'react';
import { View, ScrollView, Text } from 'react-native';
import tracker from 'helpers/googleAnalytics';

import i18n from 'i18next';
import Row from 'components/common/row';
import styles from './styles';
import { Navigation } from 'react-native-navigation';

const nextIcon = require('assets/next.png');

import type { FAQCategory, FAQQuestion } from 'types/faq.types';

type Props = {
  category: FAQCategory,
  componentId: string
};

export default class FaqCategory extends Component<Props> {
  componentDidMount() {
    tracker.trackScreenView('FaqCategory');
  }

  handleStaticLinks = (question: FAQQuestion) => {
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.FaqDetail',
        passProps: {
          contentFaq: question.content
        },
        options: {
          topBar: {
            title: {
              text: question.title
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
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <Text style={styles.label}>{i18n.t('faq.category.sectionHeader')}</Text>
          {this.props.category.questions.map((question, index) => {
            return (
              <Row
                action={{
                  callback: this.handleStaticLinks.bind(this, question),
                  icon: nextIcon
                }}
                key={index}
                rowStyle={{ marginBottom: 0 }}
                style={{ flex: 1 }}
              >
                <Text style={styles.rowTitleLabel}>{question.title}</Text>
              </Row>
            );
          })}
        </ScrollView>
      </View>
    );
  }
}
