import React, { Component } from 'react';
import {
  View
} from 'react-native';

import StepsSlider from 'components/common/steps-slider';
import SetupCountry from 'containers/setup/country';
import SetupBoundaries from 'containers/setup/boundaries';
import SetupOverView from 'containers/setup/overview';
import I18n from 'locales';
import tracker from 'helpers/googleAnalytics';
import Header from './header';
import styles from './styles';

class Setup extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };

  constructor() {
    super();
    this.state = {
      page: 0
    };
  }

  componentWillMount() {
    this.props.initSetup();
  }

  componentDidMount() {
    tracker.trackScreenView('Set Up');
  }

  onFinishSetup = () => {
    this.props.navigator.resetTo({
      screen: 'ForestWatcher.Home'
    });
  }

  goToPrevPage = () => {
    this.setState((prevState) => ({
      page: prevState.page - 1
    }));
  }

  goToNextPage = () => {
    this.setState((prevState) => ({
      page: prevState.page + 1
    }));
  }

  updatePage = (slide) => {
    this.setState({
      page: slide.i
    });
  }

  goBack = () => {
    this.props.navigator.pop({
      animated: true
    });
  }

  render() {
    let showBack = true;
    if (this.props && this.props.goBackDisabled) {
      showBack = false;
    }

    const onBackPress = this.state.page === 0
      ? this.goBack
      : this.goToPrevPage;

    return (
      <View style={styles.container}>
        <Header
          title={I18n.t('commonText.setUp')}
          showBack={showBack || this.state.page > 0}
          onBackPress={onBackPress}
          prerenderingSiblingsNumber={this.slides}
        />
        <StepsSlider
          page={this.state.page}
          onChangeTab={this.updatePage}
        >
          <SetupCountry onNextPress={this.goToNextPage} />
          <SetupBoundaries onNextPress={this.goToNextPage} />
          <SetupOverView onNextPress={this.onFinishSetup} />
        </StepsSlider>
      </View>
    );
  }
}

Setup.propTypes = {
  navigator: React.PropTypes.object.isRequired,
  initSetup: React.PropTypes.func.isRequired,
  goBackDisabled: React.PropTypes.bool
};

Setup.navigationOptions = {
  header: {
    visible: false
  }
};

export default Setup;
