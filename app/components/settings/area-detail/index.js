import React, { Component } from 'react';
import {
  View,
  Text,
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
  constructor() {
    super();
  }

  componentDidMount() {
    // this.props.fetchData();
    const { state } = this.props.navigation;
    console.log(state)
    tracker.trackScreenView('AreaDetail');
  }

  handleDeleteArea = () => {
    console.log( this.props);
    if (this.props.isConnected) {
      this.props.deleteArea(this.props.area.id);
      this.props.navigate('Settings');
    } else {
      // TODO: Alert no connection in modal
    }
  }

  render() {
    const imageUrl = this.props.imageUrl !== undefined ? this.props.imageUrl : null;
    console.log('imageUrl', imageUrl)
    return (
      <View style={styles.area}>
        <Text style={styles.areaTitle}>Hello area detail</Text>
        <View style={styles.imageContainer}>
          <Image style={styles.image} source={{ uri: imageUrl }} />
        </View>
        <ActionButton onPress={this.handleDeleteArea} error={true} text={I18n.t('commonText.delete')}/>
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
