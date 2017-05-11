import { connect } from 'react-redux';
import { setIsConnected, setLanguage } from 'redux-modules/app';
import { getAreas } from 'redux-modules/areas';
import { getQuestions as getFeedbackQuestions } from 'redux-modules/feedback';
import { getQuestions as getReportQuestions } from 'redux-modules/reports';
import { getCountries } from 'redux-modules/countries';
import { getUser, setLoginModal, setLoginStatus, checkLogged } from 'redux-modules/user';
import Home from 'components/home';

function mapStateToProps(state) {
  return {
    areas: state.areas.data && state.areas.data.length > 0,
    report: Object.keys(state.reports.forms).length > 0,
    dailyFeedback: Object.keys(state.feedback.daily).length > 0,
    weeklyFeedback: Object.keys(state.feedback.weekly).length > 0,
    areasSynced: state.areas.synced,
    language: state.app.language,
    setupComplete: state.app.setupComplete,
    user: {
      loggedIn: state.user.loggedIn,
      token: state.user.token,
      hasData: state.user.data && Object.keys(state.user.data).length > 0
    }
  };
}

function mapDispatchToProps(dispatch, { navigation }) {
  return {
    getUser: () => {
      dispatch(getUser());
    },
    navigateReset: (routeName) => {
      // const action = NavigationActions.reset({
      //   index: 0,
      //   actions: [{
      //     type: 'Navigate',
      //     routeName,
      //     params: {
      //       goBackDisabled: true
      //     }
      //   }]
      // });
      // navigation.dispatch(action);
    },
    setLoginModal: (status) => {
      dispatch(setLoginModal(status));
    },
    setLoginStatus: (status) => {
      dispatch(setLoginStatus(status));
    },
    checkLogged: () => {
      dispatch(checkLogged());
    },
    setIsConnected: (isConnected) => {
      dispatch(setIsConnected(isConnected));
    },
    getAreas: () => {
      dispatch(getAreas());
    },
    getReportQuestions: () => {
      dispatch(getReportQuestions());
    },
    getFeedbackQuestions: (type) => {
      dispatch(getFeedbackQuestions(type));
    },
    getCountries: () => {
      dispatch(getCountries());
    },
    setLanguage: (language) => {
      dispatch(setLanguage(language));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
