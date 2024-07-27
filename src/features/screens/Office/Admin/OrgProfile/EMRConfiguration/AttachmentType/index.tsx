import { Box, Stack } from '@mui/material';
import { useMemo } from 'react';
import { useAlert } from '~/common/hooks/useAlert';
import { api } from '~/common/utils/api';
import { trpc } from '~/common/utils/trpc';
import { ExpandableCardWithHeaders } from '~/features/ui/cards/ExpandableCardWithHeaders';
import { EditableTable } from '~/features/ui/Tables/EditableTable';
import { VisitNoteAttachmentType } from './VisitNoteAttachmentType';

type Props = {
	hchbAttachmentTypes: string[];
	hchbAttachmentLocations: string[];
};
export function AttachmentTypes({ hchbAttachmentLocations, hchbAttachmentTypes }: Props) {
	const columns = useMemo(
		() => [
			{
				field: 'description',
				headerName: 'Description',
				editable: true,
				flex: 1,
			},
			{
				field: 'type',
				headerName: 'HCHB Attachment Type',
				editable: true,
				flex: 1,
				type: 'singleSelect',
				valueOptions: hchbAttachmentTypes,
			},
			{
				field: 'location',
				headerName: 'HCHB Attachment Location',
				editable: true,
				flex: 1,
				type: 'singleSelect',
				valueOptions: hchbAttachmentLocations,
			},
			{
				field: 'requiredForSOC',
				headerName: 'Required for SOC',
				editable: true,
				type: 'boolean',
				flex: 1,
			},
			{
				field: 'notes',
				headerName: 'HCHB Notes',
				editable: true,
				flex: 1,
			},
		],
		[hchbAttachmentLocations, hchbAttachmentTypes],
	);

	const trpcUtils = trpc.useUtils();
	const alert = useAlert();

	const attachmentTypesQuery = api.organization.getAttachmentTypes.useQuery();

	const attachmentUpdateMutation = api.organization.updateAttachmentType.useMutation({
		onSuccess: () => {
			void trpcUtils.organization.getAttachmentTypes.invalidate();
			alert.addSuccessAlert({ message: 'Attachment type updated' });
		},
		onError: () => {
			alert.addErrorAlert({ message: 'Error updating Attachment type' });
		},
	});

	const deleteOneMutation = api.organization.deleteAttachmentType.useMutation({
		onSuccess: () => {
			void trpcUtils.organization.getAttachmentTypes.invalidate();
			alert.addSuccessAlert({
				message: 'Attachment Type Deleted',
			});
		},
		onError: () => {
			alert.addErrorAlert({
				message: 'Error deleting Attachment Type',
			});
		},
	});
	return (
		<ExpandableCardWithHeaders
			title="Attachment Types"
			subheader="The attachment types in use by your organization"
			height="auto"
		>
			<Stack mb={3} gap={2}>
				<Box sx={{ height: 500 }}>
					<EditableTable
						columns={columns}
						data={{ list: attachmentTypesQuery.data ?? [], count: attachmentTypesQuery.data?.length ?? 0 }}
						onEdit={attachmentUpdateMutation.mutateAsync}
						startEditField="description"
						onDelete={deleteOneMutation.mutateAsync}
						onAdd={attachmentUpdateMutation.mutateAsync}
						clientSideOnlyTable
					/>
				</Box>
				<VisitNoteAttachmentType
					hchbAttachmentLocations={hchbAttachmentLocations}
					hchbAttachmentTypes={hchbAttachmentTypes}
				/>
			</Stack>
		</ExpandableCardWithHeaders>
	);
}
