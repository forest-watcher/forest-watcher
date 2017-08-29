import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  ActivityIndicator
} from 'react-native';
import Theme from 'config/theme';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';

class Home extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };

  componentWillMount() {
    this.props.startApp();
  }

  componentDidMount() {
    this.handleStatus();
    tracker.trackScreenView('Home');
  }

  // Override shouldComponentUpdate because setLanguage passed as prop always changes
  shouldComponentUpdate(nextProps) {
    const conditions = [
      this.props.loggedIn !== nextProps.loggedIn,
      this.props.syncFinished !== nextProps.syncFinished,
      this.props.hasAreas !== nextProps.hasAreas,
      this.props.token !== nextProps.token,
      this.props.syncSkip !== nextProps.syncSkip,
      this.props.syncModalOpen !== nextProps.syncModalOpen
    ];
    return conditions.includes(true);
  }

  componentDidUpdate() {
    this.handleStatus();
  }

  handleStatus() {
    const { loggedIn, token, hasAreas, syncFinished, syncSkip, setLanguage,
            navigator, syncModalOpen, setSyncModal } = this.props;
    setLanguage();
    if (loggedIn) {
      tracker.setUser(token);
      if (syncFinished || syncSkip) {
        if (!hasAreas) {
          navigator.resetTo({
            screen: 'ForestWatcher.Walkthrough',
            passProps: {
              goBackDisabled: true
            }
          });
        } else {
          navigator.resetTo({
            screen: 'ForestWatcher.Dashboard',
            title: 'Forest Watcher'
          });
        }
        if (syncSkip) {
          setSyncModal(false);
          navigator.dismissModal();
        }
      } else if (!syncFinished && !syncModalOpen) {
        this.openModal();
      }
    } else {
      navigator.resetTo({
        screen: 'ForestWatcher.Login'
      });
    }
  }

  openModal = () => {
    const { navigator, setSyncModal } = this.props;
    setSyncModal(true);
    navigator.showModal({
      screen: 'ForestWatcher.Sync',
      passProps: {
        goBackDisabled: true
      }
    });
  }

  render() {
    return (
      <View style={[styles.mainContainer, styles.center]}>
        <ActivityIndicator
          color={Theme.colors.color1}
          style={{ height: 80 }}
          size="large"
        />
      </View>
    );
  }
}
Home.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  token: PropTypes.string,
  syncSkip: PropTypes.bool.isRequired,
  syncFinished: PropTypes.bool.isRequired,
  setLanguage: PropTypes.func.isRequired,
  navigator: PropTypes.object.isRequired,
  hasAreas: PropTypes.bool.isRequired,
  syncModalOpen: PropTypes.bool.isRequired,
  setSyncModal: PropTypes.func.isRequired,
  startApp: PropTypes.func.isRequired
};
Home.navigationOptions = {
  header: {
    visible: false
  }
};
export default Home;
