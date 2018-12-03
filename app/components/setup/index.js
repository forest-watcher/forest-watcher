// @flow

import React, { Component } from 'react';
import {
  View
} from 'react-native';
import { Navigation } from 'react-native-navigation';

import StepsSlider from 'components/common/steps-slider';
import SetupCountry from 'containers/setup/country';
import SetupBoundaries from 'containers/setup/boundaries';
import SetupOverView from 'containers/setup/overview';
import { withSafeArea } from 'react-native-safe-area';
import i18n from 'locales';
import Theme from 'config/theme';
import Header from './header';
import styles from './styles';

const SafeAreaView = withSafeArea(View, 'margin', 'vertical');

type Props = {
  componentId: string,
  logout: () => void,
  goBackDisabled: boolean
};

type State = {
  page: number,
  hideIndex: boolean
};

class Setup extends Component<Props, State> {
  static options(passProps) {
    return {
      topBar: {
        drawBehind: true,
        visible: false
      }
    };
  }

  state = {
    page: 0,
    hideIndex: false
  };

  onFinishSetup = () => {
    Navigation.setStackRoot(this.props.componentId, {
      component: {
        name: 'ForestWatcher.Dashboard'
      }
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

    // If we've just navigated to the map screen, hide the indexbar, otherwise show it.
    if (slide.i === 1) {
      this.hideIndex();
    } else {
      this.showIndex();
    }
  }

  goBack = () => {
    Navigation.pop(this.props.componentId);
  }

  hideIndex = () => this.setState({ hideIndex: true });

  showIndex = () => this.setState({ hideIndex: false });

  render() {
    const { page, hideIndex } = this.state;
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
