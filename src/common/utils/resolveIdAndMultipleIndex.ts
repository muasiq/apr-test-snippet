export const resolveIdAndMultipleIndex = (questionId: string): { resolvedQuestionId: string; index?: number } => {
	if (questionId.includes('-#')) {
		const [resolvedQuestionId, index] = questionId.split('-#');
		if (!index || !resolvedQuestionId) {
			return { resolvedQuestionId: questionId };
		}
		return { resolvedQuestionId, index: parseInt(index) };
	}
	return { resolvedQuestionId: questionId };
};
