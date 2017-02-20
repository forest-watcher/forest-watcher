import React, { Component } from 'react';
import {
  View,
  TouchableHighlight,
  ScrollView,
  Text
} from 'react-native';

import LeftBtn from 'components/common/header/left-btn';
import AlertsList from 'containers/alerts/list';
import I18n from 'locales';
import Theme from 'config/theme';
import styles from './styles';


class Alerts extends Component {
  componentDidMount() {
    this.props.fetchData();
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
                <TouchableHighlight
                  activeOpacity={1}
                  underlayColor="transparent"
                >
                  <Text style={styles.areaMore}>SEE ALL</Text>
                </TouchableHighlight>
              </View>
              <ScrollView
                style={styles.list}
                contentContainerStyle={styles.alerts}
                horizontal
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                alwaysBounceVertical={false}
              >
                <AlertsList areaId={area.id} />
              </ScrollView>
            </View>
          );
        }
        )}
      </ScrollView>


    );
  }
}

Alerts.propTypes = {
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
