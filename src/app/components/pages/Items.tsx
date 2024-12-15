import { Alert, AlertProps, Box, MenuItem, Snackbar, TextField } from '@mui/material';
import { GridColDef, GridRowId, GridRowParams, GridRowsProp } from '@mui/x-data-grid';
import Papa from 'papaparse';
import { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomDataGrid from '../utils/CustomDatagrid';
import CustomHeaderBox from '../utils/CustomHeaderBox';
import ItemForm from './ItemForm';
import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../utils/FirebaseConfig';

const columns: GridColDef[] = [
  { field: "accountNo", headerName: "Account No.", width: 150, editable: true },
  { field: "description", headerName: "Item", width: 420, editable: true },
  { field: "amount", headerName: "Amount", type: "number", width: 100, editable: true },
  { field: "unit", headerName: "Unit", width: 120, editable: true }
];

type FormValues = {
  warehouseID: string;
  accountNo: string;
  description: string;
  amount: number;
  unit: string;
};

const initForm: FormValues = {
  warehouseID: "",
  accountNo: "",
  description: "",
  amount: 0,
  unit: "",
};

interface ItemProps {
  setWarehouseID: Dispatch<SetStateAction<string>>;
  warehouseList: any[];
  warehouseID: string;
}

function Items(props: ItemProps) {

  const [rows, setRows] = useState<GridRowsProp>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortModel, setSortModel] = useState([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(initForm);
  const [formType, setFormType] = useState("");
  
  const [toImport, setToImport] = useState<FormValues[]>();


    const [snackbar, setSnackbar] = useState<Pick<
      AlertProps,
      "children" | "severity"
    > | null>(null);

    const handleCloseSnackbar = () => setSnackbar(null);

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleConfirmForm = (newRows: any[]) => {
    if(newRows.length > 1){
      alert("Import berhasil!");
      window.location.reload();

      // STILL WIP (MAKE ROWS UPDATE AFTER BULK INSERT)
      newRows.forEach(nr => nr.id = nr.warehouseID);
      setRows([...rows, ...newRows]);
    }
    else {
      var newRow = newRows[0];
      newRow.id = newRow.accountNo;
      const existingRow = rows.find((row) => row.id === newRow.id);

      if (existingRow) {
        const updatedRows = rows.map((row) =>
          row.id === newRow.id ? { ...row, ...newRow } : row
        );
        setRows(updatedRows);
      } else {
        setRows([...rows, newRow]);
      }
    
    }

    setIsFormOpen(false);
    setSortModel([]);
  };

  const navigate = useNavigate();

  const viewData = (item: GridRowParams) => {
    navigate("/mutation", { state: { 
      itemName: item.row.description,
      accountNo: item.row.accountNo,
      amount: item.row.amount
    }});
  };

  const [newNoAcc, setNewNoAcc] = useState("");

  const resetNewNoAcc = async () => {
    setNewNoAcc(
      rows[0] == null
        ? props.warehouseID + "00001"
        : String(Number(rows[rows.length - 1].accountNo) + 1)
    );
  };

  const fetchItems = async () => {
    try {
      const collectionRef = collection(db, "items");
      const q = query(collectionRef, where("warehouseID", "==", props.warehouseID));

      const snapshot = await getDocs(q);
      const itemData = await snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      }));

      await setRows(itemData);
      resetNewNoAcc();

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [props.warehouseID, props.warehouseList]);

  useEffect(()=>{
    resetNewNoAcc();
  },[rows]);

  const deleteData = async (rowID: GridRowId) => {

    try {
      const accountNo = rowID.toString();
      setIsLoading(true);
      const docRef = doc(db, "items", accountNo);
      await deleteDoc(docRef);

      const mutRef = collection(db, "mutations");
      const q = query(mutRef, where("accountNo", "==", accountNo));
      const snapshot = await getDocs(q);
      snapshot.docs.map((docSnap) =>
        deleteDoc(doc(db, "mutations", docSnap.id))
      );

      setRows(rows.filter((row) => row.accountNo !== rowID.toString()));
    } catch (error) {
      console.error("Error deleting document: ", error);
    } finally {
      setIsLoading(false);
    }
    
    return rowID;
  };

  const updateWarehouse = (updateProps: any ) => {
    const warehouseID = updateProps.target.value;
    props.setWarehouseID(warehouseID);
  }

    const addData = async () => {
      let newForm = Object.assign({}, initForm);
      newForm.accountNo = newNoAcc;
      newForm.warehouseID = props.warehouseID;
      setFormData(newForm);
      setFormType("Add");
      setIsFormOpen(true);
    };

    const updateData = async (rowID: GridRowId) => {
      const data = rows.find((row) => row.id === rowID) as FormValues;
      setFormData(data);
      setFormType("Edit");
      setIsFormOpen(true);
    };

    const importData = async (file: any) => {
      const correctHead = ["description", "amount", "unit"];
      Papa.parse(file, {
        complete: (result) => {
          const header = result.meta.fields;
          if(JSON.stringify(header) === JSON.stringify(correctHead))
          {
            let data = result.data as FormValues[];
            let importNoAcc = newNoAcc;
            data.forEach(function (item) {
                if (item.description == ""
                  &&item.amount == null
                  &&item.unit == null
                ) {
                  setSnackbar({
                    children: "make sure that the file does not end with an empty row.",
                    severity: "error",
                  });
                  throw new Error();
                }
                else if (
                  item.description == null ||
                  item.description === ""
                ) {
                  setSnackbar({
                    children: "description is required",
                    severity: "error",
                  });
                  throw new Error();
                }
                else if (Number(item.amount) == null ||
                  Number(item.amount) < 0){
                  setSnackbar({
                    children:
                      "amount is required",
                    severity: "error",
                  });
                  throw new Error();
                }
                else if (item.unit == null || item.unit === "") {
                  setSnackbar({
                    children: "unit is required",
                    severity: "error",
                  });
                  throw new Error();
                }
                else{
                  item.warehouseID = props.warehouseID;
                  item.accountNo = importNoAcc;
                  importNoAcc = String(Number(importNoAcc)+1);
                }
            });
            setNewNoAcc(importNoAcc);
            setToImport(data as FormValues[]);

            
          }
          else setSnackbar({
            children: "File header does not match",
            severity: "error",
          });
          
        },
        header: true,
      });
    };


  return (
    <div style={{ width: "100%" }}>
      {!!snackbar && (
        <Snackbar
          open
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          onClose={handleCloseSnackbar}
          autoHideDuration={6000}
        >
          <Alert {...snackbar} onClose={handleCloseSnackbar} />
        </Snackbar>
      )}

      <ItemForm
        open={isFormOpen}
        handleClose={handleCloseForm}
        handleConfirm={handleConfirmForm}
        toImport={toImport}
        warehouseID={props.warehouseID}
        formData={formData}
        type={formType}
        newNoAcc={newNoAcc}
        resetNewNoAcc={resetNewNoAcc}
      />

      <CustomHeaderBox
        title={"Item list"}
        right={
          <Box>
            <TextField
              select
              label="Warehouse"
              variant="outlined"
              type="text"
              sx={{
                minWidth: "200px",
              }}
              value={props.warehouseID}
              onChange={updateWarehouse}
            >
              {props.warehouseList.map((w: any) => {
                return (
                  <MenuItem key={w.warehouseID} value={w.warehouseID}>
                    {w.name}
                  </MenuItem>
                );
              })}
            </TextField>
          </Box>
        }
      />

      <CustomDataGrid
        sortModel={sortModel}
        onSortModelChange={(newSortModel: any) => setSortModel(newSortModel)}
        rows={rows}
        setRows={setRows}
        columns={columns}
        dataType={"item"}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        enableImport={true}
        enableExport={true}
        enableEdit={true}
        enableDelete={true}
        addData={addData}
        updateData={updateData}
        deleteData={deleteData}
        importData={importData}
        // sendUpdateData={sendUpdateData}
        viewData={viewData}
      />
    </div>
  );
};

export default Items;