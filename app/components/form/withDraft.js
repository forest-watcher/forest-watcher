// @flow
import PropTypes from 'prop-types';
import { Alert } from 'react-native';

import CONSTANTS from 'config/constants';
import i18n from 'i18next';
import { Navigation } from 'react-native-navigation';
import { trackReportingConcluded } from 'helpers/analytics';

const saveReportIcon = require('assets/save_for_later.png');

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

type Props = {
  readOnly: boolean,
  componentId: string,
  reportName: string,
  saveReport: string => void
};

function withDraft(WrappedComponent: any) {
  return class withDraftHOC extends WrappedComponent {
    static displayName = `HOC(${getDisplayName(WrappedComponent)})`;

    static options(passProps: {}) {
      const wrappedOptions = WrappedComponent.options(passProps);
      return {
        ...(wrappedOptions || {}),
        topBar: {
          ...(wrappedOptions?.topBar || {}),
          rightButtons: passProps.readOnly
            ? wrappedOptions?.topBar?.rightButtons || []
            : [
                ...(wrappedOptions?.topBar?.rightButtons || []),
                {
                  id: 'draft',
                  icon: saveReportIcon
                }
              ]
        }
      };
    }
    static propTypes = { saveReport: PropTypes.func };

    constructor(props: Props) {
      super(props);
      this.navigationButtonPressed = this.navigationButtonPressed.bind(this);
      Navigation.events().bindComponent(this);
    }

    onPressDraft = () => {
      const { reportName, saveReport, componentId } = this.props;
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
              trackReportingConcluded('saved', 'withDraft');
              Navigation.dismissModal(componentId);
            }
          }
        ],
        { cancelable: false }
      );
    };

    navigationButtonPressed(event) {
      super.navigationButtonPressed?.bind(this)?.(event);
      if (event.buttonId === 'draft') {
        this.onPressDraft();
      }
    }
  };
}

export default withDraft;
