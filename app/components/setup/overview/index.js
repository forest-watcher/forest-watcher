import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import Theme from 'config/theme';
import ActionButton from 'components/common/action-button';
import I18n from 'locales';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';

const editImage = require('assets/edit.png');

class SetupOverview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.area.wdpaName || '',
      saving: false
    };
  }

  componentDidMount() {
    tracker.trackScreenView('Overview Set Up');
  }

  componentWillReceiveProps(nextProps) {
    this.props = nextProps;
    if (this.props.areaSaved) {
      this.onAreaSaved();
    }
  }

  onAreaSaved() {
    this.props.onNextPress();
  }

  onNextPress = async () => {
    this.setState({ saving: true });

    const params = {
      area: {
        name: this.state.name,
        ...this.props.area
      },
      userid: this.props.user.id,
      snapshot: this.props.snapshot
    };
    this.props.saveArea(params);
  }

  textChange = (name) => {
    this.setState({ name });
  }

  render() {
    let btnEnabled = true;
    let btnText = I18n.t('commonText.finish');
    if (!this.state.name) {
      btnEnabled = false;
    } else if (this.state.saving) {
      btnEnabled = false;
      btnText = I18n.t('commonText.saving');
    }
    return (
      <KeyboardAwareScrollView>
        <View style={styles.container}>
          <View style={styles.selector}>
            <Text style={styles.selectorLabel}>{I18n.t('setupOverview.areaName')}</Text>
            <ScrollView scrollEnabled={false} style={styles.scrollContainImage} >
              {this.props.snapshot !== '' &&
                <Image style={styles.image} source={{ uri: this.props.snapshot }} />
              }
            </ScrollView>
            <View style={styles.searchContainer}>
              <TextInput
                ref={(ref) => { this.input = ref; }}
                autoFocus={false}
                autoCorrect={false}
                autoCapitalize="none"
                value={this.state.name}
                keyboardType="default"
                placeholder={I18n.t('setupOverview.placeholder')}
                style={styles.searchInput}
                onChangeText={this.textChange}
                onFocus={this.props.onTextFocus}
                onBlur={this.props.onTextBlur}
                underlineColorAndroid="transparent"
                selectionColor={Theme.colors.color1}
                placeholderTextColor={Theme.fontColors.light}
              />
              <Image
                style={Theme.icon}
                source={editImage}
                onPress={() => this.input.focus()}
              />
            </View>
          </View>
          <ScrollView style={styles.scrollContainButton}>
            <ActionButton
              style={styles.buttonPos}
              disabled={!btnEnabled}
              onPress={this.onNextPress}
              text={btnText.toUpperCase()}
            />
          </ScrollView>
        </View>
      </KeyboardAwareScrollView>
    );
  }
}

SetupOverview.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    token: PropTypes.string.isRequired
  }).isRequired,
  area: PropTypes.object.isRequired,
  areaSaved: PropTypes.bool.isRequired,
  snapshot: PropTypes.string.isRequired,
  saveArea: PropTypes.func.isRequired,
  onNextPress: PropTypes.func.isRequired,
  onTextFocus: PropTypes.func,
  onTextBlur: PropTypes.func
};

export default SetupOverview;
