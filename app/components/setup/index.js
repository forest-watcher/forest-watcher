import React, { Component } from 'react';
import {
  View,
  Text
} from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';

import Theme from 'config/theme';
import Header from './header';
import SetupCountry from 'containers/setup/country';
import SetupBoundaries from 'components/setup/boundaries';
import SetupOverView from 'components/setup/overview';
import styles from './styles';

function Dot(active) {
  const dotStyle = active ? [styles.dot, styles.activeDot] : styles.dot;
  return <View style={dotStyle} />;
}

class Setup extends Component {
  constructor() {
    super();
    this.state = {
      page: 0,
      locked: true
    };
  }

  updatePage = (slide) => {
    this.setState({
      page: slide.i
    });
  }

  handleScroll = (pos) => {
    this.setState((prevState) => ({
      locked: pos > prevState.page,
      page: prevState.page
    }));
  }

  goToPrevPage = () => {
    this.setState((prevState) => ({
      page: prevState.page - 1
    }));
  }

  goToNextPage = () => {
    this.setState((prevState) => {
      const newPage = prevState.page + 1;
      return {
        page: newPage,
        locked: newPage > 0
      };
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Header
          title="Set up"
          showBack={this.state.page > 0}
          onBackPress={this.goToPrevPage}
          prerenderingSiblingsNumber={3}
        />
        <ScrollableTabView
          page={this.state.page}
          locked={this.state.locked}
          onChangeTab={this.updatePage}
          onScroll={this.handleScroll}
          renderTabBar={() => <View />}
          tabBarPosition="overlayBottom"
        >
          <SetupCountry onNextClick={this.goToNextPage} />
          <SetupBoundaries onNextClick={this.goToNextPage} />
          <SetupOverView onNextClick={this.goToNextPage} />
        </ScrollableTabView>
      </View>
    );
  }
}

Setup.propTypes = {};

Setup.navigationOptions = {
  header: {
    visible: false
  }
};

export default Setup;
