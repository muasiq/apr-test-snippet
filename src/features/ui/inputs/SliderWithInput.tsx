import { Add, Remove } from '@mui/icons-material';
import { IconButton, Slider, Stack, Typography } from '@mui/material';
import { forwardRef } from 'react';

type Props = {
	min: number;
	max: number;
	defaultValue: number;
	value: number;
	handleChange: (value: number) => void;
	incrementAmount: number;
};

export const SliderWithInput = forwardRef<HTMLInputElement, Props>(
	({ min, max, defaultValue, value, handleChange, incrementAmount }, ref) => {
		const constrainChange = (changeAmount: number) => {
			const newValue = value + changeAmount;
			if (newValue < min || newValue > max) {
				return;
			}
			handleChange(newValue);
		};

		const handleSliderChange = (e: unknown, v: number | number[]) => {
			handleChange(v as number);
		};

		return (
			<>
				<Stack direction={'row'} alignItems={'center'}>
					<Typography color="primary" variant="h1" data-cy="slider-value">
						{value}
					</Typography>
					<Stack>
						<IconButton
							data-cy="increment-slider"
							color="primary"
							onClick={() => constrainChange(incrementAmount)}
						>
							<Add />
						</IconButton>
						<IconButton color="primary" onClick={() => constrainChange(-incrementAmount)}>
							<Remove />
						</IconButton>
					</Stack>
				</Stack>
				<Slider
					value={value}
					onChange={handleSliderChange}
					min={min}
					max={max}
					defaultValue={defaultValue}
					valueLabelDisplay="auto"
					aria-labelledby="input-slider"
					marks
					step={incrementAmount}
					color="primary"
					data-cy="slider"
					ref={ref}
				></Slider>
			</>
		);
	},
);

SliderWithInput.displayName = 'SliderWithInput';
