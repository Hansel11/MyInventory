import { LoadingButton } from "@mui/lab";
import { Alert, AlertProps, Dialog, DialogContent, MenuItem, Snackbar } from "@mui/material";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
// import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useAuth from "../utils/useAuth";

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

interface DialogProps {
  accountNo: string;
  stokAwal: number; // TO REMOVE
  type: string;
  open: boolean;
  handleClose: () => void;
  handleConfirm: (newRow: any) => void;
  formData: FormValues;
}

export default function MutationForm({ accountNo, open, handleClose, handleConfirm, type, formData }: DialogProps) {
  const { register, handleSubmit, formState, reset, setValue, getValues } = useForm<FormValues>();
  const { errors } = formState;
  const [isLoading, setIsLoading] = useState(false);
  const { userID, token } = useAuth();

  const [ jumlah, setJumlah ] = useState(0);

    useEffect(() => {
      if (accountNo != null) {
        fetch(url + `/barang?accountNo=${accountNo}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            setJumlah(data[0].jumlah);
          })
          .catch((error) => {
            console.error("Error:", error);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    }, []);

  const mutasiOpt = [
    { label: "stockIn", value: "stockIn" },
    { label: "stockOut", value: "stockOut" },
  ];
  const [mutationType, setmutationType] = useState("");

  const url = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (mutationType === "stockIn") setValue("stockOut", 0);
    if (mutationType === "stockOut") setValue("stockIn", 0);
    setValue("stockResult", getValues("stockAvail"));
  }, [mutationType]);

  useEffect(() => {
    reset(formData);
    if (accountNo != null) setValue("accountNo", accountNo);
    if (jumlah != null) setValue("stockAvail", jumlah);
  }, [formData, jumlah]);

  const formSubmit = (data: FormValues) => {
    console.log(data);
    sendUpdateData(data);
  };

  const sendUpdateData = async (data: FormValues) => {
    setIsLoading(true);

    await fetch(url + "/mutasi?userID=" + userID, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([data]),
    })
      .then((response) => {
        if (response.ok) {
          setSnackbar({
            children: "Data berhasil distockInkan!",
            severity: "success",
          });
          return response.json();
        } else {
          return response.json().then((err) => {
            setSnackbar({
              children: err.detail ?? "Terjadi error tidak terduga",
              severity: "error",
            });
            throw new Error(err);
          });
        }
      })
      .then((res) => {
        res.id = res.mutasiID;
        setJumlah(data.stockResult);
        reset();
        handleConfirm(res);
      })
      .catch((error) => {
        console.error("There was an error:", error);
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

  function updateStok(value: any) {
    const modif = mutationType === "stockIn" ? 1 : -1;
    const akhir = getValues("stockAvail") + Number(value) * modif;
    setValue(
      "stockResult", akhir
    );
  }

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
            paddingBottom:3,
            paddingRight:1
          },
        }}
      >
        <DialogContent>
          <Container maxWidth="xs">
            <Box>
              <h1>{type} Mutasi</h1>
              <Box
                component="form"
                onSubmit={handleSubmit(formSubmit)}
                sx={{ mt: 1 }}
                noValidate
              >
                <input type="hidden" {...register("mutationID")} />

                <TextField
                  label="No Account"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  type="text"
                  {...register("accountNo", {
                    required: "No Account perlu diisi",
                  })}
                  disabled={accountNo != null}
                  error={!!errors.accountNo}
                  helperText={errors.accountNo?.message}
                />

                {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    format="YYYY/MM/DD"
                    label="Tanggal Mutasi"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: "outlined",
                        margin: "normal",
                        error: !!errors.mutationDate,
                        helperText: errors.mutationDate?.message,
                        ...register("mutationDate", {
                          required: "Tanggal Mutasi perlu diisi",
                        }),
                      },
                    }}
                  />
                </LocalizationProvider> */}

                <TextField
                  select
                  label="Jenis Mutasi"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  type="text"
                  {...register("mutationType", {
                    required: "Jenis Mutasi perlu dipilih",
                    onChange: (e) => {
                      setmutationType(e.target.value);
                    },
                  })}
                  error={!!errors.mutationType}
                  helperText={errors.mutationType?.message}
                >
                  {mutasiOpt.map(({ label, value }) => (
                    <MenuItem key={label} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </TextField>

                {mutationType != "" && (
                  <>
                    <TextField
                      label={`No. ${mutationType === "stockIn" ? "PO" : "FPB"}`}
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      type="text"
                      {...register("mutationNo", {
                        required: `No. ${
                          mutationType === "stockIn" ? "PO" : "FPB"
                        } perlu diisi`,
                      })}
                      error={!!errors.mutationNo}
                      helperText={errors.mutationNo?.message}
                    />

                    <TextField
                      label="Stok tersedia"
                      disabled
                      // InputProps={{
                      //   readOnly: true,
                      // }}
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      type="number"
                      {...register("stockAvail")}
                      error={!!errors.stockAvail}
                      helperText={errors.stockAvail?.message}
                    />

                    {mutationType === "stockIn" && (
                      <TextField
                        label="stockIn"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        type="number"
                        defaultValue=""
                        {...register("stockIn", {
                          required: "stockIn perlu diisi",
                          validate: (value) =>
                            value > 0 ||
                            mutationType !== "stockIn" ||
                            "Nilai harus positif",
                          onChange: (e) => {
                            updateStok(e.target.value);
                          },
                        })}
                        error={!!errors.stockIn}
                        helperText={errors.stockIn?.message}
                      />
                    )}

                    {mutationType === "stockOut" && (
                      <TextField
                        label="stockOut"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        type="number"
                        defaultValue=""
                        {...register("stockOut", {
                          required: "stockOut perlu diisi",
                          validate: (value) =>
                            value > 0 ||
                            mutationType !== "stockOut" ||
                            "Nilai harus positif",
                          onChange: (e) => {
                            updateStok(e.target.value);
                          },
                        })}
                        error={!!errors.stockOut}
                        helperText={errors.stockOut?.message}
                      />
                    )}

                    <TextField
                      label="Stok Akhir"
                      InputProps={{
                        readOnly: true,
                      }}
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      type="number"
                      defaultValue=""
                      {...register("stockResult", {
                        validate: (value) => value > 0 || "Nilai harus positif",
                        required: "Stok Akhir perlu diisi",
                      })}
                      error={!!errors.stockResult}
                      helperText={errors.stockResult?.message}
                    />

                    <TextField
                      label={mutationType === "stockIn" ? "Vendor" : "Asrama"}
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      type="text"
                      {...register("client", {
                        required: `${
                          mutationType === "stockIn" ? "Vendor" : "Asrama"
                        } perlu diisi`,
                      })}
                      error={!!errors.client}
                      helperText={errors.client?.message}
                    />
                  </>
                )}

                <LoadingButton
                  loading={isLoading}
                  type="submit"
                  fullWidth
                  variant="contained"
                  onClick={() => {
                    // console.log(formData);
                  }}
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
