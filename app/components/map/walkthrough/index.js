// @flow

import React, { Component } from 'react';
import { Animated, Image, View, Text } from 'react-native';

import CircleButton from 'components/common/circle-button';

import { Navigation, NavigationButtonPressedEvent } from 'react-native-navigation';
import styles from './styles';
import Callout from 'components/common/callout';
import i18n from 'i18next';

import { withSafeArea } from 'react-native-safe-area';
const FooterSafeAreaView = withSafeArea(View, 'margin', 'bottom');
const NavSafeAreaView = withSafeArea(View, 'margin', 'top');

const addLocationIcon = require('assets/add_location.png');
const reportsAndRoutesImage = require('assets/phoneMapIPhone.png');
const mapSettingsIcon = require('assets/map_settings.png');

type Props = {
  componentId: string,
  setMapWalkthroughSeen: (seen: boolean) => void
};

export default class MapWalkthrough extends Component<Props> {
  static options(passProps) {
    return {
      topBar: {
        drawBehind: true,
        background: {
          color: 'transparent'
        }
      }
    };
  }

  constructor(props: Props) {
    super(props);
    Navigation.events().bindComponent(this);
    this.state = {
      step1Opacity: new Animated.Value(0),
      step: 0
    };
  }

  navigationButtonPressed({ buttonId }: NavigationButtonPressedEvent) {
    if (buttonId === 'settings') {
      this.onPress();
    }
  }

  renderReportsAndRoutesOverlay() {
    return (
      <View style={styles.reportsAndRoutesParent}>
        <Animated.View style={[styles.reportsAndRoutesContainer, { opacity: this.state.step1Opacity }]}>
          <Text style={styles.titleText}>{i18n.t('map.reportsAndRoutes.title')}</Text>
          <Text style={styles.bodyText}>{i18n.t('map.reportsAndRoutes.body')}</Text>
          <Image style={styles.image} source={reportsAndRoutesImage} />
        </Animated.View>
      </View>
    );
  }

  renderButtonPanel() {
    return (
      <React.Fragment>
        <View style={styles.buttonPanel}>
          <Callout
            above
            body={i18n.t('map.reportsTooltip.body')}
            title={i18n.t('map.reportsTooltip.title')}
            visible={this.state.step === 0}
            width={280}
            offset={10}
          >
            <CircleButton
              style={[styles.circleButton, { opacity: this.state.step === 0 ? 1 : 0 }]}
              shouldFillContainer
              light
              onPress={this.onPress}
              icon={addLocationIcon}
            />
          </Callout>
        </View>
      </React.Fragment>
    );
  }

  /**
   * Renders a dummy navigation bar for placement of the Callout which tracks the settings nav button
   */
  renderDummyNav() {
    // Render a dummy navigation bar, in order to try and place the callout arrow directly on the system
    // navigation bar item. We can't get the frame of the button seemingly from react-native-navigation
    // so this is a necessarily hacky bit of UI unfortunately.
    return (
      <NavSafeAreaView style={styles.navContainer}>
        <Callout
          body={i18n.t('map.settingsTooltip.body')}
          title={i18n.t('map.settingsTooltip.title')}
          visible={this.state.step === 2}
          width={280}
          offset={10}
        >
          <Image source={mapSettingsIcon} style={{ opacity: 0 }} />
        </Callout>
      </NavSafeAreaView>
    );
  }

  renderMapFooter() {
    return (
      <FooterSafeAreaView key="footer" pointerEvents="box-none" style={styles.footer}>
        {this.renderButtonPanel()}
      </FooterSafeAreaView>
    );
  }

  onPress = () => {
    switch (this.state.step) {
      case 0:
        Animated.timing(this.state.step1Opacity, {
          toValue: 1,
          delay: 0,
          duration: 200
        }).start();
        break;
      case 1:
        Animated.timing(this.state.step1Opacity, {
          toValue: 0,
          delay: 0,
          duration: 200
        }).start();
        // Show this as it's the only way to guarantee this lines up with the button in the screen below
        Navigation.mergeOptions(this.props.componentId, {
          topBar: {
            rightButtons: [
              {
                color: 'white',
                id: 'settings',
                icon: mapSettingsIcon
              }
            ]
          }
        });
        break;
      case 2:
        this.props.setMapWalkthroughSeen(true);
        Navigation.dismissModal(this.props.componentId);
        break;
    }

    this.setState({
      step: this.state.step + 1
    });
  };

  render() {
    return (
      <View onStartShouldSetResponder={this.onPress} style={styles.container}>
        {this.renderDummyNav()}
        {this.renderReportsAndRoutesOverlay()}
        {this.renderMapFooter()}
      </View>
    );
  }
}
