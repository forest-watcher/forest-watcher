// @flow

import type { Route, RouteDifficulty } from 'types/routes.types';
import React, { PureComponent } from 'react';
import { Dimensions, Text, ScrollView, Picker } from 'react-native';
import { Navigation } from 'react-native-navigation';
import moment from 'moment';

import styles from './styles';
import ActionButton from 'components/common/action-button';
import InputText from 'components/common/text-input';
import { getValidLocations, stopTrackingLocation } from 'helpers/location';
import i18n from 'i18next';
import RoutePreviewImage from '../preview-image';
import { trackRouteDetailsUpdated } from 'helpers/analytics';
import { getDistanceOfPolyline } from 'helpers/map';

const screenDimensions = Dimensions.get('screen');

type Props = {
  componentId: string,
  route: ?Route,
  updateActiveRoute: ($Shape<Route>, string) => void,
  finishAndSaveRoute: (routeId: string, string) => Promise<void>
};

type State = {
  route: $Shape<Route>
};

class SaveRoute extends PureComponent<Props, State> {
  static options(passProps: {}) {
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

    this.state = {
      route: {
        ...props.route,
        difficulty: props.route?.difficulty ?? 'easy',
        endDate: Date.now(),
        name: props.route?.name ?? ''
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

  changeRouteSaveName = (newRouteSaveName: string) => {
    this.setState(state => ({
      route: {
        ...state.route,
        name: newRouteSaveName
      }
    }));
  };

  changeRouteDifficulty = (newDifficulty: RouteDifficulty) => {
    this.setState(state => ({
      route: {
        ...state.route,
        difficulty: newDifficulty
      }
    }));
  };

  onSaveRoutePressed = async () => {
    const { route } = this.state;
    if (!route) {
      return;
    }

    stopTrackingLocation();

    const routeDistance = getDistanceOfPolyline(route.locations);
    trackRouteDetailsUpdated(
      route.difficulty,
      (route.endDate ?? Date.now()) - route.startDate,
      moment(route.endDate).format('l'),
      routeDistance
    );
    await this.props.updateActiveRoute(route, route.areaId);
    await this.props.finishAndSaveRoute(route.id, route.areaId);
    Navigation.pop(this.props.componentId);
  };

  render() {
    if (!this.state.route) {
      return null;
    }

    return (
      <ScrollView style={styles.container}>
        <RoutePreviewImage
          aspectRatio={0.5}
          width={screenDimensions.width}
          style={styles.headerImage}
          route={{
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
          // $FlowFixMe
          onValueChange={value => this.changeRouteDifficulty(value)}
          style={styles.picker}
          itemStyle={{ height: 72 }} // Only for iOS
          mode="dropdown" // Only for Android
        >
          <Picker.Item label={i18n.t('routes.difficultyLevels.easy')} value={'easy'} />
          <Picker.Item label={i18n.t('routes.difficultyLevels.medium')} value={'medium'} />
          <Picker.Item label={i18n.t('routes.difficultyLevels.hard')} value={'hard'} />
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

export default SaveRoute;
