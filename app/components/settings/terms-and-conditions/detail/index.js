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

function TermsAndConditionsDetail(props) {
  const { description, list } = props.contentTerm;
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.containerContent}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >

      <View
        style={styles.terms}
      >

        {description && <Hyperlink
          linkDefault linkStyle={{ color: '#97be32' }}
          linkText={(url) => (url === 'mailto:gfw@wri.org' ? 'gfw@wri.org' : url)}
        >
          <Text style={styles.termsText}>{description}</Text>
        </Hyperlink>}

        {list && list.map((data, key) => (
          <View
            key={key}
            style={description ? styles.termsListNoPadding : styles.termsList}
          >
            <Text style={styles.termsText}>{String.fromCharCode(97 + (key % 27))}. </Text>
            <Text style={styles.termsText}>{data.text}</Text>
          </View>
        ))}
      </View>

    </ScrollView>
  );
}

TermsAndConditionsDetail.navigatorStyle = {
  navBarTextColor: Theme.colors.color1,
  navBarButtonColor: Theme.colors.color1,
  topBarElevationShadowEnabled: false,
  navBarBackgroundColor: Theme.background.main
};

TermsAndConditionsDetail.propTypes = {
  contentTerm: PropTypes.object.isRequired
};

export default TermsAndConditionsDetail;
