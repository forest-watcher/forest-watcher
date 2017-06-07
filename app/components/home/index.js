import React, { Component } from 'react';
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

  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false
    };
  }

  componentDidMount() {
    this.handleStatus();
    tracker.trackScreenView('Home');
  }

  // Override shouldComponentUpdate because setLanguage passed as prop always changes
  shouldComponentUpdate(nextProps, nextState) {
    const conditions = [
      this.props.loggedIn !== nextProps.loggedIn,
      this.props.readyState !== nextProps.readyState,
      this.props.hasAreas !== nextProps.hasAreas,
      this.props.token !== nextProps.token,
      this.state.modalOpen !== nextState.modalOpen
    ];
    return conditions.includes(true);
  }

  componentDidUpdate() {
    this.handleStatus();
  }

  handleStatus() {
    const { loggedIn, token, hasAreas, readyState, setLanguage, navigator } = this.props;
    setLanguage();
    if (loggedIn) {
      tracker.setUser(token);
      if (!readyState && !this.state.modalOpen) {
        this.setState({ modalOpen: true }, this.openModal);
      } else if (readyState) {
        if (!hasAreas) {
          navigator.resetTo({
            screen: 'ForestWatcher.Setup',
            title: 'Set up',
            passProps: {
              goBackDisabled: true
            }
          });
        } else {
          navigator.resetTo({
            screen: 'ForestWatcher.Dashboard',
            title: 'FOREST WATCHER'
          });
        }
      }
    } else { // eslint-disable-line
      navigator.resetTo({
        screen: 'ForestWatcher.Login'
      });
    }
  }

  openModal = () => {
    const { navigator } = this.props;
    navigator.showModal({
      screen: 'ForestWatcher.Sync',
      passProps: {
        navigator,
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
  loggedIn: React.PropTypes.bool.isRequired,
  token: React.PropTypes.string,
  readyState: React.PropTypes.bool.isRequired,
  setLanguage: React.PropTypes.func.isRequired,
  navigator: React.PropTypes.object.isRequired,
  hasAreas: React.PropTypes.bool.isRequired
};
Home.navigationOptions = {
  header: {
    visible: false
  }
};
export default Home;
