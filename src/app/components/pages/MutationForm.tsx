import { LoadingButton } from "@mui/lab";
import { Alert, AlertProps, Dialog, DialogContent, MenuItem, Snackbar } from "@mui/material";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
// import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { doc, getDoc, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "../utils/FirebaseConfig";

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
  handleConfirm: (newRow: any, newRowItem: string) => void;
  formData: FormValues;
}

export default function MutationForm({ accountNo, open, handleClose, handleConfirm, type, formData }: DialogProps) {
  const { register, handleSubmit, formState, reset, setValue, getValues } = useForm<FormValues>();
  const { errors } = formState;
  const [isLoading, setIsLoading] = useState(false);

  const [ total, setTotal ] = useState(0);

  const fetchTotal = async () => {
    const itemRef = doc(db, "items", accountNo);
    const itemSS = await getDoc(itemRef);
    if(itemSS.exists()){
      const item = itemSS.data();
      setTotal(item.amount);
    }   
  }

  useEffect(() => {
    try {
      fetchTotal();
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const mutationOpt = [
    { label: "入庫", value: "stockIn" },
    { label: "出庫", value: "stockOut" },
  ];
  const [mutationType, setmutationType] = useState("");

  useEffect(() => {
    if (mutationType === "stockIn") setValue("stockOut", 0);
    if (mutationType === "stockOut") setValue("stockIn", 0);
    setValue("stockResult", getValues("stockAvail"));
  }, [mutationType]);

  useEffect(() => {
    reset(formData);
    if (accountNo != null) setValue("accountNo", accountNo);
    if (total != null) setValue("stockAvail", total);
  }, [formData, total]);

  const formSubmit = (data: FormValues) => {
    console.log(data);
    sendUpdateData(data);
  };

  const sendUpdateData = async (data: FormValues) => {
    setIsLoading(true);

    try {

      const itemRef = doc(db, "items", data.accountNo);
      const itemSS = (await getDoc(itemRef));

      if (itemSS.exists())
      {
        const mutID = crypto.randomUUID();
        const mutRef = doc(db, "mutations", mutID);
        const item = itemSS.data();

        await setDoc(mutRef, {
          mutationID: mutID,
          accountNo: data.accountNo,
          description: item.description,
          mutationDate: Timestamp.fromDate(new Date()),
          mutationType: data.mutationType,
          stockIn: data.stockIn,
          stockOut: data.stockOut,
          stockResult: data.stockResult,
          mutationNo: data.mutationNo,
          client: data.client,
        });
        
        item.amount = data.stockResult;
        await updateDoc(itemRef, item);

        setSnackbar({
          children: "Data successfully saved!",
          severity: "success",
        });
        
        setTotal(data.stockResult);
        reset();
        handleConfirm(data, item.description);
      }
    } catch (error) {
      console.error("Error inserting data:", error);
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

  function updateStok(value: any) {
    const modif = mutationType === "stockIn" ? 1 : -1;
    const result = Number(getValues("stockAvail")) + Number(value) * modif;
    setValue(
      "stockResult", result
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
                <input type="hidden" {...register("mutationID")} />

                <TextField
                  label="商品No."
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
                    label="Mutation Date"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: "outlined",
                        margin: "normal",
                        error: !!errors.mutationDate,
                        helperText: errors.mutationDate?.message,
                        ...register("mutationDate", {
                          required: "Mutation Date is required",
                        }),
                      },
                    }}
                  />
                </LocalizationProvider> */}

                <TextField
                  select
                  label="取引種別"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  type="text"
                  {...register("mutationType", {
                    required: "Mutation type is required",
                    onChange: (e) => {
                      setmutationType(e.target.value);
                    },
                  })}
                  error={!!errors.mutationType}
                  helperText={errors.mutationType?.message}
                >
                  {mutationOpt.map(({ label, value }) => (
                    <MenuItem key={label} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </TextField>

                {mutationType != "" && (
                  <>
                    <TextField
                      label="取引No."
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      type="text"
                      {...register("mutationNo", {
                        required: `Mutation No. is required`,
                      })}
                      error={!!errors.mutationNo}
                      helperText={errors.mutationNo?.message}
                    />

                    <TextField
                      label="残高"
                      disabled
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
                        label="入庫"
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
                            "Value must be positive",
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
                        label="出庫"
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
                            "Value must be positive",
                          onChange: (e) => {
                            updateStok(e.target.value);
                          },
                        })}
                        error={!!errors.stockOut}
                        helperText={errors.stockOut?.message}
                      />
                    )}

                    <TextField
                      label="結果"
                      InputProps={{
                        readOnly: true,
                      }}
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      type="number"
                      defaultValue=""
                      {...register("stockResult", {
                        validate: (value) => value > 0 || "Value must be positive",
                        required: "Stok result is required",
                      })}
                      error={!!errors.stockResult}
                      helperText={errors.stockResult?.message}
                    />

                    <TextField
                      label="クライエント"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      type="text"
                      {...register("client", {
                        required: `Client is required`,
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
