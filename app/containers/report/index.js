import { connect } from 'react-redux';
import { navigatePop } from 'redux-modules/navigation';
import { getQuestions } from 'redux-modules/report';

import Report from 'components/report';

function mapStateToProps(state) {
  return {
    questions: state.report.forms.questions || []
  };
}

function mapDispatchToProps(dispatch) {
  return {
    navigateBack: (action) => {
      dispatch(navigatePop(action));
    },
    getQuestions: () => {
      dispatch(getQuestions());
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Report);
