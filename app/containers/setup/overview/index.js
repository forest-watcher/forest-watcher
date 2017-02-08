import { connect } from 'react-redux';

import SetupOverview from 'components/setup/overview';

function mapStateToProps(state) {
  return {
    snapshot: state.setup.snapshot
  };
}

function mapDispatchToProps() {
  return {};
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SetupOverview);
