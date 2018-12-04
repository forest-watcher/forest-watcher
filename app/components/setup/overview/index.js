import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Text, Image, ScrollView, TextInput } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Navigation } from 'react-native-navigation';

import Theme from 'config/theme';
import ActionButton from 'components/common/action-button';
import i18n from 'locales';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';

const editImage = require('assets/edit.png');

class SetupOverview extends Component {
  static options(passProps) {
    return {
      topBar: {
        title: {
          text: i18n.t('commonText.setup')
        }
      }
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      name: this.props.area ? this.props.area.name : ''
    };
  }

  componentDidMount() {
    tracker.trackScreenView('Overview Set Up');
  }

  onNextPress = async () => {
    const params = {
      area: {
        name: this.state.name,
        ...this.props.area
      },
      snapshot: this.props.snapshot
    };
    this.props.setSetupArea(params);
    this.props.saveArea(params);
    Navigation.setStackRoot(this.props.componentId, {
      component: {
        name: 'ForestWatcher.Dashboard'
      }
    });
  };

  textChange = name => {
    this.setState({ name });
  };

  render() {
    let btnEnabled = true;
    let btnText = i18n.t('commonText.finish');
    if (!this.state.name) {
      btnEnabled = false;
    } else if (this.state.saving) {
      btnEnabled = false;
      btnText = i18n.t('commonText.saving');
    }
    return (
      <KeyboardAwareScrollView>
        <View style={styles.container}>
          <View style={styles.selector}>
            <Text style={styles.selectorLabel}>{i18n.t('setupOverview.areaName')}</Text>
            <ScrollView scrollEnabled={false} style={styles.scrollContainImage}>
              {this.props.snapshot !== '' && <Image resizeMode="cover" style={styles.image} source={{ uri: this.props.snapshot }} />}
            </ScrollView>
            <View style={styles.searchContainer}>
              <TextInput
                ref={ref => {
                  this.input = ref;
                }}
                autoFocus={false}
                autoCorrect={false}
                autoCapitalize="none"
                value={this.state.name}
                keyboardType="default"
                placeholder={i18n.t('setupOverview.placeholder')}
                style={styles.searchInput}
                onChangeText={this.textChange}
                onFocus={this.props.onTextFocus}
                onBlur={this.props.onTextBlur}
                underlineColorAndroid="transparent"
                selectionColor={Theme.colors.color1}
                placeholderTextColor={Theme.fontColors.light}
              />
              <Image style={Theme.icon} source={editImage} onPress={() => this.input.focus()} />
            </View>
          </View>
          <ScrollView style={styles.scrollContainButton}>
            <ActionButton style={styles.buttonPos} disabled={!btnEnabled} onPress={this.onNextPress} text={btnText.toUpperCase()} />
          </ScrollView>
        </View>
      </KeyboardAwareScrollView>
    );
  }
}

SetupOverview.propTypes = {
  area: PropTypes.object.isRequired,
  snapshot: PropTypes.string.isRequired,
  saveArea: PropTypes.func.isRequired,
  setSetupArea: PropTypes.func.isRequired,
  onTextFocus: PropTypes.func,
  onTextBlur: PropTypes.func
};

export default SetupOverview;
