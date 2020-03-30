// @flow

import React, { PureComponent } from 'react';
import { Dimensions, Text, ScrollView, Picker } from 'react-native';
import { Navigation } from 'react-native-navigation';

import styles from './styles';
import ActionButton from 'components/common/action-button';
import InputText from 'components/common/text-input';
import { getValidLocations, stopTrackingLocation } from 'helpers/location';
import i18n from 'i18next';
import RoutePreviewImage from '../preview-image';
import type { Route } from 'types/routes.types';

const screenDimensions = Dimensions.get('screen');

type Props = {
  componentId: string,
  route: Route,
  updateActiveRoute: () => void,
  finishAndSaveRoute: () => void
};

class SaveRoute extends PureComponent<Props> {
  static options(passProps) {
    return {
      topBar: {
        title: {
          text: i18n.t('routes.save')
        }
      }
    };
  }

  constructor(props: Props) {
    super(props);
    Navigation.events().bindComponent(this);

    const date = Date.now();
    this.state = {
      route: {
        id: date,
        endDate: date,
        name: '',
        difficulty: 'easy',
        locations: []
      }
    };
  }

  componentDidMount() {
    getValidLocations((locations, error) => {
      if (error) {
        return;
      }

      this.setState(state => ({
        route: {
          ...state.route,
          locations: locations ?? []
        }
      }));
    });
  }

  changeRouteSaveName = newRouteSaveName => {
    this.setState(state => ({
      route: {
        ...state.route,
        name: newRouteSaveName
      }
    }));
  };

  changeRouteDifficulty = newDifficulty => {
    this.setState(state => ({
      route: {
        ...state.route,
        difficulty: newDifficulty
      }
    }));
  };

  onSaveRoutePressed = () => {
    stopTrackingLocation();
    this.props.updateActiveRoute({
      ...this.state.route
    });
    this.props.finishAndSaveRoute();
    Navigation.pop(this.props.componentId);
  };

  render() {
    if (!this.props.route) {
      return null;
    }

    return (
      <ScrollView style={styles.container}>
        <RoutePreviewImage
          aspectRatio={0.5}
          width={screenDimensions.width}
          style={styles.headerImage}
          route={{
            ...this.props.route,
            ...this.state.route
          }}
        />
        <Text style={styles.headingText}>{i18n.t('commonText.name').toUpperCase()}</Text>
        <InputText
          value={this.state.route.name}
          placeholder={i18n.t('commonText.name')}
          onChangeText={this.changeRouteSaveName}
        />
        <Text style={styles.headingText}>{i18n.t('routes.difficulty').toUpperCase()}</Text>
        <Picker
          selectedValue={this.state.route.difficulty}
          onValueChange={this.changeRouteDifficulty}
          style={styles.picker}
          itemStyle={{ height: 72 }} // Only for iOS
          mode="dropdown" // Only for Android
        >
          <Picker.Item label={i18n.t('routes.difficultyLevels.easy')} value={'easy'} style={styles.pickerItem} />
          <Picker.Item label={i18n.t('routes.difficultyLevels.medium')} value={'medium'} style={styles.pickerItem} />
          <Picker.Item label={i18n.t('routes.difficultyLevels.hard')} value={'hard'} style={styles.pickerItem} />
        </Picker>
        <ActionButton
          style={styles.actionButton}
          onPress={this.state.route.name.length > 0 ? this.onSaveRoutePressed : null}
          text={i18n.t('routes.save').toUpperCase()}
          disabled={this.state.route.name.length === 0}
          short
          noIcon
        />
      </ScrollView>
    );
  }
}
/*
label: PropTypes.string.isRequired,
  selectedValue: PropTypes.any.isRequired,
  onValueChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.any.isRequired
 */
export default SaveRoute;
