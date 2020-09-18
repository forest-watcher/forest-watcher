// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';
import type { Answer, Report } from 'types/reports.types';

import { connect } from 'react-redux';
import { Platform } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';

import { showNotConnectedNotification, showExportReportsSuccessfulNotification } from 'redux-modules/app';
import { saveReport, uploadReport, deleteReport, setReportAnswer } from 'redux-modules/reports';

import { shouldBeConnected } from 'helpers/app';
import { trackSharedContent } from 'helpers/analytics';
import { getTemplate, mapFormToAnsweredQuestions, mapReportToMetadata } from 'helpers/forms';
import exportReports from 'helpers/exportReports';
import Answers from 'components/form/answers';
import exportBundleFromRedux from 'helpers/sharing/exportBundleFromRedux';
import shareBundle from 'helpers/sharing/shareBundle';
import shareFile from 'helpers/shareFile';

type OwnProps = {|
  reportName: string,
  readOnly: boolean
|};

function mapStateToProps(state: State, ownProps: OwnProps) {
  const { reportName, readOnly } = ownProps;
  const { reports, app } = state;
  const template = getTemplate(reports.list[reportName], reports.templates);
  const templateLang: string = template.languages.includes(app.language) ? app.language : template.defaultLanguage;
  const report = reports.list[reportName];
  const answers = report && report.answers;

  return {
    exportReport: async () => {
      const zippedPath = await exportReports(
        [report],
        { [report?.area?.templateId]: template },
        templateLang,
        Platform.select({
          android: RNFetchBlob.fs.dirs.DownloadDir,
          ios: RNFetchBlob.fs.dirs.DocumentDir
        })
      );

      shareFile(zippedPath);
    },
    results: mapFormToAnsweredQuestions(answers, template, state.app.language),
    metadata: mapReportToMetadata(report, templateLang),
    isConnected: shouldBeConnected(state),
    readOnly
  };
}

const mapDispatchToProps = (dispatch: Dispatch, ownProps: OwnProps) => {
  return {
    deleteReport: () => {
      dispatch(deleteReport(ownProps.reportName));
    },
    exportReportAsBundle: async (ids: Array<string>) => {
      const outputPath = await dispatch(
        exportBundleFromRedux({
          reportIds: [ownProps.reportName]
        })
      );
      trackSharedContent('report');
      await shareBundle(outputPath);
    },
    saveReport: (name: string, data: Report) => {
      dispatch(saveReport(name, data));
    },
    setReportAnswer: (answer: Answer, updateOnly: boolean) => {
      dispatch(setReportAnswer(ownProps.reportName, answer, updateOnly));
    },
    showExportReportsSuccessfulNotification: () => {
      dispatch(showExportReportsSuccessfulNotification());
    },
    showNotConnectedNotification: () => {
      dispatch(showNotConnectedNotification());
    },
    uploadReport: () => {
      dispatch(uploadReport(ownProps.reportName));
    }
  };
};

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(Answers);
