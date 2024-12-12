import { LoadingButton } from "@mui/lab";
import { Alert, AlertProps, Dialog, DialogContent, Snackbar } from "@mui/material";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useAuth from "../utils/useAuth";

type FormValues = {
  name: string;
  code: string;
  gudangID: number;
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
  const { userID, token } = useAuth();

  const url = import.meta.env.VITE_API_URL;

  useEffect(() => {
    reset(formData);
  }, [formData]);

  const formSubmit = (data: FormValues) => {
    sendUpdateData(data);
  };

  const sendUpdateData = async (data: FormValues) => {
    setIsLoading(true);
    

    await fetch(url + "/gudang?userID=" + userID, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.ok) {
          setSnackbar({
            children: "Data berhasil dimasukkan!",
            severity: "success",
          });
          return response.json();
        } else {
          return response.json().then((err) => {
            setSnackbar({
              children: err.detail,
              severity: "error",
            });
            console.error(`Error: ${err}`);
          });
        }
      })
      .then((res) => {
        res.id = res.gudangID;
        reset();
        handleConfirm(res);
      })
      .catch((error) => {
        console.error("There was an error:", error);
        setSnackbar({ children: error.message, severity: "error" });
      })
      .finally(() => {
        setIsLoading(false);
      });

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
              <h1>{type} Gudang</h1>
              <Box
                component="form"
                onSubmit={handleSubmit(formSubmit)}
                sx={{ mt: 1 }}
                noValidate
              >
                <input type="hidden" {...register("gudangID")} />

                <TextField
                  label="Nama Gudang"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  type="text"
                  {...register("name", {
                    required: "Nama Gudang perlu diisi",
                  })}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />

                <TextField
                  label="Kode Gudang"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  type="number"
                  {...register("code", {
                    required: "Jenis Barang perlu diisi",
                    validate: (value) =>
                      value.length == 4 ||
                      "Kode gudang harus berupa angka 4 digit",
                      
                  })}
                  error={!!errors.code}
                  helperText={errors.code?.message}
                />

                <LoadingButton
                  loading={isLoading}
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Simpan
                </LoadingButton>
              </Box>
            </Box>
          </Container>
        </DialogContent>
      </Dialog>
    </>
  );
}
