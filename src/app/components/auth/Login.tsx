
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { LoadingButton } from "@mui/lab";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { auth } from "../utils/FirebaseConfig";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { CircularProgress } from "@mui/material";


type FormValues = {
  email: string;
  password: string;
  role: string;
  userID: string;
};

interface LoginProps {
  verifying: Boolean
}

export default function Login({verifying}: LoginProps) {
  
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState } = useForm<FormValues>();
  const { errors } = formState;

  const formSubmit = async (data: FormValues) => {
    data.role = '';
      setIsLoading(true);
        try {
          await signInWithEmailAndPassword(auth, data.email, data.password);
          onAuthStateChanged(auth, (user) => {
            if (user) {
              console.log("User is logged in");
            }
          });
        } catch (error: any) {
          alert(error.message);
          console.log(error);
        }
        finally {
          setIsLoading(false);
        }
  };

	return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />

      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {verifying ? (
          <CircularProgress />
        ) : (
          <>
            <Avatar sx={{ m: 1, bgcolor: "primary.dark" }}>
              <LockOutlinedIcon />
            </Avatar>
            <h1>Login</h1>
            <Box
              component="form"
              onSubmit={handleSubmit(formSubmit)}
              sx={{ mt: 1 }}
              noValidate
            >
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                margin="normal"
                type="email"
                {...register("email", {
                  required: "Email is required",
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
              />

              <TextField
                label="Password"
                variant="outlined"
                fullWidth
                autoComplete="new-password"
                margin="normal"
                type="password"
                {...register("password", {
                  required: "password is required",
                })}
                error={!!errors.password}
                helperText={errors.password?.message}
              />

              <LoadingButton
                loading={isLoading}
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign In
              </LoadingButton>

              {/* <Grid container>
            <Grid item>
              <Link href="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid> */}
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
}
