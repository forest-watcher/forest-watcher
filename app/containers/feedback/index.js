import { connect } from 'react-redux';
import { uploadFeedback } from 'redux-modules/feedback';
import { getFormFields, getAnswers } from 'helpers/forms';

import Form from 'components/common/form';

function mapStateToProps(state) {
  return {
    form: state.form,
    feedback: state.feedback
  };
}

function mapDispatchToProps(dispatch) {
  return {
    submitForm: (form, formName, answers) => {
      const fields = getFormFields(form, answers);
      dispatch(uploadFeedback(formName, fields));
    }
  };
}

function mergeProps({ form, feedback, ...state }, { submitForm, ...dispatch }, ownProps) {
  return {
    ...ownProps,
    ...state,
    ...dispatch,
    finish: (formName) => {
      const answers = getAnswers(form, formName);
      submitForm(feedback[formName], formName, answers);
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Form);

