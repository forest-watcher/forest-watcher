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

class TermsAndConditionsDetail extends Component {
  static navigatorStyle = {
    navBarTextColor: Theme.colors.color1,
    navBarButtonColor: Theme.colors.color1,
    topBarElevationShadowEnabled: false,
    navBarBackgroundColor: Theme.background.main
  };

  static propTypes = {
    contentTerm: PropTypes.any,
    descriptionTerm: PropTypes.any
  };

  constructor(props) {
    super();
    this.state = {
      content: props.contentTerm,
      description: props.descriptionTerm
    };
  }

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
          style={styles.terms}
        >
          <Text style={this.state.description === '' ? styles.termsTextNone : styles.termsText}>{this.state.description}</Text>
          {this.state.content !== null ? this.state.content.map((data, key) => (
            <View
              key={key}
              style={this.state.description === '' ? styles.termsListNoPadding : styles.termsList}
            >
              <Text style={styles.termsText}>{String.fromCharCode(97 + (key % 27))}. </Text>
              <Text style={styles.termsText}>{data.text}</Text>
            </View>
          )) : <Text style={styles.termsText}>{}</Text> }
        </View>

      </ScrollView>
    );
  }
}

export default TermsAndConditionsDetail;
