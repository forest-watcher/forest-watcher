// @flow

export type FAQCategory = {
  icon: *,
  title: string,
  questions: Array<FAQQuestion>
};

export type FAQQuestion = {
	title: string,
	content: FAQQuestionContent
}

export type FAQQuestionContent = {
	description?: ?{ [string]: string },
	orderList?: ?{ [string]: string },
	orderListLetters?: ?{ [string]: { [string]: { description: string, text: string }} }
	footerText?: ?string
}