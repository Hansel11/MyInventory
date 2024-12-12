import { Add, Delete, Edit, FileDownloadOutlined, HelpOutline, TableRows } from "@mui/icons-material";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import { Alert, AlertProps, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Snackbar } from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRowId,
  GridRowParams,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  useGridApiContext
} from "@mui/x-data-grid";
import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
// import useAuth from "./useAuth";

function CustomDataGrid(props: any) {
    const {
      rows,
      columns,
      setRows,
      dataType,

      sortModel,
      columnVisibilityModel,
      onSortModelChange,
      enableImport=false,
      enableExport=false,
      enableEdit,
      enableDelete,
      enableAdd=true,

      isLoading,
      setIsLoading,

      importData,
      addData,
      updateData,

      deleteData,
      viewData,

      isCellEditable,
      
    } = props;

    // const { role } = useAuth();
    const role = "Admin";
    const crudAccess = role != null && ["Admin", "Staff"].includes(role);
    
    const [snackbar, setSnackbar] = useState<Pick<
        AlertProps,
        "children" | "severity"
    > | null>(null);
    const [ popup, setPopup ]= useState(false);
    const [ importHelp, setImportHelp ] = useState(false);
    const [ toDelete, setToDelete ] = useState<GridRowId>();
  

    const closePopup = () => {
        setPopup(false);
    };

    const openImportHelp = () => {
        setImportHelp(true);
    };

    const closeImportHelp = () => {
        setImportHelp(false);
    };

    const handleRowClick = (params: GridRowParams) => {
        viewData(params);
    };

    const handleEditClick = (id: GridRowId) => async () => {
        updateData(id);
    };

    const handleDeleteClick = (id: GridRowId) => async () => {
        setToDelete(id);
        setPopup(true);
    };

    const confirmDelete = () => {
        setIsLoading(true);
        deleteData(toDelete);
        setIsLoading(false);
        
        setPopup(false);
        setSnackbar({
          children: `Data successfully deleted`,
          severity: "success",
        });
        // setRows(rows.filter((row: any) => row.id !== toDelete));
    };

    const handleCloseSnackbar = () => setSnackbar(null);

    const handleProcessRowUpdateError = useCallback((error: Error) => {
        setSnackbar({ children: error.message, severity: "error" });
    }, []);

    function CustomToolbar() {
      
      const apiRef = useGridApiContext();

      const handleExport = () =>
        apiRef.current.exportDataAsCsv({
          delimiter: ";",
          utf8WithBom: true,
          fileName: `MyInventory-${dataType}-export-${new Date()
            .toISOString()
            .slice(0, 10)}`,
        });

      const handleFileChange = (event: any) => {
        const file = event.target.files[0];
        if (file && file.name.endsWith(".csv")) {
          importData(file);
        } else {
          setSnackbar({
            children: "File extension is not supported! (Required: .csv)",
            severity: "error",
          });
        }
      };

      return (
        <GridToolbarContainer
          sx={{ display: "flex", justifyContent: "space-between" }}
        >
          <GridToolbarQuickFilter
            sx={{ marginLeft: "8px", marginTop: "8px" }}
          />
          <Box
            sx={{
              display: "flex",
              gap: "8px",
              marginRight: "8px",
              marginTop: "8px",
              fontWeight: "bold",
            }}
          >
            {enableImport && crudAccess ? (
              <Box>
                <IconButton color="primary" onClick={openImportHelp}>
                  <HelpOutline />
                </IconButton>
                <Button
                  color="primary"
                  variant="contained"
                  component="label"
                  startIcon={<FileDownloadOutlined />}
                  sx={{
                    marginLeft: 1,
                    bgcolor: "primary.main",
                    borderRadius: 3,
                    padding: 1.5,
                    fontWeight: "bold",
                  }}
                >
                  Import
                  <input type="file" hidden onChange={handleFileChange} />
                </Button>
              </Box>
            ) : null}

            {enableExport ? (
             
            <Button
                variant="contained"
                color="warning"
                startIcon={<FileUploadOutlinedIcon />}
                sx={{
                  bgcolor: "warning.light",
                  borderRadius: 3,
                  padding: 1.5,
                  fontWeight: "bold",
                }}
                onClick={() => handleExport()}
              >
                Export
              </Button>
              ): null }

            {enableAdd && crudAccess ? (
              <Button
                variant="contained"
                color="success"
                startIcon={<Add />}
                onClick={addData}
                sx={{
                  bgcolor: "success.light",
                  borderRadius: 3,
                  padding: 1.5,
                  fontWeight: "bold",
                }}
              >
                Add {dataType}
              </Button>
            ) : null}
          </Box>
        </GridToolbarContainer>
      );
    }

    const actionField: GridColDef =
    {
        field: "actions",
        type: "actions",
        headerName:  (enableEdit || enableDelete) && crudAccess ? "Actions" : "",
        width: 100,
        cellClassName: "actions",
        align: "right",
        getActions: ({ id }) => {

            return [
            <GridActionsCellItem
                icon={<Edit />}
                label="Edit"
                className="textPrimary"
                onClick={handleEditClick(id)}
                color="inherit"
                style={{ display: enableEdit && crudAccess ? "block" : "none" }}
            />,
            <GridActionsCellItem
                icon={<Delete color="error"/>}
                label="Delete"
                onClick={handleDeleteClick(id)}
                color="inherit"
                style={{ display: enableDelete && crudAccess ? "block" : "none" }}
            />,
            ];
        },
    };
    const actionColumns: GridColDef[] = (enableEdit || enableDelete) ? [...columns, actionField ] : [...columns];

    return (
      <>
        {!!snackbar && (
          <Snackbar
            open
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            onClose={handleCloseSnackbar}
            autoHideDuration={6000}
            sx={{
              "& .MuiPaper-root": {
                borderRadius: 4,
                padding: 1.5,
                boxShadow: 8,
              },
            }}
          >
            <Alert {...snackbar} onClose={handleCloseSnackbar} />
          </Snackbar>
        )}

        <Dialog
          open={popup}
          onClose={closePopup}
          sx={{
            "& .MuiPaper-root": {
              borderRadius: 6,
              padding: 2,
              boxShadow: 8,
            },
          }}
        >
          <DialogTitle fontWeight="bold">Hapus data</DialogTitle>
          <DialogContent>
            <DialogContentText>Delete this {dataType}?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={closePopup} color="primary">
              Cancel
            </Button>
            <Button onClick={confirmDelete} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={importHelp}
          onClose={closeImportHelp}
          sx={{
            "& .MuiPaper-root": {
              borderRadius: 6,
              padding: 2,
              boxShadow: 8,
            },
          }}
        >
          <DialogTitle fontWeight="bold">Import Data (BETA)</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <Box>
                To import data into the table, please store the data in a .csv file.
                Put the attribute name on the first row, seperated by semicolons(;)
                as such: <span style={{ fontWeight: "bold" }}>description; amount; unit</span>
              </Box>
              <br />

              <Box>
                <Link to="/ImportSample.csv" target="_blank" download>
                  <Button
                    color="success"
                    variant="contained"
                    component="label"
                    startIcon={<TableRows />}
                    sx={{
                      bgcolor: "success",
                      borderRadius: 3,
                      padding: 1.5,
                      fontWeight: "bold",
                    }}
                  >
                    Example File {"(.csv)"}
                  </Button>
                </Link>
              </Box>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeImportHelp} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <DataGrid
          sx={{
            boxShadow: 8,
            borderRadius: 6,
            padding: 2,
            backgroundColor: "background.default",
            "& .MuiDataGrid-main": {
              margin: "20px 0px 0px 0px",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold",
            },
            "& .MuiDataGrid-row:hover": {
              borderRadius: "16px",
            },
          }}
          sortModel={sortModel}
          columnVisibilityModel={columnVisibilityModel}
          onSortModelChange={onSortModelChange}
          rows={rows}
          columns={actionColumns}
          onRowClick={handleRowClick}
          slots={{ toolbar: CustomToolbar }}
          onProcessRowUpdateError={handleProcessRowUpdateError}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          loading={isLoading}
          autoHeight={true}
          disableColumnMenu
          disableColumnSelector
          disableDensitySelector
          pageSizeOptions={[10, 50, 100]}
          isRowSelectable={() => {
            return false;
          }}
          isCellEditable={isCellEditable}
        />
      </>
    );
}

export default CustomDataGrid;
