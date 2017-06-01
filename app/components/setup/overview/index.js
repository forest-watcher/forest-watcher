import React, { Component } from 'react';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput
} from 'react-native';

import Theme from 'config/theme';
import ActionButton from 'components/common/action-button';
import I18n from 'locales';
import tracker from 'helpers/googleAnalytics';
import { getCoverageDataByGeostore, getInitialDatasets } from 'helpers/area';
import styles from './styles';

const editImage = require('assets/edit.png');

class SetupOverview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.area.wdpaName || '',
      saving: false,
      gettingDatasets: false
    };
  }

  componentDidMount() {
    tracker.trackScreenView('Overview Set Up');
  }

  componentWillReceiveProps(nextProps) {
    this.props = nextProps;
    if (this.props.areaSaved && !this.state.gettingDatasets) {
      this.onAreaSaved();
    }
  }

  onAreaSaved() {
    this.props.onNextPress();
  }

  onNextPress = async () => {
    this.setState({ gettingDatasets: true });
    const { area, user } = this.props;
    let coverage = [];

    try {
      coverage = await getCoverageDataByGeostore(area.geostore, user.token);
    } catch (e) {
      console.warn('Coverage request error', e);
    }
    const datasets = getInitialDatasets(coverage);
    const params = {
      area: {
        name: this.state.name,
        ...this.props.area
      },
      userid: this.props.user.id,
      snapshot: this.props.snapshot,
      datasets
    };
    this.setState({ saving: true, gettingDatasets: false });
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
    } else if (this.state.gettingDatasets) {
      btnEnabled = false;
      btnText = I18n.t('setupOverview.gettingDatasets');
    }
    return (
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
          <KeyboardSpacer />
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
    );
  }
}

SetupOverview.propTypes = {
  user: React.PropTypes.shape({
    id: React.PropTypes.string.isRequired,
    token: React.PropTypes.string.isRequired
  }).isRequired,
  area: React.PropTypes.object.isRequired,
  areaSaved: React.PropTypes.bool.isRequired,
  snapshot: React.PropTypes.string.isRequired,
  saveArea: React.PropTypes.func.isRequired,
  onNextPress: React.PropTypes.func.isRequired
};

export default SetupOverview;
