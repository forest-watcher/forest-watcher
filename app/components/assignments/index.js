// @flow
import type { Assignment } from 'types/assignments.types';

import React, { useCallback, useEffect, useState } from 'react';
import EmptyState from 'components/common/empty-state';
import { ScrollView, View, Text } from 'react-native';
import styles from './styles';
import { Navigation } from 'react-native-navigation';

import i18n from 'i18next';
import { AssignmentRow } from './AssignmentRow';
import type { Area } from 'types/areas.types';
import { ASSIGNMENT_PRIORITY } from '../../types/assignments.types';
import { trackScreenView } from 'helpers/analytics';

interface Props {
  assignments: Array<Assignment>;
  componentId: string;
  areas: Array<Area>;
}
const emptyIcon = require('assets/assignmentEmpty.png');

export const Assignments = (props: Props): React$Element<any> => {
  const [highPriority, setHighPriority] = useState(
    props.assignments.filter(x => x.priority === ASSIGNMENT_PRIORITY.HIGH && x.status !== 'on hold')
  );
  const [normalPriority, setNormalPriority] = useState(
    props.assignments.filter(x => x.priority === ASSIGNMENT_PRIORITY.NORMAL && x.status !== 'on hold')
  );
  const [onHold, setOnhold] = useState(props.assignments.filter(x => x.status === 'on hold'));

  useEffect(
    () => {
      setHighPriority(props.assignments.filter(x => x.priority === ASSIGNMENT_PRIORITY.HIGH && x.status !== 'on hold'));
      setNormalPriority(
        props.assignments.filter(x => x.priority === ASSIGNMENT_PRIORITY.NORMAL && x.status !== 'on hold')
      );
      setOnhold(props.assignments.filter(x => x.status === 'on hold'));
      const open = props.assignments.filter(x => x.status !== 'on hold').length;
      Navigation.mergeOptions(props.componentId, {
        topBar: {
          title: {
            text:
              open > 0
                ? i18n.t('assignments.titles.assignments', { count: open })
                : i18n.t('assignments.titles.assignments_nocount')
          }
        }
      });
    },
    [props.assignments]
  );

  useEffect(() => trackScreenView('Assignments'), []);

  const goToDetails = useCallback((assignment: Assignment) => {
    Navigation.push(props.componentId, {
      component: {
        name: 'ForestWatcher.AssignmentDetails',
        passProps: {
          assignment
        }
      }
    });
  });

  if (props.assignments.length === 0) {
    return (
      <View style={styles.containerEmpty}>
        <EmptyState
          actionTitle={i18n.t('assignments.empty.action')}
          body={i18n.t('assignments.empty.subtitle')}
          onActionPress={() => {
            Navigation.push(props.componentId, {
              component: {
                name: 'ForestWatcher.FaqCategories'
              }
            });
          }}
          icon={emptyIcon}
          title={i18n.t('assignments.empty.title')}
        />
      </View>
    );
  } else {
    return (
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {highPriority.length > 0 && (
          <>
            <Text style={styles.label}>{i18n.t('assignments.labels.high')}</Text>
            {highPriority.map((assignment, key) => (
              <AssignmentRow
                key={key}
                onPress={() => goToDetails(assignment)}
                assignment={assignment}
                areaName={props.areas.find(x => x.id === assignment.areaId)?.name || ''}
              />
            ))}
          </>
        )}
        {normalPriority.length > 0 && (
          <>
            <Text style={[styles.label, { marginTop: 12 }]}>{i18n.t('assignments.labels.normal')}</Text>
            {normalPriority.map((assignment, key) => (
              <AssignmentRow
                key={key}
                onPress={() => goToDetails(assignment)}
                assignment={assignment}
                areaName={props.areas.find(x => x.id === assignment.areaId)?.name || ''}
              />
            ))}
          </>
        )}
        {onHold.length > 0 && (
          <>
            <Text style={[styles.label, { marginTop: 12 }]}>{i18n.t('assignments.labels.onhold')}</Text>
            {onHold.map((assignment, key) => (
              <AssignmentRow
                key={key}
                onPress={() => goToDetails(assignment)}
                assignment={assignment}
                areaName={props.areas.find(x => x.id === assignment.areaId)?.name || ''}
              />
            ))}
          </>
        )}
      </ScrollView>
    );
  }
};

Assignments.options = (passProps: { openAssignments: number }): any => {
  return {
    topBar: {
      title: {
        text:
          passProps.openAssignments > 0
            ? i18n.t('assignments.titles.assignments', { count: passProps.openAssignments })
            : i18n.t('assignments.titles.assignments_nocount')
      }
    }
  };
};
