// @flow

import React, { useEffect, useState } from 'react';
import type { Team } from 'types/teams.types';
import { ScrollView } from 'react-native';
import styles from './styles';
import i18n from 'i18next';
import Theme from 'config/theme';
import { Navigation } from 'react-native-navigation';
import { TeamSection } from './teamSection';
import type { Area } from '../../types/areas.types';

type Props = {
  teams: Array<Team>,
  invites: Array<Team>,
  areas: Array<Area>,
  componentId: string
};

const navigateToDetails = (team: Team, componentId: string, invited: boolean = false) => {
  Navigation.push(componentId, {
    component: {
      name: 'ForestWatcher.TeamDetails',
      passProps: {
        team,
        invited
      }
    }
  });
};

const Teams = (props: Props): React$Element<any> => {
  const [joined, setJoined] = useState(props.teams.filter(x => x.userRole === 'monitor'));
  const [managed, setManaged] = useState(
    props.teams.filter(x => x.userRole === 'manager' || x.userRole === 'administrator')
  );

  useEffect(
    () => {
      setJoined(props.teams.filter(x => x.userRole === 'monitor'));
      setManaged(props.teams.filter(x => x.userRole === 'manager' || x.userRole === 'administrator'));
    },
    [props.teams.length]
  );

  return (
    <ScrollView
      style={styles.list}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      {props.invites.length > 0 && (
        <TeamSection
          teams={props.invites}
          areas={props.areas}
          title={i18n.t('teams.sectionTitles.invites')}
          action={team => navigateToDetails(team, props.componentId, true)}
        />
      )}

      {joined.length > 0 && (
        <TeamSection
          teams={joined}
          areas={props.areas}
          title={i18n.t('teams.sectionTitles.joined')}
          action={team => navigateToDetails(team, props.componentId)}
        />
      )}

      {managed.length > 0 && (
        <TeamSection
          teams={managed}
          areas={props.areas}
          title={i18n.t('teams.sectionTitles.managed')}
          action={team => navigateToDetails(team, props.componentId)}
        />
      )}
    </ScrollView>
  );
};

Teams.options = (passProps: {}): any => {
  return {
    topBar: {
      background: {
        color: Theme.colors.veryLightPink
      },
      title: {
        text: i18n.t('teams.titles.teamOverviewTitle')
      }
    }
  };
};

export { Teams };
