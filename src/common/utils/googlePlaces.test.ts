import { expect, it } from '@jest/globals';
import { addressesAreEqual, getAddressComponents } from './googlePlaces';

const googlePlaceDetails = {
	address_components: [
		{
			long_name: '1424',
			short_name: '1424',
			types: ['street_number'],
		},
		{
			long_name: 'Highland Park Boulevard',
			short_name: 'Highland Park Blvd',
			types: ['route'],
		},
		{
			long_name: 'Northwest Oklahoma City',
			short_name: 'NW OKC',
			types: ['neighborhood', 'political'],
		},
		{
			long_name: 'Oklahoma City',
			short_name: 'Oklahoma City',
			types: ['locality', 'political'],
		},
		{
			long_name: 'Oklahoma County',
			short_name: 'Oklahoma County',
			types: ['administrative_area_level_2', 'political'],
		},
		{
			long_name: 'Oklahoma',
			short_name: 'OK',
			types: ['administrative_area_level_1', 'political'],
		},
		{
			long_name: 'United States',
			short_name: 'US',
			types: ['country', 'political'],
		},
		{
			long_name: '73114',
			short_name: '73114',
			types: ['postal_code'],
		},
	],
	formatted_address: '1424 Highland Park Blvd, Oklahoma City, OK 73114, USA',
	name: '1424 Highland Park Blvd',
	place_id: 'ChIJ9be8zg8csocRFyYxhc0gIzE',
};

describe('googlePlaces', () => {
	describe('getAddressComponents', () => {
		function removeAddressComponent(componentName: string) {
			return {
				...googlePlaceDetails,
				address_components: googlePlaceDetails.address_components.filter(
					(component) => !component.types.includes(componentName),
				),
			};
		}

		it('should split a Google place object into parts', () => {
			expect(getAddressComponents(googlePlaceDetails)).toEqual({
				name: '1424 Highland Park Blvd',
				city: 'Oklahoma City',
				county: 'Oklahoma',
				state: 'OK',
				zip: '73114',
			});
		});

		it('should throw an error if the city is missing', () => {
			const invalidGooglePlaceDetails = {
				...googlePlaceDetails,
				address_components: googlePlaceDetails.address_components.filter(
					(component) => !component.types.includes('locality'),
				),
			};
			expect(() => getAddressComponents(invalidGooglePlaceDetails)).toThrowError();
		});

		it('should throw an error if the state is missing', () => {
			const googlePlaceDetailsWithoutState = removeAddressComponent('administrative_area_level_1');
			expect(() => getAddressComponents(googlePlaceDetailsWithoutState)).toThrowError();
		});

		it('should throw an error if the zip is missing', () => {
			const googlePlaceDetailsWithoutZip = removeAddressComponent('postal_code');
			expect(() => getAddressComponents(googlePlaceDetailsWithoutZip)).toThrowError();
		});

		it('should not end with the word "County" in the county name', () => {
			const googlePlaceDetailsWithCounty = {
				...googlePlaceDetails,
				address_components: googlePlaceDetails.address_components.map((component) => {
					if (component.types.includes('administrative_area_level_2')) {
						return {
							...component,
							long_name: 'Oklahoma County',
						};
					}
					return component;
				}),
			};
			expect(getAddressComponents(googlePlaceDetailsWithCounty)).toEqual({
				name: '1424 Highland Park Blvd',
				city: 'Oklahoma City',
				county: 'Oklahoma',
				state: 'OK',
				zip: '73114',
			});
		});

		it('should only strip the word "County" from the end of the county name', () => {
			const googlePlaceDetailsWithCounty = {
				...googlePlaceDetails,
				address_components: googlePlaceDetails.address_components.map((component) => {
					if (component.types.includes('administrative_area_level_2')) {
						return {
							...component,
							long_name: 'The County of Oklahoma County',
						};
					}
					return component;
				}),
			};
			expect(getAddressComponents(googlePlaceDetailsWithCounty)).toEqual({
				name: '1424 Highland Park Blvd',
				city: 'Oklahoma City',
				county: 'The County of Oklahoma',
				state: 'OK',
				zip: '73114',
			});
		});
	});

	describe('addressesAreEqual', () => {
		it('should consider addresses with the same house number, street name, city, and state to be equal', () => {
			const address1 = '1414 S Council Rd, Oklahoma City, OK 73179';
			const address2 = '1414 South Council Road, Oklahoma City, OK, USA';
			expect(addressesAreEqual(address1, address2)).toBe(true);
		});

		it('should return false if the addresses are not equal', () => {
			const address1 = '1414 S Council Rd, Oklahoma City, OK 73179';
			const address2 = '1415 South Council Road, Oklahoma City, OK, USA';
			expect(addressesAreEqual(address1, address2)).toBe(false);
		});

		it('should return false if one of the addresses is empty', () => {
			const address1 = '';
			const address2 = '1414 South Council Road, Oklahoma City, OK';
			expect(addressesAreEqual(address1, address2)).toBe(false);
		});

		it('should return false if both of the addresses are empty', () => {
			const address1 = '';
			const address2 = '';
			expect(addressesAreEqual(address1, address2)).toBe(false);
		});
	});
});
