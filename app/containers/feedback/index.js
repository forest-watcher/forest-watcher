import { connect } from 'react-redux';
import { uploadFeedback } from 'redux-modules/feedback';
import { getFormFields } from 'helpers/forms';

import Form from 'components/common/form';

function mapStateToProps(state) {
  return {
    form: state.form
  };
}

function mapDispatchToProps(dispatch) {
  return {
    submitForm: (form, formName) => {
      const fields = getFormFields(form, formName);
      dispatch(uploadFeedback(form, fields));
    }
  };
}

function mergeProps({ form, ...state }, { submitForm, ...dispatch }, ownProps) {
  return {
    ...ownProps,
    ...state,
    ...dispatch,
    finish: formName => submitForm(form, formName)
  };
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Form);

