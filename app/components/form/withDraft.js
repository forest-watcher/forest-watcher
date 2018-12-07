// @flow
import PropTypes from 'prop-types';
import { Alert } from 'react-native';

import CONSTANTS from 'config/constants';
import i18n from 'locales';
import { Navigation } from 'react-native-navigation';

const saveReportIcon = require('assets/save_for_later.png');

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

type Props = {
  disableDraft: boolean,
  componentId: string,
  reportName: string,
  saveReport: string => void
};

function withDraft(WrappedComponent: any) {
  return class withDraftHOC extends WrappedComponent {
    static displayName = `HOC(${getDisplayName(WrappedComponent)})`;

    static options(passProps) {
      const wrappedOptions = WrappedComponent.options(passProps);
      return {
        ...(wrappedOptions || {}),
        topBar: {
          ...(wrappedOptions?.topBar || {}),
          rightButtons: passProps.disableDraft
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
              Navigation.popToRoot(componentId, {
                animations: {
                  popToRoot: {
                    enabled: false
                  }
                }
              });
              Navigation.push(componentId, {
                animations: {
                  push: {
                    enabled: false
                  }
                },
                component: {
                  name: 'ForestWatcher.Reports'
                }
              });
            }
          }
        ],
        { cancelable: false }
      );
    };

    navigationButtonPressed({ buttonId }) {
      if (buttonId === 'draft') {
        this.onPressDraft();
      }
    }
  };
}

export default withDraft;
