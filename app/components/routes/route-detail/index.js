// @flow

import React, { PureComponent } from 'react';
import { View, Text, ScrollView } from 'react-native';
import moment from 'moment';
import i18n from '../../../locales';
import { Navigation } from 'react-native-navigation';

import styles from './styles';
import AnswerComponent from 'components/form/answer/answer';
import type { Route } from 'types/routes.types';
import ActionButton from '../../common/action-button';

type Props = {
  componentId: string,
  setSelectedAreaId: func,
  route: Route
};

class RouteDetail extends PureComponent<Props> {
  static options(passProps) {
    return {
      topBar: {
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

  deleteRoute = () => {
    // todo
  };

  render() {
    const { route } = this.props;
    // todo mpf use existing translations
    const firstLocation = route.locations[0];
    const lastLocation = route.locations[route.locations.length - 1];
    const locationStart = `Start: ${firstLocation.latitude.toFixed(4)}, ${firstLocation.longitude.toFixed(4)}`;
    const locationEnd = `End: ${lastLocation.latitude.toFixed(4)}, ${lastLocation.longitude.toFixed(4)}`;
    const routeData = [
      { label: [i18n.t('commonText.name')], value: [route.name], canEdit: true },
      { label: ['Location'], value: [locationStart, locationEnd] },
      { label: [i18n.t('commonText.date')], value: [moment(route.date).format('YYYY-MM-DD')] },
      { label: ['Difficulty'], value: [route.difficulty], canEdit: true },
      { label: [i18n.t('commonText.language')], value: [route.language] }
    ];

    return (
      <ScrollView>
        <ActionButton
          style={styles.actionButton}
          onPress={this.openRouteOnMap}
          text={'View Route On Map'.toUpperCase()}
          short
          light
        />
        <View style={styles.answersContainer}>
          <View style={styles.listContainer}>
            <Text style={styles.listTitle}>Route Details</Text>
            {routeData.map((data, i) => (
              <AnswerComponent question={data.label} answers={data.value} key={i} readOnly={!data.canEdit} />
            ))}
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
