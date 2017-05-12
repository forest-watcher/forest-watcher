import { connect } from 'react-redux';
import { finishFeedback } from 'redux-modules/feedback';

import Form from 'components/common/form';

function mapDispatchToProps(dispatch) {
  return {
    finish: (form) => {
      dispatch(finishFeedback(form));
    }
  };
}

export default connect(
  null,
  mapDispatchToProps
)(Form);
