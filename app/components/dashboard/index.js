import React, { Component } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableHighlight,
  Platform
} from 'react-native';
import Theme from 'config/theme';
import I18n from 'locales';
import styles from './styles';

const { RNLocation: Location } = require('NativeModules');

const sections = [
  // TEMP
  {
    title: 'Settings',
    section: 'Settings',
    image: ''
  },
  {
    title: I18n.t('dashboard.alerts'),
    section: 'Alerts',
    image: ''
  },
  {
    title: I18n.t('dashboard.reports'),
    section: 'NewReport',
    image: ''
  },
  {
    title: I18n.t('dashboard.uploadData'),
    section: '',
    image: ''
  }
];

class Dashboard extends Component {
  componentDidMount() {
    if (Platform.os === 'ios') {
      Location.requestAlwaysAuthorization();
    }
  }

  onItemTap(item) {
    if (item.section && item.section.length > 0) {
      this.props.navigate(item.section);
    }
  }

  render() {
    // <TouchableHighlight
    //   style={styles.iconSettings}
    //   onPress={() => this.onItemTap(item)}
    //   activeOpacity={0.5}
    //   underlayColor="transparent"
    // >
    //   <Image
    //     source={require('assets/settings/settings.png')}
    //   />
    // </TouchableHighlight>

    return (
      <View style={styles.container}>

        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.content}
          scrollEnabled={false}
        >
          {sections.map((item, key) =>
            (
              <TouchableHighlight
                style={styles.item}
                key={key}
                onPress={() => this.onItemTap(item)}
                activeOpacity={0.5}
                underlayColor="transparent"
              >
                <Text>{item.title}</Text>
              </TouchableHighlight>
            )
          )}
        </ScrollView>
      </View>
    );
  }
}

Dashboard.propTypes = {
  navigate: React.PropTypes.func.isRequired
};

Dashboard.navigationOptions = {
  header: {
    title: I18n.t('commonText.appName').toUpperCase(),
    tintColor: Theme.colors.color1
  }
};

export default Dashboard;
