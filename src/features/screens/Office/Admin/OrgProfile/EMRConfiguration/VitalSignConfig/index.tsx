import { zodResolver } from '@hookform/resolvers/zod';
import { Stack } from '@mui/material';
import { isEqual } from 'lodash';
import { useFieldArray, useForm } from 'react-hook-form';
import { useAlert } from '~/common/hooks/useAlert';
import { api } from '~/common/utils/api';
import { trpc } from '~/common/utils/trpc';
import { AddAndRemoveButtons } from '~/features/screens/Field/PatientDetail/components/AddAndRemoveButtons';
import { ExpandableCardWithHeaders } from '~/features/ui/cards/ExpandableCardWithHeaders';
import {
	VitalSignConfigFormInput,
	vitalSignConfigFormSchema,
} from '~/server/api/routers/organization/organization.inputs';
import { VitalSignConfigsForm } from './VitalSignConfigsForm';
import { DEFAULT_VITAL_SIGN_CONFIG_NAME } from './vitalSignConfig.utils';

export function VitalSignConfig() {
	const alert = useAlert();
	const trpcUtils = trpc.useUtils();

	const vitalSignsConfigQuery = api.organization.getVitalSignConfigs.useQuery();

	const form = useForm<VitalSignConfigFormInput>({
		values: { configs: vitalSignsConfigQuery.data ?? [] },
		resolver: zodResolver(vitalSignConfigFormSchema),
	});

	const fieldArray = useFieldArray({ control: form.control, name: 'configs', keyName: 'uid' });

	const configs = form.watch('configs');

	const createMutation = api.organization.createVitalSignConfig.useMutation({
		onSuccess: () => {
			void trpcUtils.organization.getVitalSignConfigs.invalidate();
			alert.addSuccessAlert({ message: 'Vital Sign Config Saved' });
		},
		onError: () => {
			alert.addErrorAlert({ message: 'Error saving Vital Sign Config type' });
		},
	});

	const updateMutation = api.organization.updateVitalSignConfig.useMutation({
		onSuccess: () => {
			void trpcUtils.organization.getVitalSignConfigs.invalidate();
			alert.addSuccessAlert({ message: 'Vital Sign Configuration Updated' });
		},
		onError: () => {
			alert.addErrorAlert({ message: 'Error saving Vital Sign Config type' });
		},
	});

	const deleteMutation = api.organization.deleteVitalSignConfig.useMutation({
		onSuccess: () => {
			void trpcUtils.organization.getVitalSignConfigs.invalidate();
			alert.addSuccessAlert({ message: 'Vital Sign Config Deleted' });
		},
		onError: () => {
			alert.addErrorAlert({ message: 'Error deleting Vital Sign Config type' });
		},
	});

	const addConfig = () => {
		if (fieldArray.fields.length < 1) fieldArray.append({ name: DEFAULT_VITAL_SIGN_CONFIG_NAME });
		else fieldArray.append({ name: '' });
	};

	const removeConfig = (index: number) => {
		if (index === 0) return;
		const id = form.getValues().configs[index]?.id;
		fieldArray.remove(index);
		if (id) deleteMutation.mutate({ id });
	};
	const updateConfig = async (index: number) => {
		const valid = await form.trigger(`configs.${index}`);
		if (!valid) return;
		const data = form.getValues().configs[index];
		if (!data) return;
		const { id, ...rest } = data;
		if (id) updateMutation.mutate({ id, ...rest });
		else createMutation.mutate(rest);
	};
	const resetConfig = (index: number) => {
		const data = vitalSignsConfigQuery.data?.[index];
		if (!data) return;
		fieldArray.update(index, data);
		form.resetField(`configs.${index}`); // only resets isDirty param
	};

	const hasConfigUpdated = (index: number) => {
		return !isEqual(configs[index], vitalSignsConfigQuery.data?.[index]);
	};

	return (
		<ExpandableCardWithHeaders
			height="100%"
			title="Vital Sign Notification Parameters"
			subheader="Manage the default vital sign parameters used by your organization"
		>
			<Stack direction="column" spacing={6} mb={2}>
				{fieldArray.fields.map(({ uid }, index) => (
					<VitalSignConfigsForm
						key={uid}
						control={form.control}
						index={index}
						isDirty={hasConfigUpdated(index)}
						onDelete={() => removeConfig(index)}
						onUpdate={() => updateConfig(index)}
						onReset={() => resetConfig(index)}
					/>
				))}
			</Stack>
			<AddAndRemoveButtons
				shouldShowAdd={true}
				handleAdd={addConfig}
				shouldShowRemove={false}
				readOnly={false}
				addText="Add Config"
			/>
		</ExpandableCardWithHeaders>
	);
}
