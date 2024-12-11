import { GridColDef, GridRowId, GridRowsProp } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import CustomDataGrid from '../utils/CustomDatagrid';
import CustomHeaderBox from '../utils/CustomHeaderBox';
import useAuth from '../utils/useAuth';
import UserForm from './UserForm';

type FormValues = {
  userID: number;
  username: string;
  role: string;
  gudangID: number;
  password: string;
  confirmPassword: string;
};

const initForm: FormValues = {
  userID: 0,
  username: "",
  role: "",
  gudangID: 0,
  password: "",
  confirmPassword: ""
};

interface UserProps {
  gudangList: any[];
}

export default function User({gudangList}:UserProps) {

  const { token } = useAuth();
  const [ rows, setRows ] = useState< GridRowsProp >([]);
  const [ isLoading, setIsLoading ] = useState(false);

  const [formData, setFormData] = useState<FormValues>(initForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState("");

  const url = import.meta.env.VITE_API_URL;

  useEffect(() => {
    setIsLoading(true);
    fetch(url + "/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const user = data.map((item: any) => ({
          ...item,
          id: item.userID,
          
        }));
        setRows(user);
      })
      .catch((error) => {
        console.error("Error:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

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

  const columns: GridColDef[] = [
    {
      field: "username",
      headerName: "Username",
      width: 160,
    },
    {
      field: "role",
      headerName: "Role",
      width: 160,
    },
    {
      field: "gudang",
      headerName: "Gudang",
      width: 160,
    },
    {
      field: "gudangID",
      headerName: "GudangID"
    },
  ];

  return (
    <div style={{ width: "100%" }}>
      <CustomHeaderBox title="Daftar Pengguna" />

      <UserForm
        open={isFormOpen}
        type={formType}
        handleConfirm={handleConfirmForm}
        handleClose={handleCloseForm}
        formData={formData}
        gudangOpt={gudangList}
      />

      <CustomDataGrid
        rows={rows}
        setRows={setRows}
        columns={columns}
        columnVisibilityModel={{ gudangID: false }}
        dataType={"Pengguna"}
        focusField={"role"}
        enableDelete={false}
        enableEdit={true}
        enableAdd={true}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        updateData={updateData}
        addData={addData}
        viewData={() => null}
        // isCellEditable={(params: any) => { return params.row.id >= newRowID } }
      />
    </div>
  );
}

