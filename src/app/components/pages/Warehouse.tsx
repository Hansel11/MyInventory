import { GridColDef, GridRowId, GridRowParams, GridRowsProp } from '@mui/x-data-grid';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../utils/useAuth';
import CustomDataGrid from '../utils/CustomDatagrid';
import WarehouseForm from './WarehouseForm';
import CustomHeaderBox from '../utils/CustomHeaderBox';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../utils/FirebaseConfig';

type FormValues = {
  gudangID: number;
  name: string;
  code: string;
};

const initForm: FormValues = {
  gudangID: 0,
  name: "",
  code: "",
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
      setRows([...rows, newRow]);
    }
    setIsFormOpen(false);
  };

  const url = import.meta.env.VITE_API_URL;
  const {userID, token} = useAuth();

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
    await fetch(url + `/gudang?userID=${userID}&gudangID=${rowID}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((res) => {
        console.log(res);
      })
      .catch((error) => {
        console.error("There was an error:", error);
        new Error("Error while deleting Gudang");
      })
      .finally(() => {
        setIsLoading(false);
      });

    setRows(rows.filter((row) => row.gudangID !== rowID));
    return rowID;
  };

  const addData = async () => {
    setFormData(initForm);
    setFormType("Tambah");
    setIsFormOpen(true);
  };

  const updateData = async (rowID: GridRowId) => {
    const data = rows.find((row) => row.id === rowID) as FormValues;
    setFormData(data);
    setFormType("Ubah");
    setIsFormOpen(true);
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Warehouse",
      editable: true,
      width: 160,
    },
    {
      field: "code",
      headerName: "Code",
      editable: true,
      width: 160,
    }
  ];

  return (
    <div style={{ width: "100%" }}>
      
      <CustomHeaderBox
      title={"Warehouse list"}
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
        dataType={"warehouse"}
        
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

