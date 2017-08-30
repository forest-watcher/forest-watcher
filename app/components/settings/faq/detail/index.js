import React from 'react';
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

function FaqDetail(props) {
  const { description, orderList, orderListLetters, footerText } = props.contentFaq;
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

        {description && description.map((data, key) => (
          <Hyperlink
            key={key}
            linkDefault linkStyle={{ color: '#97be32' }}
            linkText={(url) => (url === 'mailto:forestwatcher@wri.org' ? 'forestwatcher@wri.org' : url)}
          >
            <Text style={styles.faqText}>{data.text}</Text>
          </Hyperlink>
        ))}

        {orderList && orderList.map((data, key) => (
          <View
            key={key}
            style={description === '' ? styles.faqListNoPadding : styles.faqList}
          >
            <View style={styles.faqDotList}>{}</View>
            <Hyperlink linkDefault linkStyle={{ color: '#97be32' }}>
              <Text style={styles.faqText}>{data.text}</Text>
            </Hyperlink>
          </View>
        ))}

        {orderListLetters && orderListLetters.map((data, key) => (
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

        {footerText && footerText.map((data, key) => (
          <Hyperlink key={key} linkDefault linkStyle={{ color: '#97be32' }}>
            <Text style={styles.faqText}>{data.text}</Text>
          </Hyperlink>
        ))}
      </View>

    </ScrollView>
  );
}

FaqDetail.navigatorStyle = {
  navBarTextColor: Theme.colors.color1,
  navBarButtonColor: Theme.colors.color1,
  topBarElevationShadowEnabled: false,
  navBarBackgroundColor: Theme.background.main
};

FaqDetail.propTypes = {
  contentFaq: PropTypes.any
};

export default FaqDetail;
