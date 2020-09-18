import React from 'react';
import Hyperlink from 'react-native-hyperlink';
import PropTypes from 'prop-types';
import { View, ScrollView, Text } from 'react-native';

import Theme from 'config/theme';
import styles from './styles';

function FaqDetail(props) {
  const { description, orderList, orderListLetters, footerText } = props.contentFaq;
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.faq}>
          {props.title && <Text style={styles.faqTitle}>{props.title}</Text>}

          {description &&
            Object.values(description).map((text, key) => (
              <Hyperlink
                key={key}
                linkDefault
                linkStyle={Theme.link}
                linkText={url => (url === 'mailto:forestwatcher@wri.org' ? 'forestwatcher@wri.org' : url)}
              >
                <Text style={styles.faqText} selectable>
                  {text}
                </Text>
              </Hyperlink>
            ))}

          {orderList &&
            Object.values(orderList).map((text, key) => (
              <View key={key} style={description === '' ? styles.faqListNoPadding : styles.faqList}>
                <View style={styles.faqDotList} />
                <Hyperlink linkDefault linkStyle={Theme.link}>
                  <Text style={styles.faqText} selectable>
                    {text}
                  </Text>
                </Hyperlink>
              </View>
            ))}

          {orderListLetters &&
            Object.values(orderListLetters).map((data, key) => (
              <View key={key}>
                <View style={styles.faqListLetter}>
                  <Text style={styles.faqText}>{String.fromCharCode(97 + (key % 27))}. </Text>
                  <Hyperlink linkDefault linkStyle={Theme.link}>
                    <Text style={styles.faqText} selectable>
                      {data.text}
                    </Text>
                  </Hyperlink>
                </View>
                <View style={styles.faqListLetterDescription}>
                  <Text style={styles.faqText}>i. </Text>
                  <Hyperlink
                    linkDefault
                    linkStyle={Theme.link}
                    linkText={url => (url === 'mailto:forestwatcher@wri.org' ? 'forestwatcher@wri.org' : url)}
                  >
                    <Text style={styles.faqText} selectable>
                      {data.description}
                    </Text>
                  </Hyperlink>
                </View>
              </View>
            ))}

          {footerText && (
            <Hyperlink linkDefault linkStyle={Theme.link}>
              <Text style={styles.faqText} selectable>
                {footerText}
              </Text>
            </Hyperlink>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

FaqDetail.propTypes = {
  contentFaq: PropTypes.any,
  title: PropTypes.string.isRequired
};

export default FaqDetail;
