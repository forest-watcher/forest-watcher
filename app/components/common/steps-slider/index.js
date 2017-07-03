import React from 'react';
import PropTypes from 'prop-types';
import {
  View
} from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';

import styles from './styles';

function getIndexBar(slides) {
  const dots = [];
  for (let i = 0; i < slides.tabs.length; i++) {
    const dotStyle = slides.activeTab === i ? [styles.dot, styles.dotActive] : styles.dot;
    dots.push(<View key={i} style={dotStyle} />);
  }
  return <View style={styles.indexBar}><View style={styles.indexBar}>{dots}</View></View>;
}

function StepsSlider(props) {
  return (
    <ScrollableTabView
      locked
      tabBarPosition="overlayBottom"
      renderTabBar={props.hideIndex ? () => <View /> : getIndexBar}
      prerenderingSiblingsNumber={0}
      {...props}
    >
      {props.children}
    </ScrollableTabView>
  );
}

StepsSlider.propTypes = {
  hideIndex: PropTypes.bool,
  children: PropTypes.node.isRequired
};

export default StepsSlider;

