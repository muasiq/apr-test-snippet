import { List, ListItem, Typography } from '@mui/material';

type Props = {
	uploadedFiles: { file: File }[];
};
export const InterviewQuestionFileUploadList = ({ uploadedFiles }: Props) => {
	return (
		<>
			{uploadedFiles.length > 0 && <Typography>Uploaded files</Typography>}
			<List sx={{ listStyleType: 'disc', pl: 3 }}>
				{uploadedFiles.map(({ file }) => (
					<ListItem sx={{ display: 'list-item' }} key={file.name}>
						<Typography>
							{file.name} - {(file.size / 1000000).toFixed(2)} MB
						</Typography>
					</ListItem>
				))}
			</List>
		</>
	);
};
