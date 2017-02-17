import React, { Component } from 'react';
import {
  View
} from 'react-native';

import StepsSlider from 'components/common/steps-slider';
import SetupCountry from 'containers/setup/country';
import SetupBoundaries from 'containers/setup/boundaries';
import SetupOverView from 'containers/setup/overview';
import I18n from 'locales';
import Header from './header';
import styles from './styles';

class Setup extends Component {
  constructor() {
    super();
    this.state = {
      page: 0
    };
  }

  componentWillMount() {
    this.props.initSetup();
  }

  updatePage = (slide) => {
    this.setState({
      page: slide.i
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

  render() {
    const { params } = this.props.navigation.state;
    let showBack = true;
    if (params && params.goBackDisabled) {
      showBack = false;
    }

    const onBackPress = this.state.page === 0
      ? this.props.goBack
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
          <SetupOverView onNextPress={this.props.onFinishSetup} />
        </StepsSlider>
      </View>
    );
  }
}

Setup.propTypes = {
  onFinishSetup: React.PropTypes.func.isRequired,
  initSetup: React.PropTypes.func.isRequired,
  navigation: React.PropTypes.object.isRequired,
  goBack: React.PropTypes.func.isRequired
};

Setup.navigationOptions = {
  header: {
    visible: false
  }
};

export default Setup;
