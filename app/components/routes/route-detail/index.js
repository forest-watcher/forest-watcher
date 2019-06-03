// @flow

import React, { PureComponent } from 'react';
import { View, Text, ScrollView } from 'react-native';
import moment from 'moment';
import { Navigation } from 'react-native-navigation/lib/dist/index';
import styles from './styles';
import AnswerComponent from 'components/form/answer/answer';
import i18n from '../../../locales';
import type { Route } from '../../../types/routes.types';

type Props = {
  route: Route
};

class RouteDetail extends PureComponent<Props> {
  static options(passProps) {
    return {
      layout: {
        backgroundColor: 'transparent'
      }
    };
  }

  render() {
    const { route } = this.props;
    // todo mpf use existing translations
    const firstLocation = route.locations[0];
    const lastLocation = route.locations[route.locations.length - 1];
    const locationStart = `Start: ${firstLocation.latitude.toFixed(4)}, ${firstLocation.longitude.toFixed(4)}`;
    const locationEnd = `End: ${lastLocation.latitude.toFixed(4)}, ${lastLocation.longitude.toFixed(4)}`;
    const routeData = [
      { label: ['Name**'], value: [route.name] },
      { label: ['Location**'], value: [route.name] },
      { label: ['Date**'], value: [moment(route.date).format('YYYY-MM-DD')] },
      { label: ['Difficulty**'], value: [route.difficulty] },
      { label: ['Language**'], value: [locationStart, locationEnd] }
    ];

    return (
      <ScrollView>
        <View style={styles.answersContainer}>
          <View style={styles.listContainer}>
            <Text style={styles.listTitle}>Route Details**</Text>
            {routeData.map((data, i) => (
              <AnswerComponent question={data.label} answers={data.value} key={i} readOnly />
            ))}
          </View>
        </View>
      </ScrollView>
    );
  }
}

export default RouteDetail;
