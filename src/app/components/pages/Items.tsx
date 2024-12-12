import { Alert, AlertProps, Box, MenuItem, Snackbar, TextField } from '@mui/material';
import { GridColDef, GridRowId, GridRowParams, GridRowsProp } from '@mui/x-data-grid';
import Papa from 'papaparse';
import { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomDataGrid from '../utils/CustomDatagrid';
import CustomHeaderBox from '../utils/CustomHeaderBox';
import useAuth from '../utils/useAuth';
import ItemForm from './ItemForm';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../utils/FirebaseConfig';

const columns: GridColDef[] = [
  { field: "accountNo", headerName: "Account No.", width: 150, editable: true },
  { field: "description", headerName: "Item", width: 420, editable: true },
  { field: "amount", headerName: "Amount", type: "number", width: 100, editable: true },
  { field: "unit", headerName: "Unit", width: 120, editable: true }
];

type FormValues = {
  itemID: number;
  warehouseID: number;
  accountNo: string;
  description: string;
  amount: number;
  unit: string;
};

const initForm: FormValues = {
  itemID: 0,
  warehouseID: 0,
  accountNo: "",
  description: "",
  amount: 0,
  unit: "",
};

interface ItemProps {
  warehouse: number;
  setWarehouse: Dispatch<SetStateAction<number>>;
  warehouseList: any[];
  // setWarehouseList: Dispatch<SetStateAction<any[]>>;
  warehouseCode: string;
}

function Items(props: ItemProps) {

  const url = import.meta.env.VITE_API_URL;
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
      newRow.id = newRow.itemID;
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

  //NEED TO IMPLEMENT, DONT FORGER TO CHANGE UPDATE REQUEST FROM warehouseID TO itemID

  // const handleConfirmForm = (newRow: any) => {
  //   const existingRow = rows.find((row) => row.id === newRow.id);

  //   if (existingRow) {
  //     const updatedRows = rows.map((row) =>
  //       row.id === newRow.id ? { ...row, ...newRow } : row
  //     );
  //     setRows(updatedRows);
  //   } else {
  //     setRows([...rows, newRow]);
  //   }
  //   setIsFormOpen(false);
  // };

  const {token, userID} = useAuth();

  const navigate = useNavigate();

  const viewData = (item: GridRowParams) => {
    navigate("/mutation", { state: { 
      itemID: item.id,
      itemName: item.row.description,
      accountNo: item.row.accountNo,
      amount: item.row.amount
    }});
  };

  const [newNoAcc, setNewNoAcc] = useState("");

  const fetchItems = async () => {
    try {
      const collectionRef = collection(db, "items");
      const q = query(collectionRef, where("warehouseID", "==", props.warehouse)); // Query with condition

      const snapshot = await getDocs(q);
      const itemData = await snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setRows(itemData);
      setNewNoAcc(
        rows[0] == null
          ? props.warehouseCode + "00001"
          : String(Number(rows[rows.length - 1].AccountNo) + 1)
      );

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [props.warehouse, props.warehouseList]);

  useEffect(()=>{
    setNewNoAcc(
      rows[0] == null
        ? props.warehouseCode + "00001"
        : String(Number(rows[rows.length - 1].accountNo) + 1));
  },[rows]);

  const deleteData = async (rowID: GridRowId) => {

    setIsLoading(true);
    await fetch(url + `/barang?userID=${userID}&itemID=${rowID}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .catch((error) => {
        console.error("There was an error:", error);
        new Error("Error while deleting Barang");
      })
      .finally(() => {
        setIsLoading(false);
      });

    setRows(rows.filter((row) => row.itemID !== rowID));
    return rowID;
  };

  const updateWarehouse = (updateProps: any ) => {
    const warehouseID = updateProps.target.value;
    props.setWarehouse(warehouseID);
  }

    const addData = async () => {
      let newForm = Object.assign({}, initForm);
      newForm.accountNo = newNoAcc;
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
                  item.warehouseID = props.warehouse;
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
        warehouseID={props.warehouse}
        formData={formData}
        type={formType}
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
              value={props.warehouse}
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