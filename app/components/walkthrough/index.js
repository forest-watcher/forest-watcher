import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Image,
  TouchableOpacity,
  Text
} from 'react-native';

import i18n from 'locales';
import Theme from 'config/theme';
import capitalize from 'lodash/capitalize';
import throttle from 'lodash/throttle';
import StepsSlider from 'components/common/steps-slider';
import Hyperlink from 'react-native-hyperlink';


import styles from './styles';

const backIcon = require('assets/previous.png');
const nextIcon = require('assets/next.png');
const phone1 = require('assets/walkthrough-phone1.png');
const phone2 = require('assets/walkthrough-phone2.png');
const phone3 = require('assets/walkthrough-phone3.png');
const phone4 = require('assets/walkthrough-phone4.png');
const phone5 = require('assets/walkthrough-phone5.png');

const SLIDES = [
  {
    title: i18n.t('walkthrough.title.slide1'),
    subtitle: i18n.t('walkthrough.subtitle.slide1'),
    image: phone1,
    color: Theme.colors.color3
  },
  {
    subtitle: i18n.t('walkthrough.subtitle.slide2'),
    image: phone2,
    color: Theme.colors.color3
  },
  {
    subtitle: i18n.t('walkthrough.subtitle.slide3'),
    image: phone3,
    color: Theme.colors.color3
  },
  {
    subtitle: i18n.t('walkthrough.subtitle.slide4'),
    image: phone4,
    color: Theme.colors.color3
  },
  {
    subtitle: i18n.t('walkthrough.subtitle.slide5'),
    image: phone5,
    color: Theme.colors.color3
  },
  {
    subtitle: i18n.t('walkthrough.subtitle.slide6'),
    textOnly: true
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

  onPressBack = throttle(() => {
    this.setState({ page: this.state.page - 1 });
  }, 300);

  onPressNext = throttle(() => {
    const { page } = this.state;

    if (page + 1 < SLIDES.length) {
      this.setState({ page: page + 1 });
    } else {
      this.goToLogin();
    }
  }, 300);

  onChangeTab = ({ i: newPage }) => {
    if (newPage > this.state.page) {
      this.onPressNext();
    } else if (newPage < this.state.page) {
      this.onPressBack();
    }
  };

  goToLogin = throttle(() => {
    this.props.navigator.resetTo({
      screen: 'ForestWatcher.Login',
      title: 'Set up',
      passProps: {
        goBackDisabled: true
      }
    });
  }, 1000);

  render() {
    const { page } = this.state;
    return (
      <View style={styles.container}>
        <StepsSlider
          page={page}
          barStyle={{ height: 64 }}
          locked={false}
          prerenderingSiblingsNumber={1}
          onChangeTab={this.onChangeTab}
        >
          {SLIDES.map((slide, index) =>
            (
              <View style={styles.slideContainer} key={`slide-${index}`}>
                <View style={styles.topSection}>
                  <TouchableOpacity onPress={this.goToLogin}>
                    <Text style={styles.skipButton}>{capitalize(i18n.t('walkthrough.skip'))}</Text>
                  </TouchableOpacity>
                  <View style={styles.textsContainer}>
                    {slide.title &&
                      <Text style={styles.title}>{slide.title}</Text>
                    }
                    {slide.subtitle &&
                      <Hyperlink linkDefault linkStyle={Theme.linkSecondary}>
                        <Text style={styles.subtitle}>{slide.subtitle}</Text>
                      </Hyperlink>
                    }
                  </View>
                </View>
                {!slide.textOnly &&
                  <View style={styles.phoneContainer}>
                    {slide.image ?
                      <Image style={styles.phoneImage} source={slide.image} />
                      : <View style={[styles.phoneImage, { backgroundColor: slide.color }]} />
                    }
                  </View>
                }
                <View style={styles.footerHack} />
              </View>
            ))
          }
          <View />
        </StepsSlider>
        <View style={[styles.footer, page > 0 ? { justifyContent: 'space-between' } : { justifyContent: 'flex-end' }]}>
          {page > 0 && // Buttons are placed here because inside the StepsSlider the events wont trigger
          <TouchableOpacity
            onPress={this.onPressBack}
          >
            <Image style={Theme.icon} source={backIcon} />
          </TouchableOpacity>
          }
          <TouchableOpacity
            onPress={this.onPressNext}
          >
            <Image style={Theme.icon} source={nextIcon} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

export default Walkthrough;
