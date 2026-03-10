//@flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';
import { connect } from 'react-redux';
import { ChooseTemplate } from 'components/chooseTemplate';
import type { BasicReport, Template } from 'types/reports.types';
import { type ReportingSource, trackReportingStarted } from 'helpers/analytics';
import { createReport } from 'redux-modules/reports';

type OwnProps = {|
  componentId: string,
  report: BasicReport,
  source: ReportingSource,
  templates: Array<Template>
|};

function mapStateToProps(state: State, props: OwnProps) {
  return {
    language: state.app.language || 'en',
    defaultTemplate: state.reports.templates.default
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    createReport: (report: BasicReport, source: ReportingSource) => {
      dispatch(createReport(report));
      let numAlertsInReport = 0;
      if (report.clickedPosition) {
        const parsedAlerts = JSON.parse(report.clickedPosition);
        numAlertsInReport = parsedAlerts.length;
      }
      trackReportingStarted(numAlertsInReport, source);
    }
  };
}

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default (connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(ChooseTemplate): Class<any> & ((props: any) => React$Element<any>));
