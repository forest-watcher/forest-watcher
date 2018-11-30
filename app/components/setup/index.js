// @flow

import React, { Component } from 'react';
import {
  View
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import { APP_NAME } from 'config/constants';

import StepsSlider from 'components/common/steps-slider';
import SetupCountry from 'containers/setup/country';
import SetupBoundaries from 'containers/setup/boundaries';
import SetupOverView from 'containers/setup/overview';
import SafeArea, { withSafeArea, type SafeAreaInsets } from 'react-native-safe-area';
import i18n from 'locales';
import Theme from 'config/theme';
import Header from './header';
import styles from './styles';

const SafeAreaView = withSafeArea(View, 'margin', 'vertical');
const Timer = require('react-native-timer');

type Props = {
  navigator: Object,
  logout: () => void,
  goBackDisabled: boolean,
  closeModal: boolean
};

type State = {
  page: number,
  hideIndex: boolean
};

class Setup extends Component<Props, State> {
  static navigatorStyle = {
    navBarHidden: true
  };

  state = {
    page: 0,
    hideIndex: false
  };

  componentDidMount() {
    if (this.props.closeModal) {
      Timer.setTimeout(this, 'clearModal', Navigation.dismissAllModals, 1800);
    }

    SafeArea.getSafeAreaInsetsForRootView().then(result => {
      this.setState(state => ({
        bottomSafeAreaInset: result.safeAreaInsets.bottom
      }));
    });
  }

  componentWillUnmount() {
    Timer.clearTimeout(this, 'clearModal');
  }

  onFinishSetup = () => {
    this.props.navigator.resetTo({
      screen: 'ForestWatcher.Dashboard',
      title: APP_NAME
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

  updatePage = (slide: { i: number }) => {
    this.setState({
      page: slide.i
    });
  }

  goBack = () => {
    this.props.navigator.pop({
      animated: true
    });
  }

  hideIndex = () => this.setState({ hideIndex: true });

  showIndex = () => this.setState({ hideIndex: false });

  render() {
    const { page, hideIndex, bottomSafeAreaInset } = this.state;
    const showBack = !this.props.goBackDisabled || page > 0;
    const onBackPress = this.state.page === 0
      ? this.goBack
      : this.goToPrevPage;

    return (
      <View style={[page !== 1 ? styles.defaultHeader : styles.mapHeader, styles.container]}>
        <SafeAreaView style={styles.contentContainer}>
          <Header
            title={i18n.t('commonText.setup')}
            showBack={showBack}
            onBackPress={onBackPress}
            page={page}
            logout={this.props.logout}
            navigator={this.props.navigator}
          />
          <StepsSlider
            hideIndex={hideIndex}
            page={page}
            onChangeTab={this.updatePage}
          >
            <SetupCountry style={styles.slideContainer} onNextPress={this.goToNextPage} />
            <SetupBoundaries
              onNextPress={this.goToNextPage}
              style={styles.slideContainer}
            />
            <SetupOverView
              onNextPress={this.onFinishSetup}
              onTextFocus={this.hideIndex}
              onTextBlur={this.showIndex}
              style={styles.slideContainer}
            />
          </StepsSlider>
        </SafeAreaView>
      </View>
    );
  }
}

export default Setup;
