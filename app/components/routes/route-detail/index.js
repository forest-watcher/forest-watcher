// @flow

import React, { PureComponent } from 'react';
import { Alert, View, ScrollView } from 'react-native';
import moment from 'moment';
import i18n from 'locales';
import { Navigation } from 'react-native-navigation';

import styles from './styles';
import AnswerComponent from 'components/form/answer/answer';
import type { Route } from 'types/routes.types';

import ActionButton from 'components/common/action-button';
import { formatCoordsByFormat } from 'helpers/map';
import RoutePreviewImage from '../preview-image';

type Props = {
  componentId: string,
  coordinatesFormat: string,
  deleteRoute: () => void,
  setSelectedAreaId: func,
  route: Route
};

class RouteDetail extends PureComponent<Props> {
  static options(passProps) {
    return {
      topBar: {
        title: {
          text: passProps.routeName
        },
        rightButtons: [
          {
            id: 'share',
            text: 'Share'
          }
        ]
      }
    };
  }

  constructor(props: Props) {
    super(props);
    Navigation.events().bindComponent(this);
  }

  navigationButtonPressed({ buttonId }) {
    if (buttonId === 'share') {
      // todo share route
    }
  }

  openRouteOnMap = () => {
    // Testing against a mocked route? You must provide your own area id here!
    this.props.setSelectedAreaId(this.props.route.areaId);
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.Map',
        options: {
          topBar: {
            title: {
              text: this.props.route.name
            }
          }
        },
        passProps: {
          previousRoute: this.props.route
        }
      }
    });
  };

  /**
   * Displays a confirmation before possibly deleting the route
   */
  deleteRoute = () => {
    Alert.alert(i18n.t('routes.confirmDeleteTitle'), i18n.t('routes.confirmDeleteMessage'), [
      {
        text: i18n.t('commonText.confirm'),
        onPress: () => {
          this.props.deleteRoute();
          Navigation.pop(this.props.componentId);
        }
      },
      {
        text: i18n.t('commonText.cancel'),
        style: 'cancel'
      }
    ]);
  };

  render() {
    const { coordinatesFormat, route } = this.props;

    if (!route) {
      return null;
    }

    // todo mpf use existing translations
    const routeData = [{ label: [i18n.t('commonText.name')], value: [route.name], canEdit: true }];

    const showLocations = route.locations?.length;
    if (showLocations) {
      const firstLocation = route.locations[0];
      const lastLocation = route.locations.length > 1 ? route.locations?.[route.locations.length - 1] : firstLocation;
      const locationStart = `Start: ${formatCoordsByFormat(firstLocation, coordinatesFormat)}`;
      const locationEnd = `End: ${formatCoordsByFormat(lastLocation, coordinatesFormat)}`;
      routeData.push({ label: ['Location'], value: [locationStart, locationEnd] });
    }

    routeData.push(
      { label: [i18n.t('commonText.date')], value: [moment(route.endDate).format('YYYY-MM-DD')] },
      { label: ['Difficulty'], value: [route.difficulty], canEdit: true },
      // todo: add distance values
      {
        label: [i18n.t('commonText.duration')],
        value: [moment.duration(moment(route.endDate).diff(moment(route.startDate))).humanize()] // todo: format this correctly to be days, hours, minutes.
      },
      { label: [i18n.t('commonText.language')], value: [route.language] }
    );

    return (
      <ScrollView>
        <RoutePreviewImage style={styles.headerImage} route={route} />
        <ActionButton
          style={styles.actionButton}
          onPress={this.openRouteOnMap}
          text={'View Route On Map'.toUpperCase()}
          short
          light
        />
        <View style={styles.answersContainer}>
          <View style={styles.listContainer}>
            {routeData.map((data, i) =>
              data.value?.[0] ? (
                <AnswerComponent question={data.label} answers={data.value} key={i} readOnly={!data.canEdit} />
              ) : null
            )}
          </View>
        </View>
        <ActionButton
          style={styles.actionButton}
          onPress={this.deleteRoute}
          text={'Delete Route'.toUpperCase()}
          short
          delete
        />
      </ScrollView>
    );
  }
}

export default RouteDetail;
