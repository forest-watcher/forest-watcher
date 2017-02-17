import { connect } from 'react-redux';

import Reports from 'components/reports';


function mapStateToProps(state) {
  return {
    answers: state.reports.answers
  };
}

function mapDispatchToProps() {
  return {};
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Reports);
