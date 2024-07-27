import { useAlert } from '~/common/hooks/useAlert';
import { RouterOutputs, api } from '~/common/utils/api';
import { trpc } from '~/common/utils/trpc';
import { CardWrappedEditableTable } from '~/features/ui/Tables/CardWrappedEditableTable';

type CategoriesData = RouterOutputs['organization']['getPhysicalAssessmentCategories']['0'];

export function PhysicalAssessmentCategories() {
	const trpcUtils = trpc.useUtils();
	const alert = useAlert();

	const categoriesQuery = api.organization.getPhysicalAssessmentCategories.useQuery();

	const updateOneMutation = api.organization.updatePhysicalAssessmentCategory.useMutation({
		onSuccess: () => {
			void trpcUtils.organization.getPhysicalAssessmentCategories.invalidate();
			alert.addSuccessAlert({
				message: 'Category Saved',
			});
		},
		onError: () => {
			alert.addErrorAlert({
				message: 'Error saving Category',
			});
		},
	});

	const deleteOneMutation = api.organization.deletePhysicalAssessmentCategory.useMutation({
		onSuccess: () => {
			void trpcUtils.organization.getPhysicalAssessmentCategories.invalidate();
			alert.addSuccessAlert({
				message: 'Category Deleted',
			});
		},
		onError: () => {
			alert.addErrorAlert({
				message: 'Error deleting Category',
			});
		},
	});

	return (
		<CardWrappedEditableTable<CategoriesData>
			title="Physical Assessment Categories"
			subheader="Physical Assessment Categories for your organization"
			columns={columns}
			data={{ list: categoriesQuery.data ?? [], count: categoriesQuery.data?.length ?? 0 }}
			onEdit={updateOneMutation.mutateAsync}
			startEditField="name"
			onDelete={deleteOneMutation.mutateAsync}
			onAdd={updateOneMutation.mutateAsync}
			clientSideOnlyTable
		/>
	);
}

const columns = [
	{
		field: 'name',
		headerName: 'Category Name',
		editable: true,
		flex: 1,
	},
];
