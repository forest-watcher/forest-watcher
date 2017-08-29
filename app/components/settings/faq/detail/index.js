import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  ScrollView,
  Text
} from 'react-native';
// import tracker from 'helpers/googleAnalytics';

import Theme from 'config/theme';
import styles from './styles';

class FaqDetail extends Component {
  static navigatorStyle = {
    navBarTextColor: Theme.colors.color1,
    navBarButtonColor: Theme.colors.color1,
    topBarElevationShadowEnabled: false,
    navBarBackgroundColor: Theme.background.main
  };

  static propTypes = {
    contentFaq: PropTypes.any
  };

  state = {
    description: this.props.contentFaq.description,
    orderList: this.props.contentFaq.orderList,
    orderListLetters: this.props.contentFaq.orderListLetters
  };

  componentDidMount() {
    // tracker.trackScreenView('TermsAndConditions');
  }

  render() {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >

        <View
          style={styles.faq}
        >
          {this.state.description !== null ? this.state.description.map((data, key) => (
            <Text style={styles.faqText} key={key}>{data.text}</Text>
          )) : <Text>{}</Text>}
          {this.state.orderList !== null ? this.state.orderList.map((data, key) => (
            <View
              key={key}
              style={this.state.description === '' ? styles.faqListNoPadding : styles.faqList}
            >
              <View style={styles.faqDotList}>{}</View>
              <Text style={styles.faqText}>{data.text}</Text>
            </View>
          )) : <Text>{}</Text>}

          {this.state.orderListLetters !== null ? this.state.orderListLetters.map((data, key) => (
            <View key={key}>
              <View style={styles.faqListLetter}>
                <Text style={styles.faqText}>{String.fromCharCode(97 + (key % 27))}. </Text>
                <Text style={styles.faqText}>{data.text}</Text>
              </View>
              <View style={styles.faqListLetterDescription}>
                <Text style={styles.faqText}>i. </Text>
                <Text style={styles.faqText}>{data.description}</Text>
              </View>
            </View>
          )) : <Text>{}</Text>}
        </View>

      </ScrollView>
    );
  }
}

export default FaqDetail;
