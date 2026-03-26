// @flow

import React, { useEffect, useState } from 'react';
import type { Team } from 'types/teams.types';
import styles from './styles';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import Row from 'components/common/row';
import BottomTray from 'components/common/bottom-tray';
import ActionButton from 'components/common/action-button';
import i18n from 'i18next';
import Theme from 'config/theme';
import type { TeamActionType } from '../../types/teams.types';
import { Navigation } from 'react-native-navigation';
import type { Area } from '../../types/areas.types';
import showDeleteModal from '../../helpers/showDeleteModal';

type Props = {
  componentId: string,
  team: Team,
  areas: Array<Area>,
  invited: boolean,
  offlineMode: boolean,
  syncing: boolean,
  appSyncing: number,
  performTeamAction: (teamId: string, action: TeamActionType) => void,
  updateApp: () => void
};

export const TeamDetails = (props: Props): React$Element<any> => {
  const monitors = props.team.members?.filter(x => x.role === 'monitor') || [];
  const managers = props.team.members?.filter(x => x.role === 'manager' || x.role === 'administrator') || [];
  const areas = props.team.areas?.map(areaID => props.areas.find(area => area.id === areaID)?.name)?.filter(x => x);
  const [actionPerformed, setActionPerformed] = useState(false);

  useEffect(
    () => {
      if (actionPerformed && !props.syncing) {
        props.updateApp();
        Navigation.pop(props.componentId);
      }
    },
    [props.syncing]
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        <Text style={styles.label}>{i18n.t('teams.teamDetails.teamNameLabel')}</Text>
        <Row rowStyle={{ marginBottom: 6 }}>
          <View style={styles.tableRowContent}>
            <Text style={styles.tableRowText}>{props.team.name}</Text>
          </View>
        </Row>
        {areas && areas.length > 0 && (
          <>
            <Text style={{ ...styles.label, marginTop: 40 }}>{i18n.t('teams.teamDetails.teamAreasLabel')}</Text>
            {areas.map((area, key) => (
              <Row key={key} rowStyle={{ marginBottom: 0 }}>
                <View style={styles.tableRowContent}>
                  <Text style={styles.tableRowText}>{area}</Text>
                </View>
              </Row>
            ))}
          </>
        )}
        {monitors.length > 0 && (
          <>
            <Text style={{ ...styles.label, marginTop: 40 }}>{i18n.t('teams.teamDetails.teamMonitorsLabel')}</Text>
            {monitors.map((member, key) => (
              <Row key={key} rowStyle={{ marginBottom: 0 }}>
                <View style={styles.tableRowContent}>
                  {member.name && <Text style={styles.tableRowText}>{member.name}</Text>}
                  <Text style={styles.tableRowText}>{member.email}</Text>
                </View>
              </Row>
            ))}
          </>
        )}
        {managers.length > 0 && (
          <>
            <Text style={{ ...styles.label, marginTop: 40 }}>{i18n.t('teams.teamDetails.teamManagersLabel')}</Text>
            {managers.map((member, key) => (
              <Row key={key} rowStyle={{ marginBottom: 0 }}>
                <View style={styles.tableRowContent}>
                  {member.name && <Text style={styles.tableRowText}>{member.name}</Text>}
                  <Text style={styles.tableRowText}>{member.email}</Text>
                </View>
              </Row>
            ))}
          </>
        )}
      </ScrollView>
      <BottomTray
        showProgressBar={false}
        requiresSafeAreaView={true}
        style={{
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'space-between'
        }}
      >
        {props.appSyncing > 0 && <Text style={styles.error}>{i18n.t('commonText.syncingNotice')}</Text>}
        {props.syncing && actionPerformed ? (
          <View style={styles.loading}>
            <ActivityIndicator color={Theme.colors.turtleGreen} style={{ height: 80 }} size="large" />
          </View>
        ) : !props.invited ? (
          <ActionButton
            disabled={props.offlineMode || props.appSyncing > 0}
            style={{ height: 48 }}
            noIcon
            onPress={() => {
              showDeleteModal(
                i18n.t('teams.teamDetails.leaveConfirmationTitle'),
                i18n.t('teams.teamDetails.leaveConfirmation'),
                i18n.t('commonText.cancel'),
                i18n.t('commonText.confirm'),
                () => {
                  props.performTeamAction(props.team.id, 'leave');
                  setActionPerformed(true);
                }
              );
            }}
            secondary={false}
            text={i18n.t('teams.teamDetails.buttonLeaveTeam')}
          />
        ) : (
          <>
            <ActionButton
              disabled={props.offlineMode || props.appSyncing > 0}
              style={{ marginBottom: 4, height: 48 }}
              noIcon
              onPress={() => {
                showDeleteModal(
                  i18n.t('teams.teamDetails.joinConfirmationTitle'),
                  i18n.t('teams.teamDetails.joinConfirmation'),
                  i18n.t('commonText.cancel'),
                  i18n.t('commonText.confirm'),
                  () => {
                    props.performTeamAction(props.team.id, 'accept');
                    setActionPerformed(true);
                  }
                );
              }}
              secondary={false}
              text={i18n.t('teams.teamDetails.buttonJoinTeam')}
            />
            <ActionButton
              disabled={props.offlineMode || props.appSyncing > 0}
              style={{ marginTop: 4, height: 48 }}
              noIcon
              onPress={() => {
                showDeleteModal(
                  i18n.t('teams.teamDetails.declineConfirmationtitle'),
                  i18n.t('teams.teamDetails.declineConfirmation'),
                  i18n.t('commonText.cancel'),
                  i18n.t('commonText.confirm'),
                  () => {
                    props.performTeamAction(props.team.id, 'decline');
                    setActionPerformed(true);
                  }
                );
              }}
              secondary={true}
              text={i18n.t('teams.teamDetails.buttonDontJoinTeam')}
            />
          </>
        )}
      </BottomTray>
    </View>
  );
};

TeamDetails.options = (passProps: {}): any => {
  return {
    topBar: {
      title: {
        text: i18n.t('teams.titles.teamDetailsTitle')
      }
    }
  };
};
