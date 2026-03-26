// @flow
import type { Area } from 'types/areas.types';

import React, { Component } from 'react';
import { View } from 'react-native';

import VerticalSplitRow from 'components/common/vertical-split-row';
import DataCacher from 'containers/common/download';
import styles from './styles';
import type { Team } from 'types/teams.types';
import i18n from 'i18next';

const placeholderImage = require('assets/area_ph.png');

type Props = {
  areas: Array<Area>,
  teams: Array<Team>,
  downloadCalloutVisible?: ?boolean,
  onAreaDownloadPress?: (areaId: string, name: string) => void,
  onAreaPress: (area: Area, name: string) => void,
  onAreaSettingsPress: (areaId: string, name: string) => void,
  selectionState?: Array<string>,
  sharing?: boolean
};

export default class AreaList extends Component<Props> {
  render() {
    const { areas, downloadCalloutVisible, onAreaDownloadPress, onAreaPress, onAreaSettingsPress } = this.props;
    if (!areas) {
      return null;
    }
    const getRowContainerStyle = index =>
      index === 0 && downloadCalloutVisible
        ? styles.calloutFirstRowContainer
        : index === 1 && downloadCalloutVisible
        ? styles.calloutSecondRowContainer
        : styles.rowContainer;

    return (
      <View>
        {areas.map((area, index) => (
          <View key={`${index}-area-list`} style={getRowContainerStyle(index)}>
            <VerticalSplitRow
              downloadVisible={false}
              onDownloadPress={() => onAreaDownloadPress?.(area.id, area.name)}
              onPress={downloadCalloutVisible ? null : () => onAreaPress(area, area.name)}
              disableSettingsButton={this.props.sharing || (index === 0 && downloadCalloutVisible)}
              onSettingsPress={() => onAreaSettingsPress(area.id, area.name)}
              imageSrc={area.image}
              defaultImage={placeholderImage}
              // $FlowFixMe
              selected={this.props.sharing ? this.props.selectionState?.includes?.(area.id) : null}
              title={area.name}
              subtitle={
                area.teamId ? this.props.teams.find(x => x.id === area.teamId)?.name || i18n.t('areas.teamArea') : null
              }
              style={styles.row}
              largerPadding
              largeImage
            />
            {!this.props.sharing && (
              <DataCacher
                dataType={'area'}
                id={area.id}
                showTooltip={index === 0 && (downloadCalloutVisible ?? false)}
              />
            )}
          </View>
        ))}
      </View>
    );
  }
}
