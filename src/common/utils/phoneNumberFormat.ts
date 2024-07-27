import { patternFormatter } from 'react-number-format';

export const formatPhoneNumber = (phoneNumber?: string | number | null) => {
	if (!phoneNumber) {
		return '';
	}
	return patternFormatter(String(phoneNumber), { format: '(###) ###-####' });
};
