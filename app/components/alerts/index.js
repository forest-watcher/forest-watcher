import React, { Component } from 'react';
import {
  View,
  ScrollView,
  Text
} from 'react-native';

import LeftBtn from 'components/common/header/left-btn';
import AlertsList from 'containers/alerts/list';
import Theme from 'config/theme';
import styles from './styles';


class Alerts extends Component {
  componentDidMount() {
    this.props.fetchData();
  }

  onPress = (params) => {
    this.props.navigate('Map', {
      features: params.coordinates,
      center: params.center,
      geojson: params.geojson,
      title: params.areaName
    });
  }

  render() {
    const { areas } = this.props;
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {areas.map((data, areaKey) => {
          const area = data.attributes;
          area.id = data.id;

          return (
            <View key={`area-${areaKey}`}>
              <View style={styles.area}>
                <Text style={styles.areaTitle}>{area.name}</Text>
              </View>
              <AlertsList onPress={this.onPress} areaId={area.id} areaName={area.name} />
            </View>
          );
        }
        )}
      </ScrollView>


    );
  }
}

Alerts.propTypes = {
  navigate: React.PropTypes.func.isRequired,
  fetchData: React.PropTypes.func.isRequired,
  areas: React.PropTypes.array
};

Alerts.navigationOptions = {
  header: ({ goBack }) => ({
    left: <LeftBtn goBack={goBack} />,
    tintColor: Theme.colors.color1,
    style: {
      paddingLeft: 8,
      paddingRight: 8,
      backgroundColor: Theme.background.main
    },
    titleStyle: {
      textAlign: 'left',
      fontFamily: Theme.font,
      fontSize: 21,
      fontWeight: '400',
      height: 28
    },
    title: 'Alerts'
  })
};

export default Alerts;
