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
    return (
      <View style={styles.container}>
        <Header
          title={I18n.t('commonText.setUp')}
          showBack={this.state.page > 0}
          onBackPress={this.goToPrevPage}
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
  initSetup: React.PropTypes.func.isRequired
};

Setup.navigationOptions = {
  header: {
    visible: false
  }
};

export default Setup;
