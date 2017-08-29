import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Image,
  TouchableHighlight,
  Text
} from 'react-native';

import Theme from 'config/theme';
import StepsSlider from 'components/common/steps-slider';

import styles from './styles';

const backIcon = require('assets/previous.png');
const nextIcon = require('assets/next.png');

const SLIDES = [
  {
    title: 'Welcome to Forest Watcher',
    subtitle: 'Create areas of interest to monitor alerts of forest change',
    image: 'page1',
    color: Theme.colors.color1
  },
  {
    subtitle: 'Enter the settings to configure the data you want to see',
    image: 'page2',
    color: Theme.colors.color2
  },
  {
    subtitle: 'Navigate to the alerts and create reports to collect data about that change',
    image: 'page3',
    color: Theme.colors.color3
  },
  {
    subtitle: 'You can select multiple alerts to report them in bulk.',
    image: 'page4',
    color: Theme.colors.color5
  },
  {
    subtitle: 'If you discover a new area of forest change, tap directly on the map to report it',
    image: 'page5',
    color: Theme.colors.color6
  }
];

class Walkthrough extends PureComponent {
  static navigatorStyle = {
    navBarHidden: true
  };

  static propTypes = {
    navigator: PropTypes.object.isRequired
  };

  state = {
    page: 0
  };

  onPressBack = () => {
    this.setState(state => ({ page: state.page - 1 }));
  };

  onPressNext = () => {
    const { page } = this.state;
    const { navigator } = this.props;

    if (page + 1 < SLIDES.length) {
      this.setState({ page: page + 1 });
    } else {
      navigator.resetTo({
        screen: 'ForestWatcher.Setup',
        title: 'Set up',
        passProps: {
          goBackDisabled: true
        }
      });
    }
  };

  render() {
    const { page } = this.state;
    return (
      <StepsSlider page={page} barStyle={{ height: 64 }}>
        {SLIDES.map((slide, index) =>
          (
            <View key={`slide-${index}`} style={styles.container}>
              <View style={styles.textsContainer}>
                {slide.title &&
                  <Text style={styles.title}>{slide.title}</Text>
                }
                {slide.subtitle &&
                  <Text style={styles.subtitle}>{slide.subtitle}</Text>
                }
              </View>
              <View style={styles.phoneContainer}>
                <View style={[styles.phoneImage, { backgroundColor: slide.color }]} />
              </View>
              <View style={styles.footer}>
                <TouchableHighlight
                  activeOpacity={0.5}
                  underlayColor="transparent"
                  onPress={this.onPressBack}
                >
                  <Image style={Theme.icon} source={backIcon} />
                </TouchableHighlight>
                <TouchableHighlight
                  activeOpacity={0.5}
                  underlayColor="transparent"
                  onPress={this.onPressNext}
                >
                  <Image style={Theme.icon} source={nextIcon} />
                </TouchableHighlight>
              </View>
            </View>
          ))
        }
      </StepsSlider>
    );
  }
}

export default Walkthrough;
