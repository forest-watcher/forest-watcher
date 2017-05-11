import { connect } from 'react-redux';
import { finishFeedback } from 'redux-modules/feedback';

import NewReport from 'components/reports/new';

function mapStateToProps() {
  return {};
}

function mapDispatchToProps(dispatch) {
  return {
    finish: (form) => {
      dispatch(finishFeedback(form));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NewReport);
