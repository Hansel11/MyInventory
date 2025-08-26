import { LoadingButton } from "@mui/lab";
import { Alert, AlertProps, Dialog, DialogContent, Snackbar } from "@mui/material";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../utils/FirebaseConfig";

type FormValues = {
  name: string;
  warehouseID: string;
};

interface DialogProps {
  type: string;
  open: boolean;
  handleClose: () => void;
  handleConfirm: (newRow: any) => void;
  formData: FormValues;
}

export default function WarehouseForm({ open, handleClose, handleConfirm, type, formData }: DialogProps) {
  const { register, handleSubmit, formState, reset } = useForm<FormValues>();
  const { errors } = formState;
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    reset(formData);
  }, [formData]);

  const formSubmit = (data: FormValues) => {
    sendUpdateData(data);
  };

  const sendUpdateData = async (data: FormValues) => {
    setIsLoading(true);

    try {
      const whRef = doc(db, "warehouses", data.warehouseID);
      await setDoc(whRef, data);
      
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
        onClose={handleClose}
        maxWidth="xs"
        sx={{
          "& .MuiPaper-root": {
            borderRadius: 6,
            paddingBottom: 3,
            paddingRight: 1,
          },
        }}
      >
        <DialogContent>
          <Container maxWidth="xs">
            <Box>
              <h1>{type}</h1>
              <Box
                component="form"
                onSubmit={handleSubmit(formSubmit)}
                sx={{ mt: 1 }}
                noValidate
              >

                <TextField
                  label="コード"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  type="string"
                  disabled={type === "Edit"}
                  {...register("warehouseID", {
                    required: "Warehouse code is required",
                    validate: (value) =>
                      value.length == 4 || "Warehouse code must be 4 digit",
                  })}
                  error={!!errors.warehouseID}
                  helperText={errors.warehouseID?.message}
                />

                <TextField
                  label="在庫名"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  type="text"
                  {...register("name", {
                    required: "Warehouse name is required",
                  })}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />

                <LoadingButton
                  loading={isLoading}
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  保存
                </LoadingButton>
              </Box>
            </Box>
          </Container>
        </DialogContent>
      </Dialog>
    </>
  );
}
