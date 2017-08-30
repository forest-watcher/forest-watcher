import React, { Component } from 'react';
import Hyperlink from 'react-native-hyperlink';
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
    orderListLetters: this.props.contentFaq.orderListLetters,
    footerText: this.props.contentFaq.footerText
  };

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

          {this.state.description && this.state.description.map((data, key) => (
            <Hyperlink
              key={key}
              linkDefault linkStyle={{ color: '#97be32' }}
              linkText={(url) => (url === 'mailto:forestwatcher@wri.org' ? 'forestwatcher@wri.org' : url)}
            >
              <Text style={styles.faqText}>{data.text}</Text>
            </Hyperlink>
          ))}

          {this.state.orderList && this.state.orderList.map((data, key) => (
            <View
              key={key}
              style={this.state.description === '' ? styles.faqListNoPadding : styles.faqList}
            >
              <View style={styles.faqDotList}>{}</View>
              <Hyperlink linkDefault linkStyle={{ color: '#97be32' }}>
                <Text style={styles.faqText}>{data.text}</Text>
              </Hyperlink>
            </View>
          ))}

          {this.state.orderListLetters && this.state.orderListLetters.map((data, key) => (
            <View key={key}>
              <View style={styles.faqListLetter}>
                <Text style={styles.faqText}>{String.fromCharCode(97 + (key % 27))}. </Text>
                <Hyperlink linkDefault linkStyle={{ color: '#97be32' }}>
                  <Text style={styles.faqText}>{data.text}</Text>
                </Hyperlink>
              </View>
              <View style={styles.faqListLetterDescription}>
                <Text style={styles.faqText}>i. </Text>
                <Hyperlink
                  linkDefault
                  linkStyle={{ color: '#97be32' }}
                  linkText={(url) => (url === 'mailto:forestwatcher@wri.org' ? 'forestwatcher@wri.org' : url)}
                >
                  <Text style={styles.faqText}>{data.description}</Text>
                </Hyperlink>
              </View>
            </View>
          ))}

          {this.state.footerText && this.state.footerText.map((data, key) => (
            <Hyperlink key={key} linkDefault linkStyle={{ color: '#97be32' }}>
              <Text style={styles.faqText}>{data.text}</Text>
            </Hyperlink>
          ))}
        </View>

      </ScrollView>
    );
  }
}

export default FaqDetail;
