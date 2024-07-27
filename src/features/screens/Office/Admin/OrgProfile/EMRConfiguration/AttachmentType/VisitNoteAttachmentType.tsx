import { zodResolver } from '@hookform/resolvers/zod';
import { Grid, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useAlert } from '~/common/hooks/useAlert';
import { api } from '~/common/utils/api';
import { trpc } from '~/common/utils/trpc';
import { FixedBottomSaveButton } from '~/features/ui/buttons/FixedBottomSaveButton';
import { FormSelect } from '~/features/ui/form-inputs';
import {
	VisitNoteAttachmentTypeInput,
	visitNoteAttachmentTypeUpdateSchema,
} from '~/server/api/routers/organization/organization.inputs';

export function VisitNoteAttachmentType({
	hchbAttachmentLocations,
	hchbAttachmentTypes,
}: {
	hchbAttachmentTypes: string[];
	hchbAttachmentLocations: string[];
}) {
	const trpcUtils = trpc.useUtils();
	const alert = useAlert();

	const attachmentTypeQuery = api.organization.getVisitNoteAttachmentType.useQuery();
	const attachmentUpdateMutation = api.organization.updateVisitNoteAttachmentType.useMutation({
		onSuccess: () => {
			void trpcUtils.organization.getVisitNoteAttachmentType.invalidate();
			alert.addSuccessAlert({ message: 'Attachment type updated' });
		},
		onError: () => {
			alert.addErrorAlert({ message: 'Error updating Attachment type' });
		},
	});

	const form = useForm<VisitNoteAttachmentTypeInput>({
		values: attachmentTypeQuery.data ?? { type: '', location: '' },
		resolver: zodResolver(visitNoteAttachmentTypeUpdateSchema),
	});

	return (
		<>
			<Typography variant="body1b" gutterBottom>
				Apricot Visit Note
			</Typography>
			<Grid container spacing={2}>
				<Grid item xs={12} sm={6}>
					<FormSelect
						name="type"
						control={form.control}
						label="HCHB Attachment Type"
						options={hchbAttachmentTypes.map((d) => ({ label: d, value: d }))}
						size="small"
					/>
				</Grid>
				<Grid item xs={12} sm={6}>
					<FormSelect
						name="location"
						control={form.control}
						label="HCHB Attachment Location"
						options={hchbAttachmentLocations.map((d) => ({ label: d, value: d }))}
						size="small"
					/>
				</Grid>
			</Grid>
			<FixedBottomSaveButton
				width="100%"
				show={form.formState.isDirty}
				isLoading={attachmentUpdateMutation.isLoading}
				onClick={async () => {
					await form.handleSubmit(
						async (values) => {
							await attachmentUpdateMutation.mutateAsync(values);
							form.reset(form.getValues());
						},
						(error) => console.log(error),
					)();
				}}
			/>
		</>
	);
}
