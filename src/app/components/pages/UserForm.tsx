import { LoadingButton } from "@mui/lab";
import { Alert, AlertProps, Button, Dialog, DialogContent, MenuItem, Snackbar } from "@mui/material";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useAuth from "../utils/useAuth";

type FormValues = {
  username: string;
  role: string;
  gudangID: number;
  userID: number;
  password: string;
  confirmPassword: string;
};

interface DialogProps {
  type: string;
  open: boolean;
  handleClose: () => void;
  handleConfirm: (newRow: any) => void;
  formData: FormValues;
  gudangOpt: any[];
}

export default function UserForm({ open, handleClose, handleConfirm, type, formData, gudangOpt }: DialogProps) {
  const { register, handleSubmit, formState, reset, watch } = useForm<FormValues>();
  const { errors } = formState;
  const [isLoading, setIsLoading] = useState(false);
  const { userID, token, setUsername } = useAuth();
  const [ isSelf, setIsSelf ] = useState(false);

  const password = watch("password", "");

  const [showPass, setShowPass] = useState(false);

  const closeAndReset = () => {
    handleClose();
    setShowPass(false);
  }

  const confirmAndReset = (res: any) => {
    handleConfirm(res);
    setShowPass(false);
  };

  const handleTogglePass = () => {
    setShowPass(!showPass);
  };
  
  const rolesOpt = [
    // { label: "Guest", value: "Guest" },
    { label: "Staff Gudang", value: "Staff Gudang" },
    { label: "Staff Purchasing", value: "Staff Purchasing" },
    // { label: "Admin", value: "Admin" },
  ];

  const url = import.meta.env.VITE_API_URL;

    useEffect(() => {
      reset(formData);
      setIsSelf(userID == (formData.userID as unknown as string));
    }, [formData]);

    const formSubmit = (data: FormValues) => {
      if(data.userID == 0)addNewUser(data);
      else sendUpdateData(data);
    };

    const addNewUser = async (data: FormValues) => {
      setIsLoading(true);
      await fetch(url + `/user/new?userID=${userID}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => {
          if (response.status == 400 || response.status == 500) {
            return response.json().then((err) => {
              setSnackbar({
                children: err.detail,
                severity: "error",
              });
              console.error(`Error: ${err}`);
            });
          }
          if (response.ok) {
            setSnackbar({
              children: "User berhasil ditambahkan!",
              severity: "success",
            });
          }
          return response.json();
        })
        .then((res) => {
          res.id = res.userID;
          reset();
          confirmAndReset(res);
        })
        .catch((error) => {
          console.error("There was an error:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    };

  const sendUpdateData = async (data: FormValues) => {
    setIsLoading(true);
    await fetch(url + "/user?userID=" + userID, {
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
        res.id = res.userID;
        if (res.userID == userID) {
          setUsername(res.username);
          window.location.reload();
        }

        reset();
        handleConfirm(res);
      })
      .catch((error) => {
        console.error("There was an error:", error);
        new Error(`Error: ${error}`);
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
        onClose={closeAndReset}
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
              <h1>{type} Pengguna</h1>
              <Box
                component="form"
                onSubmit={handleSubmit(formSubmit)}
                sx={{ mt: 1 }}
                noValidate
              >
                {/* <input
                type="hidden"
                {...register("gudangID")}
                value={0}
              /> */}

                <TextField
                  label="Username"
                  variant="outlined"
                  fullWidth
                  // disabled={formData.userID != 0}
                  margin="normal"
                  type="text"
                  {...register("username", {
                    required: "Nama Gudang perlu diisi",
                  })}
                  error={!!errors.username}
                  helperText={errors.username?.message}
                />

                {!isSelf && (
                <TextField
                  select
                  label="Role"
                  variant="outlined"
                  fullWidth
                  disabled={isSelf}
                  margin="normal"
                  type="text"
                  defaultValue={formData.role}
                  {...register("role", {
                    required: "Role perlu diisi",
                    // onChange: (e) => {
                    //   // setSelectRole(e.target.value);
                    // },
                  })}
                  error={!!errors.role}
                  helperText={
                    isSelf
                      ? "Tidak bisa mengganti role diri sendiri!"
                      : errors.role?.message
                  }
                >
                  {rolesOpt.map(({ label, value }) => (
                    <MenuItem key={label} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </TextField>
                )}

                {!isSelf && (
                  <TextField
                    select
                    label="Gudang"
                    variant="outlined"
                    fullWidth
                    disabled={isSelf}
                    margin="normal"
                    type="text"
                    defaultValue={formData.gudangID == 0 ? "" : formData.gudangID}
                    {...register("gudangID", {
                      required: "Gudang perlu diisi",
                    })}
                    error={!!errors.gudangID}
                    helperText={
                      isSelf
                        ? "Tidak bisa mengganti gudang diri sendiri!"
                        : errors.gudangID?.message
                    }
                  >
                    {gudangOpt.map(({ id, namaGudang }) => (
                      <MenuItem key={namaGudang} value={id}>
                        {namaGudang}
                      </MenuItem>
                    ))}
                  </TextField>
                )}

                {formData.userID !== 0 && (
                  <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    sx={{ mt: 2, mb: 1 }}
                    onClick={handleTogglePass}
                  >
                    {showPass ? "Keep Password" : "Change password"}
                  </Button>
                )}

                {(formData.userID == 0 || showPass) && (
                  <>
                    <TextField
                      label={showPass ? "New Password" : "Password"}
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      type="password"
                      {...register("password", {
                        required: "password is required",
                      })}
                      error={!!errors.password}
                      helperText={errors.password?.message}
                    />

                    <TextField
                      label="Confirm Password"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      type="password"
                      {...register("confirmPassword", {
                        required: "confirm password is required",
                        validate: (value) => {
                          if (value === password) {
                            return true; // Passwords match
                          } else {
                            return "Passwords do not match";
                          }
                        },
                      })}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword?.message}
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
