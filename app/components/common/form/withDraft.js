import PropTypes from 'prop-types';
import {
  Alert
} from 'react-native';

import CONSTANTS from 'config/constants';
import I18n from 'locales';

const saveReportIcon = require('assets/save_for_later.png');

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

function withDraft(WrappedComponent) {
  return class withDraftHOC extends WrappedComponent {
    static displayName = `HOC(${getDisplayName(WrappedComponent)})`;
    static navigatorStyle = WrappedComponent.navigatorStyle;
    static navigatorButtons = WrappedComponent.navigatorButtons;
    static propTypes = { saveReport: PropTypes.func };

    constructor(props) {
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
      const { form } = this.props;
      Alert.alert(
        I18n.t('report.saveLaterTitle'),
        I18n.t('report.saveLaterDescription'),
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'OK',
            onPress: () => {
              if (this.props.saveReport) {
                this.props.saveReport(form, {
                  status: CONSTANTS.status.draft
                });
              }
              this.props.navigator.popToRoot({ animate: true });
            }
          }
        ],
        { cancelable: false }
      );
    };

    onNavigatorEvent = (event) => {
      if (super.onNavigatorEvent) super.onNavigatorEvent(event);
      if (event.type === 'NavBarButtonPress') {
        if (event.id === 'draft') this.onPressDraft();
      }
    }
  };
}

export default withDraft;
