import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, Image, TouchableOpacity, Text } from 'react-native';

import i18n from 'locales';
import Theme from 'config/theme';
import capitalize from 'lodash/capitalize';
import throttle from 'lodash/throttle';
import StepsSlider from 'components/common/steps-slider';
import Hyperlink from 'react-native-hyperlink';
import { Navigation } from 'react-native-navigation';

import SafeArea, { withSafeArea } from 'react-native-safe-area';

import styles from './styles';

const SafeAreaView = withSafeArea(View, 'margin', 'top');
const backIcon = require('assets/previous.png');
const nextIcon = require('assets/next.png');
const phone1 = require('assets/phone1.jpg');
const phone2 = require('assets/phone2.jpg');
const phone3 = require('assets/phone3.jpg');
const phone4 = require('assets/phone4.jpg');
const phone5 = require('assets/phone5.jpg');

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
  static options(passProps) {
    return {
      topBar: {
        drawBehind: true,
        visible: false
      }
    };
  }

  static propTypes = {
    componentId: PropTypes.string.isRequired
  };

  state = {
    page: 0
  };

  componentDidMount() {
    // Determine the current insets. This is so, for the page indicator view,
    // we can add additional padding to ensure the white background is extended
    // beyond the safe area.
    SafeArea.getSafeAreaInsetsForRootView().then(result => {
      this.setState({
        bottomSafeAreaInset: result.safeAreaInsets.bottom
      });
    });
  }

  onPressBack = throttle(() => {
    this.setState(prevState => ({ page: prevState.page - 1 }));
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
    Navigation.setStackRoot(this.props.componentId, {
      component: {
        name: 'ForestWatcher.Login',
        passProps: {
          goBackDisabled: true
        },
        options: {
          topBar: {
            title: {
              text: i18n.t('commonText.setup')
            }
          }
        }
      }
    });
  }, 1000);

  render() {
    const { page, bottomSafeAreaInset } = this.state;

    const footerJustifyContent = page > 0 ? 'space-between' : 'flex-end';

    return (
      <View style={styles.backing}>
        <SafeAreaView style={styles.contentContainer}>
          <TouchableOpacity onPress={this.goToLogin} style={styles.skipButtonWrapper}>
            <Text style={styles.skipButton}>{capitalize(i18n.t('walkthrough.skip'))}</Text>
          </TouchableOpacity>
          <StepsSlider
            page={page}
            barStyle={{
              height: 64,
              backgroundColor: Theme.background.white
            }}
            locked={false}
            prerenderingSiblingsNumber={1}
            onChangeTab={this.onChangeTab}
          >
            {SLIDES.map((slide, index) => (
              <View style={styles.slideContainer} key={`slide-${index}`}>
                <View style={styles.topSection}>
                  <View style={styles.textsContainer}>
                    {slide.title && <Text style={styles.title}>{slide.title}</Text>}
                    {slide.subtitle && (
                      <Hyperlink linkDefault linkStyle={Theme.linkSecondary}>
                        <Text style={styles.subtitle}>{slide.subtitle}</Text>
                      </Hyperlink>
                    )}
                  </View>
                </View>
                {!slide.textOnly && (
                  <View
                    style={[
                      styles.phoneContainer,
                      {
                        marginBottom: 64 + bottomSafeAreaInset
                      }
                    ]}
                  >
                    {slide.image && <Image style={styles.phoneImage} resizeMode="cover" source={slide.image} />}
                  </View>
                )}
              </View>
            ))}
            <View>{/* This view is required to force the slider to navigate to login on the last slide */}</View>
          </StepsSlider>
          <View style={[styles.footer, { justifyContent: footerJustifyContent, marginBottom: bottomSafeAreaInset }]}>
            {page > 0 && ( // Buttons are placed here because inside the StepsSlider the events wont trigger
              <TouchableOpacity onPress={this.onPressBack}>
                <Image style={[Theme.icon, styles.icon]} source={backIcon} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={this.onPressNext}>
              <Image style={[Theme.icon, styles.icon]} source={nextIcon} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }
}

export default Walkthrough;
