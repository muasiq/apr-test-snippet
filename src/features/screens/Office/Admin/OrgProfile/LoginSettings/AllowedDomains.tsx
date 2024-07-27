import { useCallback } from 'react';
import { useAlert } from '~/common/hooks/useAlert';
import { RouterOutputs, api } from '~/common/utils/api';
import { trpc } from '~/common/utils/trpc';
import { CardWrappedEditableTable } from '~/features/ui/Tables/CardWrappedEditableTable';

type Props = {
	org: RouterOutputs['organization']['getUserOrganization'];
};
export function AllowedDomains({ org }: Props): JSX.Element {
	const alert = useAlert();
	const utils = trpc.useUtils();
	const setOrgEmailDomains = api.organization.updateOrgEmailDomains.useMutation({
		onSuccess() {
			alert.addSuccessAlert({ message: 'Email Domains Updated' });
			void utils.organization.getUserOrganization.invalidate();
		},
		onError() {
			alert.addErrorAlert({ message: 'Error Updating Email Domains' });
		},
	});

	const onEdit = useCallback(
		async (data: EmailDomainData) => {
			await setOrgEmailDomains.mutateAsync({
				emailDomains: [data.domain, ...org.emailDomains.filter((e) => e !== data.domain)],
			});
			return data;
		},
		[org.emailDomains, setOrgEmailDomains],
	);

	const onAdd = useCallback(
		async (data: EmailDomainData) => {
			await setOrgEmailDomains.mutateAsync({ emailDomains: [data.domain, ...org.emailDomains] });
			return data;
		},
		[org.emailDomains, setOrgEmailDomains],
	);

	const onDelete = useCallback(
		async (data: EmailDomainData) => {
			await setOrgEmailDomains.mutateAsync({ emailDomains: org.emailDomains.filter((e) => e !== data.domain) });
			return data;
		},
		[org.emailDomains, setOrgEmailDomains],
	);

	return (
		<>
			<CardWrappedEditableTable<EmailDomainData>
				title="Allowed Domains"
				subheader="These are the domains that are allowed to login your your org. New sign-ups will start with basic permissions. Once they sign in, you will be able to upgrade their role"
				columns={columns}
				data={{ list: mapToEmailDomainData(org) ?? [], count: org.emailDomains?.length ?? 0 }}
				onAdd={onAdd}
				onEdit={onEdit}
				onDelete={onDelete}
				startEditField="domain"
				clientSideOnlyTable
			/>
		</>
	);
}

function mapToEmailDomainData(data: RouterOutputs['organization']['getUserOrganization']): EmailDomainData[] {
	return data.emailDomains.map((e, i) => ({ id: i + 1, domain: e }));
}

type EmailDomainData = {
	id: number;
	domain: string;
};

const columns = [
	{
		field: 'domain',
		headerName: 'Domain',
		editable: true,
		flex: 1,
	},
];
