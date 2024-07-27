import { Add, Cancel, Close, Delete, Edit, Save } from '@mui/icons-material';
import { IconButton, Stack, TextField, Typography } from '@mui/material';
import {
	DataGridPro,
	GridColDef,
	GridPaginationModel,
	GridRenderCellParams,
	GridRowModes,
	GridRowModesModel,
	GridSortModel,
	GridToolbarContainer,
	useGridApiRef,
} from '@mui/x-data-grid-pro';
import { compact, isString } from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { SecondaryIconTextButton } from '~/features/ui/buttons/SecondaryIconTextButton';

declare module '@mui/x-data-grid-pro' {
	interface NoRowsOverlayPropsOverrides {
		isSearching: boolean;
	}
}

type PaginatedData<T> = {
	list: T[];
	count: number;
};

export type EditableTableProps<T extends { id: number }> = {
	columns: GridColDef<T>[];
	data: PaginatedData<T>;
	onEdit: (data: T) => Promise<T>;
	startEditField: string;
	onDelete: (data: T) => Promise<T>;
	onAdd: (data: T) => Promise<T>;
	searchText?: string;
	setSearchText?: (text: string) => void;
	paginationModel?: GridPaginationModel;
	sortModel?: GridSortModel;
	setSortModel?: (sortModel: GridSortModel) => void;
	setPaginationModel?: (paginationModel: GridPaginationModel) => void;
	clientSideOnlyTable?: boolean;
};
export function EditableTable<T extends { id: number }>({
	columns,
	data,
	onEdit,
	onDelete,
	onAdd,
	searchText,
	setSearchText,
	paginationModel,
	setSortModel,
	setPaginationModel,
	sortModel,
	startEditField,
	clientSideOnlyTable = false,
}: EditableTableProps<T>): JSX.Element {
	const [editedRow, setEditedRow] = useState<T | null>(null);
	const [autoSave, setAutoSave] = useState<boolean>(false);
	const [addingNewRecord, setAddingNewRecord] = useState<boolean>(false);
	const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
	const gridApiRef = useGridApiRef();

	const onAddNewRecord = useCallback(() => {
		setAddingNewRecord(true);
		setRowModesModel({
			[0]: { mode: GridRowModes.Edit, fieldToFocus: startEditField },
		});
		gridApiRef.current?.setCellFocus(0, startEditField);
	}, [gridApiRef, startEditField]);

	const onEditRecord = useCallback(
		(id: number) => {
			setRowModesModel({
				[id]: { mode: GridRowModes.Edit, fieldToFocus: startEditField },
			});
		},
		[startEditField],
	);

	const saveNewRecord = useCallback(
		async (record: T) => {
			if (record.id === 0) {
				try {
					await onAdd(record);
					setAddingNewRecord(false);
					setEditedRow(null);
				} catch (e) {
					console.error(e);
				}
			} else {
				try {
					await onEdit(record);
					setEditedRow(null);
				} catch (e) {
					console.error(e);
				}
			}
		},
		[onAdd, onEdit],
	);

	const onSaveNewRecordClick = useCallback(
		async (id: number) => {
			if (!editedRow) {
				// they clicked save without triggering the row update, so we do that manually and then autosave on row update
				setAutoSave(true);
				gridApiRef.current?.stopRowEditMode({ id });
			} else {
				await saveNewRecord(editedRow);
			}
		},
		[gridApiRef, editedRow, saveNewRecord],
	);

	const onCancelRecordClick = useCallback(
		(id: number) => {
			try {
				gridApiRef.current?.stopRowEditMode({ id, ignoreModifications: true });
			} catch (e) {
				console.warn('Error stopping row edit mode', e);
			}
			setAddingNewRecord(false);
			setEditedRow(null);
			setAutoSave(false);
		},
		[gridApiRef],
	);

	const allColumns: GridColDef<T>[] = useMemo(() => {
		return compact([
			...columns,
			!clientSideOnlyTable ? { field: 'updatedAt', headerName: 'Last Modified', type: 'dateTime' } : null,
			{
				field: 'actions',
				headerName: 'Actions',
				sortable: false,
				renderCell: (params) => {
					const somethingIsBeingEdited = Object.values(rowModesModel).length || editedRow;
					if (somethingIsBeingEdited) {
						const thisRowIsBeingEdited = !!rowModesModel[params.row.id] || editedRow?.id === params.row.id;
						if (thisRowIsBeingEdited) {
							return (
								<Stack direction={'row'} spacing={1}>
									<IconButton
										size="small"
										color="success"
										onClick={() => onSaveNewRecordClick(params.row.id)}
									>
										<Save />
									</IconButton>
									<IconButton size="small" onClick={() => onCancelRecordClick(params.row.id)}>
										<Cancel />
									</IconButton>
								</Stack>
							);
						} else {
							return null;
						}
					}
					return (
						<>
							<IconButton size="small" onClick={() => onEditRecord(params.row.id)}>
								<Edit />
							</IconButton>
							<IconButton size="small" color="error" onClick={() => onDelete(params.row)}>
								<Delete />
							</IconButton>
						</>
					);
				},
				maxWidth: 100,
			},
		]);
	}, [
		columns,
		rowModesModel,
		editedRow,
		onSaveNewRecordClick,
		onEditRecord,
		onDelete,
		onCancelRecordClick,
		clientSideOnlyTable,
	]);

	const placeUnSavedAddOrEditRowInData = useCallback(() => {
		if (editedRow) {
			if (editedRow.id === 0) {
				return [editedRow, ...data.list];
			}
			return data.list.map((row) => {
				if (row.id === editedRow.id) {
					return editedRow;
				} else {
					return row;
				}
			});
		}
		if (addingNewRecord) {
			return [{ id: 0 }, ...data.list];
		}

		return data.list;
	}, [data, editedRow, addingNewRecord]);

	return (
		<DataGridPro
			editMode="row"
			apiRef={gridApiRef}
			rows={placeUnSavedAddOrEditRowInData()}
			onRowEditStart={(params, event) => {
				// don't allow editing new row if a row is already being edited
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				if (editedRow && editedRow.id !== params.row.id) {
					event.defaultMuiPrevented = true;
				}
			}}
			rowCount={data.count ?? 0}
			rowModesModel={rowModesModel}
			onRowModesModelChange={setRowModesModel}
			columns={allColumns as GridColDef<{ id: number }>[]}
			pagination
			paginationMode={!clientSideOnlyTable ? 'server' : 'client'}
			sortingMode={!clientSideOnlyTable ? 'server' : 'client'}
			paginationModel={paginationModel}
			onPaginationModelChange={setPaginationModel}
			sortModel={clientSideOnlyTable ? undefined : sortModel}
			processRowUpdate={(updatedRow) => {
				if (autoSave) {
					void saveNewRecord(updatedRow as T);
					setAutoSave(false);
				} else {
					setEditedRow(updatedRow as T);
				}
				return updatedRow;
			}}
			onSortModelChange={clientSideOnlyTable ? undefined : setSortModel}
			pageSizeOptions={[10]}
			autoPageSize
			disableColumnFilter
			disableMultipleColumnsSorting
			disableRowSelectionOnClick
			sx={{
				'--DataGrid-overlayHeight': '100%',
				'& .MuiDataGrid-overlayWrapper': {
					height: '100%',
				},
			}}
			slots={{
				noRowsOverlay: CustomNoRowsOverlay,
				toolbar: GridToolbar,
			}}
			slotProps={{
				noRowsOverlay: { isSearching: !!searchText?.length },
				toolbar: { onAddRecord: onAddNewRecord, searchText, setSearchText, addingNewRecord },
			}}
		/>
	);
}

