import { connect } from 'react-redux';

import Reports from 'components/reports';

const list = [
  {
    title: 'Melako Community #1',
    position: '40.442529, -3.696101',
    date: '26DEC 14:38'
  },
  {
    title: 'Melako Community #2',
    position: '40.442529, -3.696101',
    date: '26DEC 14:38'
  },
  {
    title: 'Melako Community #3',
    position: '40.442529, -3.696101',
    date: '26DEC 14:38'
  }
];

function mapStateToProps() {
  return {
    drafts: list,
    uploaded: list,
    completed: list
  };
}

function mapDispatchToProps() {
  return {};
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Reports);
