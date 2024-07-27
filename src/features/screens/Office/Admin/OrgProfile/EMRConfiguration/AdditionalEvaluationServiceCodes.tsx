import { useAlert } from '~/common/hooks/useAlert';
import { RouterOutputs, api } from '~/common/utils/api';
import { trpc } from '~/common/utils/trpc';
import { CardWrappedEditableTable } from '~/features/ui/Tables/CardWrappedEditableTable';

type CodesData = RouterOutputs['organization']['getAdditionalEvaluationServiceCodes']['0'];

export function AdditionalEvaluationServiceCodes() {
	const trpcUtils = trpc.useUtils();
	const alert = useAlert();

	const codesQuery = api.organization.getAdditionalEvaluationServiceCodes.useQuery();

	const updateOneMutation = api.organization.updateAdditionalEvaluationServiceCodes.useMutation({
		onSuccess: () => {
			void trpcUtils.organization.getAdditionalEvaluationServiceCodes.invalidate();
			alert.addSuccessAlert({
				message: 'Additional Evaluation Code Saved',
			});
		},
		onError: () => {
			alert.addErrorAlert({
				message: 'Error saving code',
			});
		},
	});

	const deleteOneMutation = api.organization.deleteAdditionalEvaluationServiceCode.useMutation({
		onSuccess: () => {
			void trpcUtils.organization.getAdditionalEvaluationServiceCodes.invalidate();
			alert.addSuccessAlert({
				message: 'Code Deleted',
			});
		},
		onError: () => {
			alert.addErrorAlert({
				message: 'Error deleting code',
			});
		},
	});

	return (
		<CardWrappedEditableTable<CodesData>
			title="Additional Evaluation Service Codes"
			subheader="Additional Evaluation service codes for your organization"
			columns={columns}
			data={{ list: codesQuery.data ?? [], count: codesQuery.data?.length ?? 0 }}
			onEdit={updateOneMutation.mutateAsync}
			startEditField="code"
			onDelete={deleteOneMutation.mutateAsync}
			onAdd={updateOneMutation.mutateAsync}
			clientSideOnlyTable
		/>
	);
}

const columns = [
	{
		field: 'code',
		headerName: 'Code',
		editable: true,
		flex: 1,
	},
	{
		field: 'description',
		headerName: 'Description',
		editable: true,
		flex: 1,
	},
	{
		field: 'discipline',
		headerName: 'Discipline',
		editable: true,
		flex: 1,
	},
];
