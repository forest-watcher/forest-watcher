// @flow

import React, { PureComponent } from 'react';
import { Image, Text, TouchableHighlight, View } from 'react-native';
import { Navigation } from 'react-native-navigation';

import styles from './styles';
import type { Route } from 'types/routes.types';
import ActionButton from 'components/common/action-button';
import { withSafeArea } from 'react-native-safe-area';
import Row from 'components/common/row';
import Theme from '../../../config/theme';
const closeImage = require('assets/close_gray.png');

const SafeAreaView = withSafeArea(View, 'margin', 'bottom');

type Props = {
  route: Route,
  closeDialog: () => void
};

class BottomDialog extends PureComponent<Props> {
  openSaveRouteScreen = () => {
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.SaveRoute',
        options: {
          topBar: {
            title: {
              text: this.props.route.name
            }
          }
        }
      }
    });
  };

  deleteRoute = () => {
    // todo
    this.props.closeDialog();
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Row rowStyle={styles.navRowContainer}>
          <View style={styles.navRow}>
            <TouchableHighlight
              style={styles.closeIconContainer}
              onPress={this.props.closeDialog}
              activeOpacity={0.5}
              underlayColor="transparent"
            >
              <Image style={styles.closeIcon} source={closeImage} />
            </TouchableHighlight>
            <Text style={styles.navRowText}>{'Stop Route Tracking'.toUpperCase()}</Text>
          </View>
        </Row>
        <View style={styles.bodyContainer}>
          <ActionButton
            style={styles.actionButton}
            onPress={this.openSaveRouteScreen}
            text={'Stop And Save Route'.toUpperCase()}
            short
            noIcon
          />
          <ActionButton
            style={styles.actionButton}
            onPress={this.deleteRoute}
            text={'Stop And Delete Route'.toUpperCase()}
            short
            delete
          />
        </View>
      </SafeAreaView>
    );
  }
}

export default BottomDialog;
