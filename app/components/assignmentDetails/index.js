// @flow

import styles from './styles';
import Theme from 'config/theme';

import i18n from 'i18next';
import { Image, ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import Row from 'components/common/row';
import BottomTray from 'components/common/bottom-tray';
import ActionButton from 'components/common/action-button';
import React, { useEffect, useState } from 'react';

import {
  type Assignment,
  ASSIGNMENTS_STATUS_TITLE,
  getAssignmentLocationTitle,
  getAssignmentLocations
} from 'types/assignments.types';
import type { Area } from 'types/areas.types';
import { pushMapScreen } from 'screens/maps';
import { Navigation } from 'react-native-navigation';
import { trackAssignmentOnHold, trackAssignmentStarted } from 'helpers/analytics';

interface Props {
  componentId: string;
  assignment: Assignment;
  area: ?Area;
  syncing: boolean;
  appSyncing: number;
  setOnHold: (assignment: Assignment, onHold: boolean) => void;
}

const checkOnIcon = require('assets/checkbox_on.png');
const checkOffIcon = require('assets/checkbox_off.png');

/* Determines whether we need to pop this screen or not */
let shouldPop = false;

export const AssignmentDetails = (props: Props): React$Element<any> => {
  /* When an assignment is completed, we remove it from the list - So we should pop the details screen if it no longer exists */
  useEffect(() => {
    const unsubscribe = Navigation.events().registerComponentDidAppearListener(event => {
      if ((shouldPop || !props.assignment) && event.componentName === 'ForestWatcher.AssignmentDetails') {
        Navigation.pop(props.componentId);
      }
    }, props.componentId);
    return () => {
      unsubscribe.remove();
    };
  }, []);

  useEffect(
    () => {
      if (!props.assignment) {
        shouldPop = true;
      }
    },
    [props.assignment]
  );

  const [onHold, setOnHold] = useState(props.assignment?.status === 'on hold');
  useEffect(
    () => {
      setOnHold(props.assignment?.status === 'on hold');
    },
    [props.assignment?.status]
  );

  if (!props.assignment) {
    return null;
  } else {
    /* Reset `shouldPop` in case it was set before */
    shouldPop = false;
  }

  const location = getAssignmentLocationTitle(props.assignment)
    .filter(x => x)
    .join(', ');

  return (
    <View style={styles.container}>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        <Image source={{ uri: props.assignment.image }} style={{ width: '100%', height: 148 }} />
        <Text style={styles.label}>{i18n.t('assignments.details.details')}</Text>
        <Row rowStyle={{ marginBottom: 6 }}>
          <View style={styles.tableRowContent}>
            <Text style={styles.tableRowText}>{props.area?.name}</Text>
            <Text style={styles.tableRowText}>{props.assignment.createdAt.split('T')[0]}</Text>
            <Text style={styles.tableRowText}>{location}</Text>
            <Text style={styles.tableRowText}>{ASSIGNMENTS_STATUS_TITLE(props.assignment.status)}</Text>
          </View>
        </Row>
        <Text style={styles.label}>{i18n.t('assignments.details.monitors')}</Text>
        <Row rowStyle={{ marginBottom: 6 }}>
          <View style={styles.tableRowContent}>
            {props.assignment.monitorNames.map((m, k) => (
              <Text key={k} style={styles.tableRowText}>
                {m.name}
              </Text>
            ))}
          </View>
        </Row>
        {props.assignment.notes !== '' && (
          <>
            <Text style={styles.label}>{i18n.t('assignments.details.notes')}</Text>
            <Row rowStyle={{ marginBottom: 6 }}>
              <View style={styles.tableRowContent}>
                <Text style={styles.tableRowText}>{props.assignment.notes}</Text>
              </View>
            </Row>
          </>
        )}
        <Text style={styles.label}>{i18n.t('assignments.details.status')}</Text>
        <Row rowStyle={{ marginBottom: 6 }}>
          <View style={styles.tableRowContent}>
            <Text style={styles.tableRowText}>{ASSIGNMENTS_STATUS_TITLE(props.assignment.status)}</Text>
          </View>
        </Row>

        <TouchableOpacity
          disabled={props.syncing || props.appSyncing > 0}
          style={[styles.tableRowContent, styles.row]}
          onPress={() => {
            if (onHold) {
              trackAssignmentOnHold();
            }
            setOnHold(!onHold);
            props.setOnHold(props.assignment, !onHold);
          }}
          activeOpacity={1}
        >
          <View style={styles.onholdContainer}>
            <Text style={styles.onHoldText}>{i18n.t('assignments.details.markOnHold')}</Text>
            <Image source={onHold ? checkOnIcon : checkOffIcon} />
          </View>
        </TouchableOpacity>
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
        {props.syncing ? (
          <View style={styles.loading}>
            <ActivityIndicator color={Theme.colors.turtleGreen} style={{ height: 40 }} size="large" />
          </View>
        ) : (
          <ActionButton
            disabled={props.appSyncing > 0}
            style={{ height: 48 }}
            noIcon
            onPress={() => {
              trackAssignmentStarted();
              pushMapScreen(props.componentId, {
                areaId: props.assignment.areaId,
                templates: props.assignment.templates
                  .filter(x => x !== null)
                  .map(item => ({
                    ...item,
                    assignmentId: props.assignment.id
                  })),
                preSelectedAlerts: getAssignmentLocations(props.assignment)
              });
            }}
            secondary={false}
            text={i18n.t('assignments.details.startAssignment')}
          />
        )}
      </BottomTray>
    </View>
  );
};

AssignmentDetails.options = (passProps: { assignment: Assignment }): any => {
  return {
    topBar: {
      title: {
        text: i18n.t('assignments.titles.assignmentDetails', { name: passProps.assignment.name })
      }
    }
  };
};
