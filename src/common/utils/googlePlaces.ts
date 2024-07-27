import { State } from '@prisma/client';
import parser from 'parse-address';

export type ParsedPlaceDetails = {
	name: string;
	city: string;
	county?: string;
	state: State;
	zip: string;
};

export const getAddressComponents = (googlePlaceResult: google.maps.places.PlaceResult): ParsedPlaceDetails => {
	if (!googlePlaceResult.name) throw new Error('Address name not found');
	if (!googlePlaceResult.address_components) throw new Error('Address components not found');

	const city = googlePlaceResult.address_components.find(
		(component) => component.types.includes('locality') || component.types.includes('postal_town'),
	);
	if (!city) throw new Error('City not found');

	const county = googlePlaceResult.address_components.find((component) =>
		component.types.includes('administrative_area_level_2'),
	);

	const state = googlePlaceResult.address_components.find((component) =>
		component.types.includes('administrative_area_level_1'),
	);
	if (!state) throw new Error('State not found');

	const zip = googlePlaceResult.address_components.find((component) => component.types.includes('postal_code'));
	if (!zip) throw new Error('Zip not found');

	return {
		name: googlePlaceResult.name,
		city: city?.long_name,
		county: county?.long_name.replace(/\s+County$/, '').trim(),
		state: state?.short_name as State,
		zip: zip?.long_name,
	};
};

/*
 * Checks if two addresses are equal by ignoring the country and zip code.
 * This is useful when comparing a Google Places address to one that is constructed from
 * its components (address1, city, state, zip) stored in our database.
 */
export const addressesAreEqual = (address1: string, address2: string): boolean => {
	const optionLocation = parser.parseLocation(address1);
	const valueLocation = parser.parseLocation(address2);
	if (!optionLocation || !valueLocation) return false;
	return (
		optionLocation.number === valueLocation.number &&
		optionLocation.street === valueLocation.street &&
		optionLocation.city === valueLocation.city &&
		optionLocation.state === valueLocation.state
	);
};
