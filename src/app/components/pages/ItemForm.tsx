import { LoadingButton } from "@mui/lab";
import { Alert, AlertProps, Dialog, DialogContent, Snackbar } from "@mui/material";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { doc, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "../utils/FirebaseConfig";

type FormValues = {
  warehouseID: string;
  accountNo: string;
  description: string;
  amount: number;
  unit: string;
};

interface DialogProps {
  type: string;
  open: boolean;
  handleClose: () => void;
  handleConfirm: (newRow: any) => void;
  toImport: any;
  warehouseID: string;
  formData: FormValues;
  newNoAcc: string;
  resetNewNoAcc: () => void;
}

export default function ItemForm({ open, handleClose, handleConfirm, toImport, warehouseID, type, formData, newNoAcc, resetNewNoAcc  }: DialogProps) {
  const { register, handleSubmit, formState, reset } = useForm<FormValues>({});
  const { errors } = formState;
  const [isLoading, setIsLoading] = useState(false);

  const closeForm = () => {
    reset(formData);
    handleClose();
  };

  useEffect(() => {
    reset(formData);
  }, [formData, warehouseID]);

  useEffect(() => {
    if(toImport){
      sendUpdateData(toImport);
    }
  }, [toImport]);

  const formSubmit = (data: FormValues) => {
    sendUpdateData([data]);
  };

  const sendUpdateData = async (data: FormValues[]) => {
    setIsLoading(true);

    try {

      for (const item of data) {        
        if (item.accountNo == newNoAcc) {
          const newItemRef = doc(db, "items", newNoAcc);
          await setDoc(newItemRef, item);
          resetNewNoAcc();
          
          const mid = crypto.randomUUID();
          const mtn = doc(db, "mutations", mid);
          await setDoc(mtn, {
            mutationID: mid,
            accountNo: item.accountNo,
            description: item.description,
            mutationDate: Timestamp.fromDate(new Date()),
            mutationType: "INITIAL STOCK",
            stockIn: 0,
            stockOut: 0,
            stockResult: item.amount,
            mutationNo: null,
            client: null,
          });
          
          console.log(`Added: ${item.description}`);

        } else {
          const docRef = doc(db, "items", item.accountNo);
          await updateDoc(docRef, item);
          console.log(`Updated: ${item.description}`);
        }
      }
      setSnackbar({
        children: "Data successfully saved!",
        severity: "success",
      });
      reset();
      handleConfirm(data);

    } catch (error) {
      console.error("Error importing data:", error);
    } finally {
      setIsLoading(false);
    }

    return data;
  };

  const [snackbar, setSnackbar] = useState<Pick<
    AlertProps,
    "children" | "severity"
  > | null>(null);

  const handleCloseSnackbar = () => setSnackbar(null);

  return (
    <>
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
      <Dialog
        open={open}
        onClose={closeForm}
        maxWidth="xs"
        sx={{
          "& .MuiPaper-root": {
            borderRadius: 6,
            paddingBottom:3,
            paddingRight:1
          },
        }}
      >
        <DialogContent>
          <Container maxWidth="xs">
            <Box>
              <h1>{type} Item</h1>
              <Box
                component="form"
                onSubmit={handleSubmit(formSubmit)}
                sx={{ mt: 1 }}
                noValidate
              >

                <input type="hidden" {...register("warehouseID")} />

                <TextField
                  label="Account No."
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  type="decimal"
                  disabled
                  {...register("accountNo", {
                    required: "Account No. is required",
                  })}
                  error={!!errors.accountNo}
                  helperText={errors.accountNo?.message}
                />

                <TextField
                  label="Item"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  type="text"
                  {...register("description", {
                    required: "Item is required",
                  })}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />

                <TextField
                  label={type === "Edit" ? "Amount" : "Initial stock"}
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  type="number"
                  disabled={type === "Edit"}
                  {...register("amount", {
                    required: "Amount is required",
                  })}
                  error={!!errors.amount}
                  helperText={errors.amount?.message}
                />

                <TextField
                  label="Unit"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  type="text"
                  {...register("unit", {
                    required: "Unit is required",
                  })}
                  error={!!errors.unit}
                  helperText={errors.unit?.message}
                />

                <LoadingButton
                  loading={isLoading}
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2,  fontWeight: "bold"}}
                >
                  Save
                </LoadingButton>
              </Box>
            </Box>
          </Container>
        </DialogContent>
      </Dialog>
    </>
  );
}
