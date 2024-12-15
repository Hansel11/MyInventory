import { Box } from "@mui/material";
import {
  GridColDef,
  GridColumnVisibilityModel,
  GridRowsProp,
  GridValueGetterParams
} from "@mui/x-data-grid";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import CustomDataGrid from "../utils/CustomDatagrid";

import dayjs, { Dayjs } from "dayjs";
import CustomHeaderBox from "../utils/CustomHeaderBox";
import MutationForm from "./MutationForm";
import { db } from "../utils/FirebaseConfig";
import { collection, getDocs, query, Timestamp, where } from "firebase/firestore";

type FormValues = {
  mutationID: number;
  accountNo: string;
  mutationDate: Date;
  mutationType: string;
  mutationNo: string;
  stockIn: number;
  stockOut: number;
  stockAvail: number;
  stockResult: number;
  client: string;
};

const initForm: FormValues = {
  mutationID: 0,
  accountNo: "",
  mutationDate: new Date(),
  mutationType: "",
  mutationNo: "",
  stockIn: 0,
  stockOut: 0,
  stockAvail: 0,
  stockResult: 0,
  client: "",
};

interface MutationProps {
  warehouse: string;
  setWarehouse: Dispatch<SetStateAction<string>>;
  warehouseList: any[];
  setWarehouseList: Dispatch<SetStateAction<any[]>>;
}

export default function Mutations(props: MutationProps) {

    const [rows, setRows] = useState<GridRowsProp>([]);
    const [newRowID, setnewRowID] = useState(-1);
    const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>();

    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();

    const [startDate, setStartDate] = useState<Dayjs | null>(
      dayjs().subtract(30, 'days')
    );
    const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
    const [itemName, setItemName] = useState();

    const [formData, setFormData] = useState<FormValues>(initForm);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formType, setFormType] = useState("");

    const fetchMutations = async () => {
      try {
        const stateAccNo = location.state?.accountNo;
        setItemName(location.state?.itemName);

        const collectionRef = collection(db, "mutations");
        let q;
        if (!stateAccNo) q = query(
          collectionRef,
          where("mutationDate", ">=", startDate?.toDate()),
          where("mutationDate", "<=", endDate?.toDate())
        );
        else q = query(
          collectionRef,
          where("accountNo", "==", stateAccNo),
          where("mutationDate", ">=", startDate?.toDate()),
          where("mutationDate", "<=", endDate?.toDate())
        );

        const snapshot = await getDocs(q);
        const mutData = await snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setRows(mutData);
        if (stateAccNo != null) {
          setColumnVisibilityModel({
            accountNo: false,
            itemName: false,
            actions: false,
          });
        } else setColumnVisibilityModel({});

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {      
      setIsLoading(true);
      fetchMutations();
    }, [location, startDate, endDate, props.warehouse]);

    useEffect(() => {
      if (rows.length > 0) {
        const lastRow = rows[rows.length - 1];
        setnewRowID(lastRow.id + 1);
      }
    }, [rows]);

      const addData = async () => {
        setFormData(initForm);
        setFormType("Add");
        setIsFormOpen(true);
      };
    
    const columns: GridColDef[] = [
      {
        field: "accountNo",
        headerName: "Account No",
        width: 120,
      },
      {
        field: "description",
        headerName: "Item",
        width: 240,
      },
      {
        field: "mutationDate",
        headerName: "Date",
        width: 100,
        valueGetter: (params: GridValueGetterParams) => {
          return params.row.mutationDate instanceof Timestamp
            ? params.row.mutationDate.toDate().toLocaleString("id-ID")
            : params.row.mutationDate.toLocaleString("id-ID");
        },
      },
      {
        field: "mutationType",
        headerName: "Type",
        width: 160,
      },
      {
        field: "mutationNo",
        headerName: "Mutation No",
        width: 120,
        valueGetter: (params: GridValueGetterParams) => {
          return params.row.mutationNo == null ? "-" : params.row.mutationNo;
        },
      },
      {
        field: "stockIn",
        headerName: "In",
        type: "number",
        width: 80,
        valueGetter: (params: GridValueGetterParams) => {
          return params.row.stockIn == null || params.row.stockIn == 0
            ? "-"
            : params.row.stockIn;
        },
      },
      {
        field: "stockOut",
        headerName: "Out",
        type: "number",
        width: 80,
        valueGetter: (params: GridValueGetterParams) => {
          return params.row.stockOut == null || params.row.stockOut == 0
            ? "-"
            : params.row.stockOut;
        },
      },
      {
        field: "stockResult",
        headerName: "Result",
        type: "number",
        width: 100,
      },
      {
        field: "client",
        headerName: "Client",
        width: 160,
        valueGetter: (params: GridValueGetterParams) => {
          return params.row.client == null ? "-" : params.row.client;
        },
      },
    ];

      const handleCloseForm = () => {
        setIsFormOpen(false);
      };

      const handleConfirmForm = (newRow: any, newRowItem: string) => {
        newRow.id = newRow.mutationID;
        newRow.description = newRowItem;
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

  return (
    <>
      <MutationForm
        accountNo={location.state?.accountNo}
        stokAwal={location.state?.amount}
        open={isFormOpen}
        type={formType}
        handleConfirm={handleConfirmForm}
        handleClose={handleCloseForm}
        formData={formData}
      />
      <CustomHeaderBox
      title = {"Mutation List"}
      subtitle = {itemName}

        right={<Box>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: "flex", gap: "8px" }}>
              <DatePicker
                sx={{ width: "160px" }}
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
              />
              <DatePicker
                sx={{ width: "160px" }}
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
              />
            </Box>
          </LocalizationProvider>
        </Box>}
      />

      <CustomDataGrid
        rows={rows}
        setRows={setRows}
        columns={columns}
        columnVisibilityModel={columnVisibilityModel}
        dataType={"mutation"}
        enableExport={true}
        enableEdit={false}
        enableDelete={false}
        enableAdd={itemName != null}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        addData={addData}
        viewData={() => null}
        isCellEditable={(params: any) => {
          return params.row.id >= newRowID;
        }}
      />
    </>
  );
}
