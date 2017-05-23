import React, { Component } from 'react';
import {
  Alert,
  View,
  Image,
  ScrollView,
  Text
} from 'react-native';
import tracker from 'helpers/googleAnalytics';

import I18n from 'locales';
import Theme from 'config/theme';
import TextInput from 'components/common/text-input';
import ActionButton from 'components/common/action-button';
import AlertSystem from 'containers/settings/area-detail/alert-system';
import styles from './styles';

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
      name: props.area.attributes.name
    };
  }

  componentDidMount() {
    tracker.trackScreenView('AreaDetail');
  }

  onNameChange = (name) => {
    this.setState({ name });
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
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.title}>{I18n.t('commonText.name')}</Text>
          <TextInput value={this.state.name} onChangeText={this.onNameChange} />
        </View>
        <View style={styles.section}>
          <Text style={styles.title}>{I18n.t('commonText.boundaries')}</Text>
          <View style={styles.imageContainer}>
            <Image style={styles.image} source={{ uri: imageUrl || 'placeholder.png' }} />
          </View>
        </View>
        <View style={styles.section}>
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
  deleteArea: React.PropTypes.func,
  isConnected: React.PropTypes.func,
  navigator: React.PropTypes.object,
  area: React.PropTypes.object
};

export default AreaDetail;
