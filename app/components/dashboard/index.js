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
import headerStyles from 'components/common/header/styles';
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
    title: I18n.t('dashboard.myReports'),
    section: 'Reports',
    image: ''
  },
  {
    title: I18n.t('dashboard.dailyFeedback'),
    section: 'DailyFeedback',
    image: ''
  },
  {
    title: I18n.t('dashboard.weeklyFeedback'),
    section: 'WeeklyFeedback',
    image: ''
  }
];

class Dashboard extends Component {
  componentDidMount() {
    if (Platform.OS === 'ios') {
      Location.requestAlwaysAuthorization();
    }
  }

  onItemTap(item) {
    if (item.section && item.section.length > 0) {
      switch (item.section) {
        case 'NewReport': {
          const form = `New-report-${Math.floor(Math.random() * 1000)}`;
          this.props.createReport(form);
          this.props.navigate(item.section, { form });
          break;
        }
        case 'DailyFeedback': {
          this.props.navigate('Feedback', { feedback: 'daily' });
          break;
        }
        case 'WeeklyFeedback': {
          this.props.navigate('Feedback', { feedback: 'weekly' });
          break;
        }
        default:
          this.props.navigate(item.section);
          break;
      }
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
  navigate: React.PropTypes.func.isRequired,
  createReport: React.PropTypes.func.isRequired
};

Dashboard.navigationOptions = {
  header: {
    tintColor: Theme.colors.color1,
    style: headerStyles.style,
    titleStyle: [headerStyles.titleStyle, headerStyles.center, headerStyles.large],
    title: I18n.t('commonText.appName').toUpperCase()
  }
};

export default Dashboard;
