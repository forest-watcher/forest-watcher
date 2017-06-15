import { connect } from 'react-redux';
import { uploadFeedback } from 'redux-modules/feedback';

import Form from 'components/common/form';

function mapDispatchToProps(dispatch) {
  return {
    finish: (form) => {
      dispatch(uploadFeedback(form));
    }
  };
}

export default connect(
  null,
  mapDispatchToProps
)(Form);
