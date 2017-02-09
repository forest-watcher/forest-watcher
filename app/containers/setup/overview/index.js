import { connect } from 'react-redux';

import SetupOverview from 'components/setup/overview';

function mapStateToProps(state) {
  return {
    area: state.setup.area,
    snapshot: state.setup.snapshot,
    user: {
      id: state.user.data.id,
      token: state.user.token
    }
  };
}

function mapDispatchToProps() {
  return {};
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SetupOverview);
