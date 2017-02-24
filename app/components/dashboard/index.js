import React, { Component } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableHighlight
} from 'react-native';
import Theme from 'config/theme';
import I18n from 'locales';
import tracker from 'helpers/googleAnalytics';
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
    section: 'NewReport',
    image: ''
  },
  {
    title: I18n.t('dashboard.myReports'),
    section: 'Reports',
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
    if (item.section === 'Alerts') {
      tracker.trackEvent('Alerts', 'Open Alerts', { label: '', value: 0 });
    }
    if (item.section && item.section.length > 0) {
      if (item.section === 'NewReport') {
        const form = `New-report-${Math.floor(Math.random() * 1000)}`;
        this.props.createReport(form);
        this.props.navigate(item.section, { form });
      } else {
        this.props.navigate(item.section);
      }
    }
  }

  componentDidMount() {
    tracker.trackScreenView('DashBoard');
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
  navigate: React.PropTypes.func.isRequired,
  createReport: React.PropTypes.func.isRequired
};

Dashboard.navigationOptions = {
  header: {
    title: I18n.t('commonText.appName').toUpperCase(),
    tintColor: Theme.colors.color1
  }
};

export default Dashboard;
