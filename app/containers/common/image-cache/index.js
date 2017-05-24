import { connect } from 'react-redux';
import ImageCache from 'components/common/image-cache';

function mapStateToProps(state) {
  return {
    isConnected: state.offline.online
  };
}

function mapDispatchToProps() {
  return {};
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ImageCache);
