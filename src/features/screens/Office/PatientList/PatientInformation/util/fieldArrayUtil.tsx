import { FieldArrayWithId } from 'react-hook-form';

export const getAddButtonTextForFieldArray = (
	fields: FieldArrayWithId[],
	singular: string,
	plural?: string,
	isOptional?: boolean,
) => {
	return `Add ${fields.length === 0 ? singular : plural ?? 'Another'}${isOptional ? ' (Optional)' : ''}`;
};
