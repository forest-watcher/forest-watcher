import i18n from 'locales';

const reportNameRegex = /-([A-Z]+)-REPORT--\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d/g;

/**
 * Converts a report name, to a readable, localised string
 * @param {string} reportName - The report name to convert
 * @return {string} A localised, readable version of the string
 */
export function readableNameForReportName(reportName: string) {
	// Using a full regex match for the end of the report name here including data so if user names there area something like SAMS-WIGGLY-REPORT 
	// it doesn't intefere with our logic
	const result = reportNameRegex.exec(reportName);
	if (!result || result.length < 2) {
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