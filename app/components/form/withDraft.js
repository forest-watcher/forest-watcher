// @flow
import PropTypes from 'prop-types';
import {
  Alert
} from 'react-native';

import CONSTANTS from 'config/constants';
import i18n from 'locales';

const saveReportIcon = require('assets/save_for_later.png');

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

type Props = {
  disableDraft: boolean,
  navigator: any,
  reportName: string,
  saveReport: string => void
};

function withDraft(WrappedComponent: any) {
  return class withDraftHOC extends WrappedComponent {
    static displayName = `HOC(${getDisplayName(WrappedComponent)})`;
    static navigatorStyle = WrappedComponent.navigatorStyle;
    static navigatorButtons = WrappedComponent.navigatorButtons;
    static propTypes = { saveReport: PropTypes.func };

    constructor(props: Props) {
      super(props);
      if (!this.props.disableDraft) {
        const navButtons = WrappedComponent.navigatorButtons || {};
        navButtons.rightButtons = navButtons.rightButtons || [];
        navButtons.leftButtonst = navButtons.rightButtons || [];
        this.props.navigator.setButtons({
          rightButtons: [
            ...navButtons.rightButtons,
            { icon: saveReportIcon, id: 'draft' }
          ],
          leftButtons: navButtons.leftButtons
        });
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
      }
    }

    onPressDraft = () => {
      const { reportName, saveReport, navigator } = this.props;
      Alert.alert(
        i18n.t('report.saveLaterTitle'),
        i18n.t('report.saveLaterDescription'),
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'OK',
            onPress: () => {
              if (saveReport) {
                saveReport(reportName, {
                  status: CONSTANTS.status.draft
                });
              }
              navigator.popToRoot({ animated: false });
              navigator.push({
                animated: false,
                screen: 'ForestWatcher.Reports',
                title: i18n.t('dashboard.myReports')
              });
            }
          }
        ],
        { cancelable: false }
      );
    };

    onNavigatorEvent = (event: { type: string, id: string }) => {
      if (super.onNavigatorEvent) super.onNavigatorEvent(event);
      if (event.type === 'NavBarButtonPress') {
        if (event.id === 'draft') this.onPressDraft();
      }
    }
  };
}

export default withDraft;
