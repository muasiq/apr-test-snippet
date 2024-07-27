type Props = {
	condition: boolean;
} & React.PropsWithChildren;
export function If({ condition, children }: Props) {
	if (condition) {
		return <>{children}</>;
	}
}
