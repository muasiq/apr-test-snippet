import { List, ListItem, Typography } from '@mui/material';

type Props = {
	files: File[];
	uploadStatuses: Record<string, string>;
};
export const UploadedFilesList = ({ files, uploadStatuses }: Props) => {
	return (
		<List sx={{ listStyleType: 'disc', pl: 2 }}>
			{files
				.filter((file) => uploadStatuses[file.name] !== 'Success')
				.map((file) => (
					<ListItem sx={{ display: 'list-item' }} key={file.name}>
						<Typography>
							{file.name} - {(file.size / 1000000).toFixed(2)} MB
						</Typography>
						<Typography color={uploadStatuses[file.name] === 'Success' ? 'green' : 'red'}>
							{uploadStatuses[file.name] ?? 'Pending'}
						</Typography>
					</ListItem>
				))}
		</List>
	);
};
