import { connect } from 'react-redux';
import { shouldBeConnected } from 'helpers/app';
import ImageCache from 'components/common/image-cache';

function mapStateToProps(state) {
  return {
    isConnected: shouldBeConnected(state)
  };
}

function mapDispatchToProps() {
  return {};
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ImageCache);
