import { connect } from 'react-redux';
import { setIsConnected } from 'redux-modules/app';
import { getAreas } from 'redux-modules/areas';
import { getQuestions as getFeedbackQuestions } from 'redux-modules/feedback';
import { getQuestions as getReportQuestions } from 'redux-modules/reports';
import { getUser, setLoginModal, setLoginStatus, checkLogged } from 'redux-modules/user';
import { setLanguage } from 'redux-modules/app';
import { NavigationActions } from 'react-navigation';
import Home from 'components/home';

function mapStateToProps(state) {
  return {
    areas: state.areas.data && state.areas.data.length > 0,
    report: Object.keys(state.reports.forms).length > 0,
    dailyFeedback: Object.keys(state.feedback.daily).length > 0,
    weeklyFeedback: Object.keys(state.feedback.weekly).length > 0,
    areasSynced: state.areas.synced,
    loggedIn: state.user.loggedIn,
    language: state.app.language
  };
}

function mapDispatchToProps(dispatch, { navigation }) {
  return {
    getUser: () => {
      dispatch(getUser());
    },
    navigateReset: (routeName) => {
      const action = NavigationActions.reset({
        index: 0,
        actions: [{
          type: 'Navigate',
          routeName,
          params: {
            goBackDisabled: true
          }
        }]
      });
      navigation.dispatch(action);
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
    setLanguage: (language) => {
      dispatch(setLanguage(language));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
