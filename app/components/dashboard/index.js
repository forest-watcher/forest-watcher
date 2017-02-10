import React, { Component } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableHighlight,
  Image
} from 'react-native';
import I18n from 'locales';
import styles from './styles';

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
    section: '',
    image: ''
  },
  {
    title: I18n.t('dashboard.uploadData'),
    section: '',
    image: ''
  },
  {
    title: I18n.t('dashboard.map'),
    section: 'map',
    image: ''
  }
];

class Dashboard extends Component {
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

export default Dashboard;
