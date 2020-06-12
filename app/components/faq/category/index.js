// @flow

import React, { Component } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { trackScreenView } from 'helpers/analytics';

import Row from 'components/common/row';
import styles from './styles';
import { Navigation } from 'react-native-navigation';

import Theme from 'config/theme';

const nextIcon = require('assets/next.png');

import type { FAQCategory, FAQQuestion } from 'types/faq.types';

type Props = {
  category: FAQCategory,
  componentId: string
};

export default class FaqCategory extends Component<Props> {
  static options(passProps: {}) {
    return {
      topBar: {
        background: {
          color: Theme.colors.veryLightPink
        }
      }
    };
  }
  componentDidMount() {
    trackScreenView('FaqCategory');
  }

  handleStaticLinks = (question: FAQQuestion) => {
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.FaqDetail',
        passProps: {
          contentFaq: question.content,
          title: question.title
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
          <Text style={styles.label}>{this.props.category.title}</Text>
          {this.props.category.questions &&
            this.props.category.questions.map((question, index) => {
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
