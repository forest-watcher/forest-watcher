// @flow

import * as React from 'react';
import type { Team } from '../../../types/teams.types';
import styles from '../styles';
import i18n from 'i18next';
import Row from 'components/common/row';
import { Text, View } from 'react-native';
const nextIcon = require('assets/next.png');
import type { Area } from '../../../types/areas.types';

type Props = {
  title: string,
  teams: Array<Team>,
  areas: Array<Area>,
  action: (team: Team) => void
};

export const TeamSection = (props: Props): React$Element<any> => (
  <View style={{ marginBottom: 40 }}>
    <Text style={styles.label}>{props.title}</Text>
    {props.teams.map((team, key) => (
      <Row
        key={key}
        action={{
          callback: () => props.action(team),
          icon: nextIcon
        }}
        rowStyle={{ marginBottom: 16 }}
      >
        <View style={styles.tableRowContent}>
          <Text style={styles.tableRowText}>{team.name}</Text>
          {team.areas && team.areas.length > 0 && (
            <Text style={styles.tableRowText}>
              {i18n.t('teams.teamCards.areas')}
              {team.areas
                ?.map(areaID => props.areas.find(area => area.id === areaID)?.name)
                ?.filter(x => x)
                .join(', ')}
            </Text>
          )}
        </View>
      </Row>
    ))}
  </View>
);
