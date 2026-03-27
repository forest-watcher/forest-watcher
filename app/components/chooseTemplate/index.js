// @flow

import React, { useEffect, useMemo } from 'react';
import { Platform, Text, View, ScrollView } from 'react-native';
import type { Template } from 'types/reports.types';
import Row from '../common/row';
import dashboardStyles from '../dashboard/styles';
import i18n from 'i18next';
import styles from './styles';
import type { BasicReport } from '../../types/reports.types';
import type { ReportingSource } from '../../helpers/analytics';
import { Navigation } from 'react-native-navigation';
import OptionalWrapper from '../common/wrapper/OptionalWrapper';
const chevronRight = require('assets/next.png');
import { getExplicitDate } from 'helpers/date';

type Props = {
  componentId: string,
  report: BasicReport,
  source: ReportingSource,
  language: string,
  templates: Array<Template>,
  defaultTemplate: Template,
  createReport: (report: BasicReport, source: ReportingSource) => void
};

const listener = ({ buttonId, componentId }) => {
  if (buttonId === 'backButton') {
    Navigation.dismissModal(componentId);
  }
};

export const ChooseTemplate = (props: Props): React$Element<any> => {
  if (props.templates && props.templates.length === 1) {
    props.createReport(
      {
        ...props.report,
        template: props.templates[0]
      },
      props.source
    );
    Navigation.push(props.componentId, {
      component: {
        name: 'ForestWatcher.NewReport',
        passProps: { reportName: props.report.reportName, template: props.templates[0], isModal: true }
      }
    });
    return null;
  }

  useEffect(() => {
    const unsubscribe = Navigation.events().registerNavigationButtonPressedListener(listener, props.componentId);
    return () => {
      unsubscribe.remove();
    };
  }, []);

  /**
   * Row OnPress action and Icon
   */
  const handleRowAction = (template: Template) => ({
    callback: () => {
      props.createReport({ ...props.report, template }, props.source);
      Navigation.push(props.componentId, {
        component: {
          name: 'ForestWatcher.NewReport',
          passProps: { reportName: props.report.reportName, template, isModal: false }
        }
      });
    },
    icon: chevronRight
  });

  /**
   * All templates filtered based on isLatest={true} flag
   */
  const latestTemplates = useMemo(
    () =>
      props.templates && props.templates.length > 0
        ? props.templates
            .filter(template => template.isLatest !== false)
            .sort((a, b) => (a.name[props.language] < b.name[props.language] ? -1 : 1))
            .sort((a, b) => (a.public === b.public ? 0 : a.public ? -1 : 1))
        : [props.defaultTemplate],
    [props.templates]
  );

  return (
    <View style={styles.container}>
      <View style={styles.areaSection}>
        <Text style={styles.label}>{i18n.t('report.choose.subtitle')}</Text>
        <ScrollView contentContainerStyle={styles.listContent} contentInsetAdjustmentBehavior={'always'}>
          {latestTemplates.map((template: Template) => (
            <Row action={handleRowAction(template)} key={template.Id} rowStyle={styles.row}>
              <View>
                <Text style={dashboardStyles.tableRowText}>
                  {template.name[props.language] ?? template.name[template.defaultLanguage]}
                </Text>
                <OptionalWrapper data={template.createdAt && getExplicitDate(template.createdAt)}>
                  <Text style={dashboardStyles.tableRowSubText}>Version {getExplicitDate(template.createdAt)}</Text>
                </OptionalWrapper>
              </View>
            </Row>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

ChooseTemplate.options = (passProps: any): any => {
  return {
    topBar: {
      title: {
        text: i18n.t('report.choose.title')
      },
      leftButtons: [
        {
          id: 'backButton',
          text: i18n.t('commonText.cancel'),
          icon: Platform.select({
            android: require('assets/backButton.png')
          })
        }
      ]
    }
  };
};
