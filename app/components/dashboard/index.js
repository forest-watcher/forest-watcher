import React, { PureComponent } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableHighlight,
  Platform
} from 'react-native';

import myAlertIcon from 'assets/section_my_alerts.png';
import myReportsIcon from 'assets/section_my_reports.png';
import Theme from 'config/theme';
import I18n from 'locales';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';

const settingsIcon = require('assets/settings.png');

const { RNLocation: Location } = require('NativeModules'); // eslint-disable-line

const sections = [
  // TEMP
  {
    title: I18n.t('dashboard.map'),
    section: 'Map',
    image: myAlertIcon
  },
  {
    title: I18n.t('dashboard.myReports'),
    section: 'Reports',
    image: myReportsIcon
  },
  {
    title: I18n.t('dashboard.dailyFeedback'),
    section: 'DailyFeedback',
    image: null
  },
  {
    title: I18n.t('dashboard.weeklyFeedback'),
    section: 'WeeklyFeedback',
    image: null
  }
];

class Dashboard extends PureComponent {
  static navigatorStyle = {
    navBarTextColor: Theme.colors.color1,
    topBarElevationShadowEnabled: false,
    navBarBackgroundColor: Theme.background.main,
    navBarTitleTextCentered: true
  };

  static navigatorButtons = {
    rightButtons: [
      {
        icon: settingsIcon,
        id: 'settings'
      }
    ]
  };

  constructor(props) {
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  componentDidMount() {
    if (Platform.OS === 'ios') {
      Location.requestAlwaysAuthorization();
    }
    tracker.trackScreenView('DashBoard');
  }

  onNavigatorEvent(event) {
    const { actionsPending, syncModalOpen, syncSkip } = this.props;
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'settings') {
        this.props.navigator.push({
          screen: 'ForestWatcher.Settings',
          title: 'Settings'
        });
      }
    } else if (event.id === 'didAppear') {
      if (actionsPending > 0 && !syncModalOpen && !syncSkip && !this.syncModalOpen) {
        this.syncModalOpen = true;
        this.props.setSyncModal(true);
        this.props.navigator.showModal({
          screen: 'ForestWatcher.Sync',
          passProps: {
            goBackDisabled: true
          }
        });
      }
    }
  }

  onItemTap(item) {
    if (item.section === 'Alerts') {
      tracker.trackEvent('Alerts', 'Open Alerts', { label: '', value: 0 });
    }
    if (item.section && item.section.length > 0) {
      switch (item.section) {
        case 'DailyFeedback': {
          const screen = 'ForestWatcher.Feedback';
          const title = 'Feedback';
          this.props.navigator.push({
            screen,
            title,
            passProps: {
              title,
              screen,
              form: 'daily',
              disableDraft: true
            }
          });
          break;
        }
        case 'WeeklyFeedback': {
          const screen = 'ForestWatcher.Feedback';
          const title = 'Feedback';
          this.props.navigator.push({
            screen,
            title,
            passProps: {
              title,
              screen,
              form: 'weekly',
              disableDraft: true
            }
          });
          break;
        }
        default:
          this.props.navigator.push({
            screen: `ForestWatcher.${item.section}`,
            title: item.title
          });
          break;
      }
    }
  }

  render() {
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
                style={item.section === 'DailyFeedback' || item.section === 'WeeklyFeedback' ? [styles.buttonRound] : [styles.item]}
                key={key}
                onPress={() => this.onItemTap(item)}
                activeOpacity={0.5}
                underlayColor="#FFFFFF"
              >
                <View style={item.section === 'DailyFeedback' || item.section === 'WeeklyFeedback' ? null : [styles.imageIcon]}>

                  {item.image &&
                    <Image
                      style={styles.logo}
                      source={item.image}
                    />
                  }
                  <Text style={item.section === 'DailyFeedback' || item.section === 'WeeklyFeedback' ? [styles.buttonTextRound] : null}>
                    {item.title}
                  </Text>
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
  navigator: React.PropTypes.object.isRequired,
  actionsPending: React.PropTypes.number.isRequired,
  syncModalOpen: React.PropTypes.bool.isRequired,
  syncSkip: React.PropTypes.bool.isRequired,
  setSyncModal: React.PropTypes.func.isRequired
};

export default Dashboard;
