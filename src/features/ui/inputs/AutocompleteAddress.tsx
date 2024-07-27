import { Loader } from '@googlemaps/js-api-loader';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import {
	Box,
	Grid,
	Autocomplete as MaterialAutocomplete,
	TextField,
	Typography,
	type AutocompleteProps,
	type TextFieldProps,
} from '@mui/material';
import { debounce } from '@mui/material/utils';
import parse from 'autosuggest-highlight/parse';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FieldError } from 'react-hook-form';
import { ParsedPlaceDetails, addressesAreEqual, getAddressComponents } from '~/common/utils/googlePlaces';
import { env } from '~/env.mjs';

interface GoogleMapsWindow extends Window {
	google: {
		maps: {
			places: {
				AutocompleteService: new () => google.maps.places.AutocompleteService;
				PlacesService: new (element: HTMLDivElement) => google.maps.places.PlacesService;
			};
		};
	};
}

type AutocompleteAddressProps = {
	name: string;
	label: string;
	textFieldProps?: TextFieldProps;
	value?: string;
	error?: FieldError;
	onChange: (value: ParsedPlaceDetails) => void;
} & Omit<AutocompleteProps<AutocompletePrediction, boolean, boolean, boolean>, 'renderInput' | 'options' | 'onChange'>;

type AutocompletePrediction = google.maps.places.AutocompletePrediction;
type PredictionSubstring = google.maps.places.PredictionSubstring;

export function AutocompleteAddress({
	inputValue,
	onChange,
	name,
	error,
	...autocompleteAddressProps
}: AutocompleteAddressProps) {
	const [autocompletedValue, setAutocompletedValue] = useState<AutocompletePrediction | null>(null);
	const [innerInputValue, setInnerInputValue] = useState(inputValue ?? '');
	const passedInputValue = inputValue ?? innerInputValue;
	const [options, setOptions] = useState<readonly AutocompletePrediction[]>([]);
	const [loadingPlaceDetails, setLoadingPlaceDetails] = useState(false);
	const loaded = useRef(false);

	const [autocompleteService, setAutocompleteService] = useState<{
		current: google.maps.places.AutocompleteService;
	} | null>(null);

	const [placesService, setPlacesService] = useState<{
		current: google.maps.places.PlacesService;
	} | null>(null);

	useEffect(() => {
		const initializeAutocompleteService = async () => {
			const loader = new Loader({
				apiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
				version: 'weekly',
			});

			await loader.importLibrary('places');

			if ((window as GoogleMapsWindow).google) {
				const autocompleteService = new (window as GoogleMapsWindow).google.maps.places.AutocompleteService();
				const placesService = new (window as GoogleMapsWindow).google.maps.places.PlacesService(
					document.createElement('div'),
				);
				setAutocompleteService({ current: autocompleteService });
				setPlacesService({ current: placesService });
			}
		};

		if (typeof window !== 'undefined' && !loaded.current) {
			initializeAutocompleteService().catch(console.error);
			loaded.current = true;
		}
	}, []);

	const fetchPlacePredictions = useMemo(
		() =>
			debounce(
				(
					request: { input: string; types: string[] },
					callback: (
						results: AutocompletePrediction[] | null,
						status: google.maps.places.PlacesServiceStatus,
					) => void,
				) => {
					if (autocompleteService) {
						autocompleteService.current.getPlacePredictions(request, callback).catch(console.error);
					} else {
						callback([], google.maps.places.PlacesServiceStatus.UNKNOWN_ERROR);
					}
				},
				200,
			),
		[autocompleteService],
	);

	useEffect(() => {
		let active = true;

		if (!autocompleteService?.current && (window as GoogleMapsWindow).google) {
			if (!autocompleteService?.current) {
				return undefined;
			}

			autocompleteService.current = new (window as GoogleMapsWindow).google.maps.places.AutocompleteService();
		}

		if (innerInputValue === '') {
			setOptions(autocompletedValue ? [autocompletedValue] : []);
			return undefined;
		}

		fetchPlacePredictions({ input: innerInputValue, types: ['address'] }, (results, status) => {
			if (active && status === google.maps.places.PlacesServiceStatus.OK && results) {
				let newOptions: AutocompletePrediction[] = [];

				if (autocompletedValue) {
					newOptions = [autocompletedValue];
				}

				if (results) {
					newOptions = [...newOptions, ...results];
				}

				setOptions(newOptions);
			}
		});

		return () => {
			active = false;
		};
	}, [autocompletedValue, innerInputValue, fetchPlacePredictions, autocompleteService]);

	return (
		<MaterialAutocomplete
			{...autocompleteAddressProps}
			value={loadingPlaceDetails ? null : autocompleteAddressProps.value ?? autocompletedValue}
			fullWidth
			filterOptions={(x) => x}
			options={options}
			getOptionLabel={(option) => (typeof option === 'string' ? option : option.description)}
			isOptionEqualToValue={(option, value) => addressesAreEqual(option.description, value as unknown as string)}
			autoComplete
			includeInputInList
			filterSelectedOptions
			popupIcon={null}
			inputValue={
				passedInputValue
					? options.find((o) => o.description === passedInputValue)?.description ?? passedInputValue
					: passedInputValue
			}
			noOptionsText="No address"
			onChange={(_, newValue) => {
				const resolvedNewValue = newValue as AutocompletePrediction | null;
				setOptions(resolvedNewValue ? [resolvedNewValue, ...options] : options);
				setAutocompletedValue(resolvedNewValue);

				if (resolvedNewValue?.place_id && resolvedNewValue.description !== autocompletedValue?.description) {
					setLoadingPlaceDetails(true);
					placesService?.current.getDetails({ placeId: resolvedNewValue?.place_id }, (result) => {
						if (!result) return;

						const addressComponents = getAddressComponents(result);
						onChange(addressComponents);
						setLoadingPlaceDetails(false);
					});
				}
			}}
			onInputChange={(_, newInputValue) => {
				setInnerInputValue(newInputValue);
			}}
			renderInput={(params) => (
				<TextField
					{...params}
					name={name}
					error={!!error}
					helperText={error ? error.message : ''}
					label="Address"
					data-cy="patient-address-input"
					fullWidth
					disabled={loadingPlaceDetails}
				/>
			)}
			renderOption={(props, option) => {
				const matches = option.structured_formatting.main_text_matched_substrings ?? [];
				const parts = parse(
					option.structured_formatting.main_text,
					matches.map((match: PredictionSubstring) => [match.offset, match.offset + match.length]),
				);
				return (
					<li {...props}>
						<Grid container sx={{ alignItems: 'center' }}>
							<Grid item sx={{ display: 'flex', width: 44 }}>
								<LocationOnIcon sx={{ color: 'text.secondary' }} />
							</Grid>
							<Grid item sx={{ width: 'calc(100% - 44px)', wordWrap: 'break-word' }}>
								{parts.map((part, index) => (
									<Box
										key={index}
										component="span"
										sx={{ fontWeight: part.highlight ? 'bold' : 'regular' }}
									>
										{part.text}
									</Box>
								))}
								<Typography variant="body2" color="text.secondary">
									{option.structured_formatting.secondary_text}
								</Typography>
							</Grid>
						</Grid>
					</li>
				);
			}}
		/>
	);
}
