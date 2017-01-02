import React, { Component } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableHighlight
} from 'react-native';
import I18n from 'locales';
import styles from './styles';

const sections = [
  {
    title: I18n.t('dashboard.alerts'),
    section: '',
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
      this.props.onNavigate({
        type: 'push',
        key: item.section,
        section: item.section
      });
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.content}
        >
          {sections.map((item, key) =>
            (
              <TouchableHighlight
                key={key}
                onPress={() => this.onItemTap(item)}
                activeOpacity={0.5}
                underlayColor="transparent"
              >
                <View style={styles.item}>
                  <View style={styles.icon} />
                  <Text style={styles.title}>{item.title}</Text>
                </View>
              </TouchableHighlight>
            )
          )}
        </ScrollView>
      </View>
    );
  }
}

Dashboard.propTypes = {
  onNavigate: React.PropTypes.func.isRequired
};

export default Dashboard;
