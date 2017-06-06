import React, { Component } from 'react';
import {
  Alert,
  View,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableHighlight
} from 'react-native';
import tracker from 'helpers/googleAnalytics';

import I18n from 'locales';
import Theme from 'config/theme';
import ActionButton from 'components/common/action-button';
import AlertSystem from 'containers/settings/area-detail/alert-system';
import styles from './styles';

const editIcon = require('assets/edit.png');

class AreaDetail extends Component {
  static navigatorStyle = {
    navBarTextColor: Theme.colors.color1,
    navBarButtonColor: Theme.colors.color1,
    topBarElevationShadowEnabled: false,
    navBarBackgroundColor: Theme.background.main
  };

  constructor(props) {
    super();
    this.state = {
      name: props.area.name,
      editingName: false
    };
  }

  componentDidMount() {
    tracker.trackScreenView('AreaDetail');
  }

  onEditPress = () => {
    this.setState({ editingName: true });
  }

  onNameChange = (name) => {
    this.setState({ name });
  }

  onNameSubmit = (ev) => {
    const name = ev.nativeEvent.text;
    this.setState({ name, editingName: false });
    if (name.length > 0) {
      const updatedArea = { ...this.props.area };
      updatedArea.name = name;
      this.props.updateArea(updatedArea);
      this.replaceRouteTitle(updatedArea.name);
    } else {
      // TODO: warn user empty area name
    }
  }

  replaceRouteTitle = (name) => {
    this.props.navigator.setTitle({
      title: name
    });
  }

  handleDeleteArea = () => {
    if (this.props.isConnected) {
      this.props.deleteArea(this.props.area.id);
      this.props.navigator.pop({
        animated: true
      });
    } else {
      Alert.alert(
        I18n.t('commonText.connectionRequiredTitle'),
        I18n.t('commonText.connectionRequired'),
        [{ text: 'OK' }],
        { cancelable: false }
      );
    }
  }

  render() {
    const imageUrl = this.props.imageUrl !== undefined ? this.props.imageUrl : null;
    const { area } = this.props;

    if (!area) return null;
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View>
          <Text style={styles.title}>{I18n.t('commonText.name')}</Text>
          {!this.state.editingName ?
            <View style={styles.section}>
              <Text style={styles.name}>
                {this.state.name}
              </Text>
              <TouchableHighlight
                activeOpacity={0.5}
                underlayColor="transparent"
                onPress={this.onEditPress}
              >
                <Image style={Theme.icon} source={editIcon} />
              </TouchableHighlight>
            </View>
            : <View style={styles.section}>
              <TextInput
                autoFocus
                autoCorrect={false}
                multiline={false}
                style={styles.input}
                autoCapitalize="none"
                value={this.state.name !== null ? this.state.name : this.props.area.name}
                onChangeText={this.onNameChange}
                onSubmitEditing={this.onNameSubmit}
                onBlur={this.onNameSubmit}
                underlineColorAndroid="transparent"
                selectionColor={Theme.colors.color1}
                placeholderTextColor={Theme.fontColors.light}
              />
            </View>
          }
        </View>
        <View style={styles.row}>
          <Text style={styles.title}>{I18n.t('commonText.boundaries')}</Text>
          <View style={styles.imageContainer}>
            <Image style={styles.image} source={{ uri: imageUrl || 'placeholder.png' }} />
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.title}>{I18n.t('alerts.alertSystems')}</Text>
          <AlertSystem areaId={area.id} />
        </View>
        <View style={styles.buttonContainer}>
          <ActionButton onPress={this.handleDeleteArea} delete text={I18n.t('areaDetail.delete')} />
        </View>
      </ScrollView>
    );
  }
}

AreaDetail.propTypes = {
  imageUrl: React.PropTypes.string,
  updateArea: React.PropTypes.func,
  deleteArea: React.PropTypes.func,
  isConnected: React.PropTypes.bool.isRequired,
  navigator: React.PropTypes.object,
  area: React.PropTypes.object
};

export default AreaDetail;
