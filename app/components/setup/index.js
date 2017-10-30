import React, { Component } from 'react';
import PropTypes from 'prop-types';
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

  static propTypes = {
    navigator: PropTypes.object.isRequired,
    setShowLegend: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired,
    initSetup: PropTypes.func.isRequired,
    goBackDisabled: PropTypes.bool
  };

  state = {
    page: 0
  };

  componentWillMount() {
    this.props.initSetup();
  }

  componentDidMount() {
    tracker.trackScreenView('Set Up');
  }

  onFinishSetup = () => {
    this.props.navigator.resetTo({
      screen: 'ForestWatcher.Dashboard',
      title: 'Forest Watcher'
    });
  }

  goToPrevPage = () => {
    this.setState((prevState) => ({
      page: prevState.page - 1
    }));
  }

  goToNextPage = () => this.setState((prevState) => ({
    page: prevState.page + 1
  }));

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
    const { page } = this.state;
    const showBack = !this.props.goBackDisabled || page > 0;
    const onBackPress = this.state.page === 0
      ? this.goBack
      : this.goToPrevPage;

    return (
      <View style={page !== 1 ? styles.defaultHeader : styles.mapHeader}>
        <Header
          title={I18n.t('commonText.setUp')}
          showBack={showBack}
          onBackPress={onBackPress}
          prerenderingSiblingsNumber={this.slides}
          page={page}
          setShowLegend={this.props.setShowLegend}
          logout={this.props.logout}
          navigator={this.props.navigator}
        />
        <StepsSlider
          page={this.state.page}
          onChangeTab={this.updatePage}
        >
          <SetupCountry onNextPress={this.goToNextPage} />
          <SetupBoundaries
            onNextPress={this.goToNextPage}
          />
          <SetupOverView onNextPress={this.onFinishSetup} />
        </StepsSlider>
      </View>
    );
  }
}

export default Setup;
