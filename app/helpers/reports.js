import type { Report } from 'types/report.types';
import i18n from 'locales';

export function readableNameForReport(report: Report) {
	const { reportName } =  report;
	// Using a full regex match for the end of the report name here including data so if user names there area something like SAMS-WIGGLY-REPORT 
	// it doesn't intefere with our logic
	const regex = /-([A-Z]+)-REPORT--\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d/g;
	const result = regex.exec(reportName);
	if (!result) {
		return reportName;
	}
	switch (result[1]) {
		case "VIIRS":
			return i18n.t('report.viirs');
		break;
		case "GLAD":
			return i18n.t('report.glad');
		break;
		default:
		return reportName;
	}
}