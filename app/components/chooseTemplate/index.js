// @flow

import React, { useEffect } from 'react';
import { Platform, Text, View } from 'react-native';
import type { Template } from 'types/reports.types';
import List from 'components/common/list';
import i18n from 'i18next';
import styles from './styles';
import Theme from 'config/theme';
import type { BasicReport } from '../../types/reports.types';
import type { ReportingSource } from '../../helpers/analytics';
import { Navigation } from 'react-native-navigation';

type Props = {
  componentId: string,
  defaultTemplate: Template,
  report: BasicReport,
  source: ReportingSource,
  language: string,
  createReport: (report: BasicReport, source: ReportingSource) => void
};

const listener = ({ buttonId, componentId }) => {
  if (buttonId === 'backButton') {
    Navigation.dismissModal(componentId);
  }
};

export const ChooseTemplate = (props: Props): React$Element<any> => {
  const templates = [
    props.defaultTemplate,
    ...props.report.area.reportTemplate?.filter(x => x.id !== props.defaultTemplate.id)
  ];
  if (templates.length === 1) {
    props.createReport(
      {
        ...props.report,
        template: templates[0]
      },
      props.source
    );
    Navigation.push(props.componentId, {
      component: {
        name: 'ForestWatcher.NewReport',
        passProps: { reportName: props.report.reportName, template: templates[0], isModal: true }
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

  return (
    <View style={styles.container}>
      <View style={styles.areaSection}>
        <Text style={styles.label}>{i18n.t('report.choose.subtitle')}</Text>
        <List
          content={templates.map((template: Template) => ({
            text: template.name[props.language] ?? template.name[template.defaultLanguage],
            functionOnPress: () => {
              props.createReport(
                {
                  ...props.report,
                  template
                },
                props.source
              );
              Navigation.push(props.componentId, {
                component: {
                  name: 'ForestWatcher.NewReport',
                  passProps: { reportName: props.report.reportName, template, isModal: false }
                }
              });
            }
          }))}
          bigSeparation={false}
        />
      </View>
    </View>
  );
};

ChooseTemplate.options = (passProps: any): any => {
  return {
    topBar: {
      background: {
        color: Theme.colors.veryLightPink
      },
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
