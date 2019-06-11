// @flow

import React, { PureComponent } from 'react';
import { ActionSheetIOS, Alert, AlertIOS, Platform, View, ScrollView } from 'react-native';
import moment from 'moment';
import i18n from 'locales';
import DialogAndroid from 'react-native-dialogs';
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
  updateRoute: Route => void,
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

  onEditDifficultyPress = async () => {
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
  };

  onEditNamePress = async () => {
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
      newName = new Promise((resolve, reject) => {
        AlertIOS.prompt(title, message, text => resolve(text), undefined, placeholder);
      });
    }

    if (!!newName && newName !== placeholder) {
      this.props.updateRoute({
        name: newName
      });
    }
  };

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
      const locationStart = `Start: ${formatCoordsByFormat(firstLocation, coordinatesFormat)}`;
      const locationEnd = `End: ${formatCoordsByFormat(lastLocation, coordinatesFormat)}`;
      routeData.push({ label: ['Location'], value: [locationStart, locationEnd] });
    }

    routeData.push(
      { label: [i18n.t('commonText.date')], value: [moment(route.endDate).format('YYYY-MM-DD')] },
      { label: ['Difficulty'], value: [route.difficulty], onEditPress: this.onEditDifficultyPress },
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
