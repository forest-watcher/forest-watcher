import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import SafeArea, { withSafeArea } from 'react-native-safe-area';

import styles from './styles';

const SafeAreaView = withSafeArea(View, 'margin', 'bottom');

class StepsSlider extends PureComponent {
  state = {};

  componentDidMount() {
    SafeArea.getSafeAreaInsetsForRootView().then(result => {
      this.setState({
        bottomSafeAreaInset: result.safeAreaInsets.bottom
      });
    });
  }

  getIndexBar(slides, barStyle, bottomSafeAreaInset) {
    const dots = [];

    for (let i = 0; i < slides.tabs.length; i++) {
      const dotStyle = slides.activeTab === i ? [styles.dot, styles.dotActive] : styles.dot;
      dots.push(<View key={i} style={dotStyle} />);
    }

    const height = Math.max(styles.indexBar.height, barStyle?.height || 0) + bottomSafeAreaInset;

    return (
      <SafeAreaView
        style={[
          styles.indexBar,
          barStyle,
          {
            height: height,
            paddingBottom: bottomSafeAreaInset
          }
        ]}
      >
        <View
          style={[
            styles.indexBar,
            barStyle,
            {
              height: height,
              paddingBottom: bottomSafeAreaInset,
              marginBottom: -bottomSafeAreaInset
            }
          ]}
        >
          {dots}
        </View>
      </SafeAreaView>
    );
  }

  render() {
    const { bottomSafeAreaInset } = this.state;

    const props = this.props;

    return (
      <ScrollableTabView
        locked
        tabBarPosition="overlayBottom"
        renderTabBar={props.hideIndex ? () => <View /> : slides => this.getIndexBar(slides, props.barStyle, bottomSafeAreaInset)}
        prerenderingSiblingsNumber={0}
        {...props}
      >
        {props.children}
      </ScrollableTabView>
    );
  }
}

StepsSlider.propTypes = {
  hideIndex: PropTypes.bool,
  children: PropTypes.node.isRequired,
  barStyle: PropTypes.any
};

export default StepsSlider;
