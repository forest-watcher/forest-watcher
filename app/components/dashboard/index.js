import React, { Component } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableHighlight,
  ActivityIndicator
} from 'react-native';
import I18n from 'locales';
import styles from './styles';

const sections = [
  {
    title: I18n.t('dashboard.alerts'),
    section: 'alerts',
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

function renderLoading() {
  return (
    <View style={[styles.container, styles.center]}>
      <ActivityIndicator
        style={{ height: 80 }}
        size="large"
      />
    </View>
  );
}

class Dashboard extends Component {
  constructor() {
    super();

    this.state = {
      loading: true
    };
  }

  componentDidMount() {
    this.props.onToggleHeader({
      header: false
    });
    this.checkSetup();
  }

  componentWillReceiveProps(props) {
    if (props.loggedIn) {
      this.props.onToggleHeader({
        header: true
      });
      this.setState({ loading: false });
    }
  }

  onItemTap(item) {
    if (item.section && item.section.length > 0) {
      this.props.navigate({
        type: 'push',
        key: item.section,
        section: item.section
      });
    }
  }

  checkSetup() {
    if (!this.props.loggedIn) {
      this.props.setLoginModal(true);
    } else {
      this.setState({ loading: false });
    }
  }

  render() {
    return (
      this.state.loading
        ? renderLoading()
        : <View style={styles.container}>
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
  navigate: React.PropTypes.func.isRequired,
  setLoginModal: React.PropTypes.func.isRequired,
  onToggleHeader: React.PropTypes.func.isRequired,
  loggedIn: React.PropTypes.bool.isRequired
};

export default Dashboard;
