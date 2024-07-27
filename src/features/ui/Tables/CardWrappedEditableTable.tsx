import { EditableTable, EditableTableProps } from '~/features/ui/Tables/EditableTable';
import {
	ExpandableCardWithHeaders,
	ExpandableCardWithHeadersProps,
} from '~/features/ui/cards/ExpandableCardWithHeaders';

export function CardWrappedEditableTable<
	T extends {
		id: number;
	},
>({
	title,
	subheader,
	defaultExpanded,
	height,
	...rest
}: ExpandableCardWithHeadersProps & EditableTableProps<T>): JSX.Element {
	return (
		<ExpandableCardWithHeaders
			title={title}
			subheader={subheader}
			defaultExpanded={defaultExpanded}
			height={height}
		>
			<EditableTable {...rest} />
		</ExpandableCardWithHeaders>
	);
}
