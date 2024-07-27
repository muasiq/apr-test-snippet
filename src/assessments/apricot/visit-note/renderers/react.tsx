import { Box, Stack, Typography, TypographyProps } from '@mui/material';
import {
	isSerializedComponent,
	SerializedComponent,
	SerializedGroup,
	SerializedNode,
	SerializedQuestion,
} from '~/assessments/apricot/visit-note/serializeConfig';
import { CopyButton } from '~/features/ui/buttons/CopyButton';

const depthMap: Record<string, TypographyProps> = {
	0: { variant: 'h6', color: 'secondary', sx: { fontWeight: '400' } },
	1: { variant: 'body1b', sx: { textTransform: 'uppercase' } },
	2: { variant: 'body1b', color: 'text.secondary' },
	3: { variant: 'body1b' },
};

export function SerializedForm({ config }: { config: SerializedGroup[] }) {
	return (
		<>
			{config.map((group) => (
				<Group key={group.label} {...group} />
			))}
		</>
	);
}

function Group({ depth = 0, ...group }: SerializedGroup & { depth?: number }) {
	const headerProps = depthMap[depth] ?? depthMap['3'];

	return (
		<Stack width="100%">
			<Typography mb={1} {...headerProps}>
				{group.label}
			</Typography>
			<Stack flexDirection="row" flexWrap="wrap" gap={1} mb={2}>
				{group.children.map((child) => {
					if (!child) return null;
					if ('children' in child) {
						return <Group key={child.label} depth={depth + 1} {...child} />;
					}
					return <Node key={child.label} {...child} />;
				})}
			</Stack>
			{!!group.note && <Note>{group.note}</Note>}
		</Stack>
	);
}

function Node(node: Exclude<SerializedNode, SerializedGroup>) {
	if (!node) return null;

	if (isSerializedComponent(node)) {
		return <Component {...node} />;
	}

	return <Question {...node} />;
}

function Component(node: SerializedComponent) {
	if (node.type === 'signature') {
		return null;
	}

	if (node.type === 'note') {
		return <Note>{node.label}</Note>;
	}

	console.error('unknown component type:', node);
	return null;
}

function Question(answer: SerializedQuestion) {
	return (
		<Stack flexGrow={0} flexShrink={0} flexBasis={{ xs: '100%', md: 'calc(50% - 1em)' }}>
			<Stack
				sx={{
					'& .copy-button': {
						visibility: 'hidden',
					},
					'&:hover': {
						'& .copy-button': {
							visibility: 'visible',
						},
					},
				}}
			>
				<Stack>
					<Box>
						<Typography component="span" variant="body2" sx={{ fontWeight: 'bold' }}>
							{answer.label}
						</Typography>
						{!!(answer.label && answer.value) && (
							<Box component="span" ml={0.5}>
								<CopyButton
									fontSize={14}
									size="small"
									className="copy-button"
									getTextToCopy={() => answer.value?.toString() ?? ''}
								/>
							</Box>
						)}
					</Box>
					<Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
						{answer.value}
					</Typography>
				</Stack>
			</Stack>
			{!!answer.note && <Note>{answer.note}</Note>}
		</Stack>
	);
}

function Note({ children }: { children: React.ReactNode }) {
	return (
		<Typography my={1} variant="helper" color="textSecondary">
			{children}
		</Typography>
	);
}
