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

class TermsAndConditionsDetail extends Component {
  static navigatorStyle = {
    navBarTextColor: Theme.colors.color1,
    navBarButtonColor: Theme.colors.color1,
    topBarElevationShadowEnabled: false,
    navBarBackgroundColor: Theme.background.main
  };

  static propTypes = {
    contentTerm: PropTypes.any
  };

  state = {
    description: this.props.contentTerm.description,
    list: this.props.contentTerm.list
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
          style={styles.terms}
        >

          {this.state.description && <Hyperlink
            linkDefault linkStyle={{ color: '#97be32' }}
            linkText={(url) => (url === 'mailto:gfw@wri.org' ? 'gfw@wri.org' : url)}
          >
            <Text style={styles.termsText}>{this.state.description}</Text>
          </Hyperlink>}

          {this.state.list && this.state.list.map((data, key) => (
            <View
              key={key}
              style={this.state.description ? styles.termsListNoPadding : styles.termsList}
            >
              <Text style={styles.termsText}>{String.fromCharCode(97 + (key % 27))}. </Text>
              <Text style={styles.termsText}>{data.text}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    );
  }
}

export default TermsAndConditionsDetail;
