import React, { Component } from 'react';
import {
  View
} from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';

import SetupCountry from 'containers/setup/country';
import SetupBoundaries from 'components/setup/boundaries';
import SetupOverView from 'components/setup/overview';
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

  handleScroll = (pos) => {
    this.setState((prevState) => ({
      locked: pos > prevState.page,
      page: prevState.page
    }));
  }

  goToPrevPage = () => {
    this.setState((prevState) => {
      const newPage = prevState.page - 1;
      return {
        page: newPage,
        locked: newPage > 0
      };
    });
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
          prerenderingSiblingsNumber={this.slides}
        />
        <ScrollableTabView
          page={this.state.page}
          locked={this.state.locked}
          onChangeTab={this.updatePage}
          onScroll={this.handleScroll}
          tabBarPosition="overlayBottom"
          renderTabBar={this.getIndexBar}
        >
          <SetupCountry onNextClick={this.goToNextPage} />
          <SetupBoundaries onNextClick={this.goToNextPage} />
          <SetupOverView onNextClick={this.props.navigateBack} />
        </ScrollableTabView>
      </View>
    );
  }
}

Setup.propTypes = {
  navigateBack: React.PropTypes.func.isRequired
};

Setup.navigationOptions = {
  header: {
    visible: false
  }
};

export default Setup;
