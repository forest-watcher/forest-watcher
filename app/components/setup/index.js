import React, { Component } from 'react';
import {
  View
} from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';

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
      page: 0,
      locked: true
    };
    this.slides = 3;
  }

  componentWillMount() {
    this.props.initSetup();
  }

  getIndexBar = (props) => {
    const dots = [];
    for (let i = 0; i < this.slides; i++) {
      const dotStyle = props.activeTab === i ? [styles.dot, styles.dotActive] : styles.dot;
      dots.push(<View key={i} style={dotStyle} />);
    }
    return <View style={styles.indexBar}><View style={styles.indexBar}>{dots}</View></View>;
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
        <ScrollableTabView
          page={this.state.page}
          locked={this.state.locked}
          onChangeTab={this.updatePage}
          tabBarPosition="overlayBottom"
          renderTabBar={this.getIndexBar}
        >
          <SetupCountry onNextPress={this.goToNextPage} />
          <SetupBoundaries onNextPress={this.goToNextPage} />
          <SetupOverView onNextPress={this.props.onFinishSetup} />
        </ScrollableTabView>
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
