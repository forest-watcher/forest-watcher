import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { setSyncModal as setSyncModalDispatch } from 'redux-modules/app';
import { getTotalActionsPending } from 'helpers/sync';

// Container
function mapStateToProps(state) {
  return {
    syncModalOpen: state.app.syncModalOpen,
    actionsPending: getTotalActionsPending(state),
    loggedIn: state.user.loggedIn
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setSyncModal: (open) => {
      dispatch(setSyncModalDispatch(open));
    }
  };
}

// HOC
function withSync(Component) {
  class WithSyncHOC extends React.Component {

    static propTypes = {
      syncModalOpen: PropTypes.bool.isRequired,
      setSyncModal: PropTypes.func.isRequired,
      actionsPending: PropTypes.number.isRequired,
      loggedIn: PropTypes.bool.isRequired,
      navigator: PropTypes.object.isRequired
    };

    static navigatorStyle = Component.navigatorStyle;
    static navigatorButtons = Component.navigatorButtons;

    constructor(props) {
      super(props);
      this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
    }

    componentDidMount() {
      this.shouldModalOpen();
    }

    onNavigatorEvent = (event) => {
      if (event.id === 'didAppear') {
        this.shouldModalOpen();
      }
    }

    shouldModalOpen() {
      const { actionsPending, syncModalOpen, setSyncModal, loggedIn } = this.props;
      if (actionsPending > 0 && !syncModalOpen && loggedIn) {
        setSyncModal(true);
        this.openModal();
      }
    }

    openModal = () => {
      this.props.navigator.showModal({
        screen: 'ForestWatcher.Sync',
        passProps: {
          goBackDisabled: true
        }
      });
    }

    render() {
      // eslint-disable-next-line no-unused-vars
      const { syncModalOpen, setSyncModal, ...props } = this.props;
      return (
        <Component {...props} />
      );
    }
  }

  return connect(mapStateToProps, mapDispatchToProps)(WithSyncHOC);
}

export default withSync;
