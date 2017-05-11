
export const getBtnTextByType = (type) => {
  switch (type) {
    case 'text':
      return 'report.inputText';
    case 'radio':
      return 'report.inputRadio';
    case 'select':
      return 'report.inputSelect';
    default:
      return 'report.input';
  }
};

export const getBtnTextByPosition = (position, total) => {
  return position < total ? 'commonText.next' : 'commonText.save';
};

export default { getBtnTextByType, getBtnTextByPosition };