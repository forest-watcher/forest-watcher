// @flow

import React, { PureComponent } from 'react';
import { ActionSheetIOS, Alert, AlertIOS, Dimensions, Platform, View, ScrollView } from 'react-native';
import moment from 'moment';
import i18n from 'i18next';
import DialogAndroid from 'react-native-dialogs';
import { Navigation, NavigationButtonPressedEvent } from 'react-native-navigation';

import styles from './styles';
import AnswerComponent from 'components/form/answer/answer';
import type { CoordinatesFormat } from 'types/common.types';
import type { Route } from 'types/routes.types';

import ActionButton from 'components/common/action-button';
import debounceUI from 'helpers/debounceUI';
import { formatCoordsByFormat, formatDistance, getDistanceOfPolyline } from 'helpers/map';
import RoutePreviewImage from '../preview-image';

const closeIcon = require('assets/close.png');
const screenDimensions = Dimensions.get('screen');

type Props = {
  componentId: string,
  coordinatesFormat: CoordinatesFormat,
  deleteRoute: () => void,
  updateRoute: Route => void,
  setSelectedAreaId: func,
  route: Route
};

export default class RouteDetail extends PureComponent<Props> {
  static options(passProps: Props) {
    return {
      topBar: {
        title: {
          text: passProps.routeName
        },
        leftButtons: [
          {
            id: 'backButton',
            text: i18n.t('commonText.cancel'),
            icon: Platform.select({
              android: closeIcon
            })
          }
        ]
      }
    };
  }

  constructor(props: Props) {
    super(props);
    Navigation.events().bindComponent(this);
  }

  /**
   * navigationButtonPressed - Handles events from the back button on the modal nav bar.
   *
   * @param  {type} { buttonId } The component ID for the button.
   */
  navigationButtonPressed({ buttonId }: NavigationButtonPressedEvent) {
    if (buttonId === 'backButton') {
      Navigation.dismissModal(this.props.componentId);
    }
  }

  openRouteOnMap = debounceUI(() => {
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
  });

  /**
   * Displays a confirmation before possibly deleting the route
   */
  deleteRoute = debounceUI(() => {
    Alert.alert(i18n.t('routes.confirmDeleteTitle'), i18n.t('routes.confirmDeleteMessage'), [
      {
        text: i18n.t('commonText.confirm'),
        onPress: () => {
          this.props.deleteRoute();
          Navigation.dismissModal(this.props.componentId);
        }
      },
      {
        text: i18n.t('commonText.cancel'),
        style: 'cancel'
      }
    ]);
  });

  onEditDifficultyPress = debounceUI(async () => {
    const dialogTitle = i18n.t('routes.difficulty');
    const dialogItems = [
      { label: i18n.t('routes.difficultyLevels.easy'), value: 'easy' },
      { label: i18n.t('routes.difficultyLevels.medium'), value: 'medium' },
      { label: i18n.t('routes.difficultyLevels.hard'), value: 'hard' }
    ];

    const dialogItemHandler = idx => {
      const item = dialogItems[idx];
      this.props.updateRoute({
        difficulty: item.value
      });
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...dialogItems.map(item => item.label), i18n.t('commonText.cancel')],
          cancelButtonIndex: dialogItems.length,
          title: dialogTitle
        },
        dialogItemHandler
      );
    } else {
      const { selectedItem } = await DialogAndroid.showPicker(dialogTitle, null, {
        items: dialogItems.map((item, idx) => ({
          label: item.label,
          id: idx
        }))
      });
      if (selectedItem) {
        dialogItemHandler(selectedItem.id);
      }
    }
  });

  onEditNamePress = debounceUI(async () => {
    const title = i18n.t('commonText.name');
    const message = null;
    const placeholder = this.props.route.name ?? '';
    let newName = null;

    if (Platform.OS === 'android') {
      const dialogOptions = {
        defaultValue: placeholder,
        allowEmptyInput: false,
        maxLength: 30
      };
      const { action, text } = await DialogAndroid.prompt(title, message, dialogOptions);
      if (action === DialogAndroid.actionPositive) {
        newName = text;
      }
    } else {
      try {
        newName = await new Promise((resolve, reject) => {
          AlertIOS.prompt(
            title,
            message,
            [
              {
                text: i18n.t('commonText.cancel'),
                onPress: () => reject(new Error()),
                style: 'cancel'
              },
              {
                text: i18n.t('commonText.ok'),
                onPress: text => resolve(text)
              }
            ],
            'plain-text'
          );
        });
      } catch {
        return;
      }
    }

    if (!!newName && newName !== placeholder) {
      this.props.updateRoute({
        name: newName
      });
    }
  });

  render() {
    const { coordinatesFormat, route } = this.props;

    if (!route) {
      return null;
    }

    const routeData = [{ label: [i18n.t('commonText.name')], value: [route.name], onEditPress: this.onEditNamePress }];

    const showLocations = route.locations?.length;
    if (showLocations) {
      const firstLocation = route.locations[0];
      const lastLocation = route.locations.length > 1 ? route.locations?.[route.locations.length - 1] : firstLocation;
      const locationStart = `${i18n.t('routes.locationStart')} ${formatCoordsByFormat(
        firstLocation,
        coordinatesFormat
      )}`;
      const locationEnd = `${i18n.t('routes.locationEnd')} ${formatCoordsByFormat(lastLocation, coordinatesFormat)}`;
      routeData.push({ label: [i18n.t('routes.location')], value: [locationStart, locationEnd] });

      const routeDistance = getDistanceOfPolyline(route.locations);
      routeData.push({ label: [i18n.t('routes.distance')], value: [formatDistance(routeDistance, 1, false)] });
    }

    routeData.push(
      { label: [i18n.t('commonText.date')], value: [moment(route.endDate).format('ll')] },
      {
        label: [i18n.t('routes.difficulty')],
        value: [i18n.t(`routes.difficultyLevels.${route.difficulty}`)],
        onEditPress: this.onEditDifficultyPress
      },
      {
        label: [i18n.t('routes.duration')],
        value: [moment.duration(moment(route.endDate).diff(moment(route.startDate))).humanize()] // todo: format this correctly to be days, hours, minutes.
      }
    );

    return (
      <ScrollView>
        <RoutePreviewImage aspectRatio={0.5} width={screenDimensions.width} style={styles.headerImage} route={route} />
        <ActionButton
          style={styles.actionButton}
          onPress={this.openRouteOnMap}
          text={i18n.t('routes.viewOnMap').toUpperCase()}
          short
          dark
          transparent
          noIcon
        />
        <View style={styles.answersContainer}>
          {routeData.map((data, i) =>
            data.value?.[0] ? (
              <AnswerComponent
                question={data.label}
                answers={data.value}
                key={i}
                readOnly={!data.onEditPress}
                onEditPress={data.onEditPress}
              />
            ) : null
          )}
        </View>
        <ActionButton
          style={styles.actionButton}
          onPress={this.deleteRoute}
          text={i18n.t('routes.delete').toUpperCase()}
          short
          delete
          transparent
        />
      </ScrollView>
    );
  }
}