function CustomNoRowsOverlay({ isSearching }: { isSearching: boolean }) {
	const message = isSearching
		? 'Your search params yielded no results'
		: 'No items added yet. Press Add Record to start editing';
	return (
		<Stack flexDirection={'column'} textAlign={'center'} flexGrow={1} justifyContent={'center'} height="100%">
			<Typography variant="h6">{message}</Typography>;
		</Stack>
	);
}

function GridToolbar({
	addingNewRecord,
	onAddRecord,
	searchText,
	setSearchText,
}: {
	addingNewRecord: boolean;
	onAddRecord: () => void;
	searchText?: string;
	setSearchText?: (text: string) => void;
}) {
	return (
		<GridToolbarContainer>
			<Stack sx={{ flex: 1, p: 3 }} direction="row" justifyContent="space-between">
				{setSearchText && isString(searchText) && (
					<TextField
						id="search-text"
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						label="Search"
						size="small"
						sx={{ width: '240px' }}
						InputProps={{
							endAdornment: searchText.length > 0 && (
								<IconButton onClick={() => setSearchText('')} size="small">
									<Close />
								</IconButton>
							),
						}}
					/>
				)}

				<SecondaryIconTextButton
					sx={{ marginLeft: 'auto' }}
					startIcon={<Add />}
					onClick={() => onAddRecord()}
					disabled={addingNewRecord}
				>
					Add Record
				</SecondaryIconTextButton>
			</Stack>
		</GridToolbarContainer>
	);
}
