// @flow
import type { Area } from 'types/areas.types';
import React from 'react';
import {
  ActivityIndicator,
  View,
  Text
} from 'react-native';
import Row from 'components/common/row';
import DatasetOptions from 'components/settings/area-detail/alert-system/dataset-options';

import i18n from 'locales';
import Theme from 'config/theme';
import styles from './styles';

type Props = {
  area: Area,
  setAreaDatasetStatus: (id: string, slug: string, value: boolean) => void,
  updateDate: (id: string, slug: string, date: number) => void
};

class AlertSystem extends React.PureComponent<Props> {
  static renderNoAlerts() {
    return (
      <View style={styles.container}>
        <View style={styles.section}>
          <Row>
            <Text>{i18n.t('areaDetail.noAlerts')}</Text>
          </Row>
        </View>
      </View>
    );
  }

  static renderLoadingState() {
    return (
      <View style={styles.loader}>
        <ActivityIndicator
          color={Theme.colors.color1}
          style={{ height: 80 }}
          size="large"
        />
      </View>
    );
  }

  render() {
    const { setAreaDatasetStatus, updateDate, area: { datasets, id } } = this.props;

    if (!datasets) return AlertSystem.renderLoadingState();
    if (typeof datasets === 'undefined' || datasets.length === 0) {
      return AlertSystem.renderNoAlerts();
    }
    return (
      <View style={styles.container}>
        {
          datasets.map((dataset, i) => (
            <View key={i}>
              <Row
                value={dataset.active}
                onValueChange={value => setAreaDatasetStatus(id, dataset.slug, value)}
              >
                <Text style={styles.alertSystemText}>{i18n.t(`datasets.${dataset.slug}`)}</Text>
              </Row>
              {dataset.active &&
                <DatasetOptions
                  id={id}
                  dataset={dataset}
                  updateDate={updateDate}
                />
              }
            </View>
          ))
        }
      </View>
    );
  }
}

export default AlertSystem;
