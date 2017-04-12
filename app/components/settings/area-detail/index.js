import React, { Component } from 'react';
import {
  Alert,
  View,
  Image
} from 'react-native';
import tracker from 'helpers/googleAnalytics';

import I18n from 'locales';
import LeftBtn from 'components/common/header/left-btn';
import Theme from 'config/theme';
import headerStyles from 'components/common/header/styles';
import ActionButton from 'components/common/action-button';
import styles from './styles';

class AreaDetail extends Component {
  componentDidMount() {
    tracker.trackScreenView('AreaDetail');
  }

  handleDeleteArea = () => {
    if (this.props.isConnected) {
      this.props.deleteArea(this.props.area.id);
      this.props.navigate('Settings');
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
    return (
      <View style={styles.area}>
        <View style={styles.imageContainer}>
          <Image style={styles.image} source={{ uri: imageUrl }} />
        </View>
        <View style={styles.buttonContainer}>
          <ActionButton onPress={this.handleDeleteArea} delete text={I18n.t('areaDetail.delete')} />
        </View>
      </View>
    );
  }
}

AreaDetail.propTypes = {
  imageUrl: React.PropTypes.string,
  deleteArea: React.PropTypes.func,
  isConnected: React.PropTypes.func,
  navigate: React.PropTypes.func,
  area: React.PropTypes.object
};

AreaDetail.navigationOptions = {
  header: ({ goBack }) => ({
    left: <LeftBtn goBack={goBack} />,
    tintColor: Theme.colors.color1,
    style: headerStyles.style,
    titleStyle: headerStyles.titleStyle,
    title: I18n.t('areaDetail.title')
  })
};

export default AreaDetail;
