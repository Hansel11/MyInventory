import { GridColDef, GridRowId, GridRowParams, GridRowsProp } from '@mui/x-data-grid';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomDataGrid from '../utils/CustomDatagrid';
import WarehouseForm from './WarehouseForm';
import CustomHeaderBox from '../utils/CustomHeaderBox';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../utils/FirebaseConfig';

type FormValues = {
  warehouseID: string;
  name: string;
};

const initForm: FormValues = {
  warehouseID: "",
  name: "",
};

interface WarehouseProps {
  setWarehouseID: Dispatch<SetStateAction<string>>;
}

export default function Warehouse(props: WarehouseProps) {

  const navigate = useNavigate();
  const [ rows, setRows ] = useState<GridRowsProp>([]);
  const [ isLoading, setIsLoading ] = useState(false);

  const [ formData, setFormData ] = useState<FormValues>(initForm);
  const [ isFormOpen, setIsFormOpen ] = useState(false);
  const [ formType, setFormType ] = useState("");

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleConfirmForm = (newRow: any) => {
    const existingRow = rows.find((row) => row.id === newRow.id);

    if (existingRow) {
      const updatedRows = rows.map((row) =>
        row.id === newRow.id ? { ...row, ...newRow } : row
      );
      setRows(updatedRows);
    } else {
      newRow.id = newRow.warehouseID;
      setRows([...rows, newRow]);
    }
    setIsFormOpen(false);
  };

  const fetchWarehouse = async () => {
    try {
      const collectionRef = collection(db, "warehouses");
      const snapshot = await getDocs(collectionRef);
      const itemsData = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRows(itemsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchWarehouse();
  }, []);

  const viewData = (warehouse: GridRowParams) => {
    props.setWarehouseID(String(warehouse.id));
    navigate("/item");
  }

  const deleteData = async (rowID: GridRowId) => {
    
    setIsLoading(true);
    try {
      setIsLoading(true);
      const docRef = doc(db, "warehouses", rowID.toString());
      await deleteDoc(docRef);

      setRows(rows.filter((row) => row.warehouseID !== rowID.toString()));
    } catch (error) {
      console.error("Error deleting document: ", error);
    } finally {
      setIsLoading(false);
    }

    return rowID;
  };

  const addData = async () => {
    setFormData(initForm);
    setFormType("新規");
    setIsFormOpen(true);
  };

  const updateData = async (rowID: GridRowId) => {
    const data = rows.find((row) => row.id === rowID) as FormValues;
    setFormData(data);
    setFormType("編集");
    setIsFormOpen(true);
  };

  const columns: GridColDef[] = [
    {
      field: "warehouseID",
      headerName: "コード",
      editable: true,
      width: 160,
    },
    {
      field: "name",
      headerName: "在庫",
      editable: true,
      width: 160,
    }

  ];

  return (
    <div style={{ width: "100%" }}>
      
      <CustomHeaderBox
      title={"在庫一覧"}
      />

      <WarehouseForm
        open={isFormOpen}
        type={formType}
        handleConfirm={handleConfirmForm}
        handleClose={handleCloseForm}
        formData={formData}
      />

      <CustomDataGrid
        rows={rows}
        setRows={setRows}
        columns={columns}
        dataType={""}
        
        enableEdit={true}
        enableDelete={true}
        isLoading={isLoading}
        setIsLoading={setIsLoading}

        addData={addData}
        updateData={updateData}
        deleteData={deleteData}
        // sendUpdateData={sendUpdateData}
        viewData={viewData}
      />
    </div>
  );
}

