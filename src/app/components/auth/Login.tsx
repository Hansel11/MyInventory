
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { LoadingButton } from "@mui/lab";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { auth } from "../utils/FirebaseConfig"; // Import your auth instance
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";


type FormValues = {
  email: string;
  password: string;
  role: string;
  userID: string;
};

export default function Login() {
  
  // const { setToken, setRole, setUsername, setUserID, setGudangAccess } = useAuth();
  // const url = import.meta.env.VITE_API_URL;
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
              console.log("User is logged in:", user);
              // window.location.reload();
            }
          });
        } catch (error: any) {
          alert(error.message);
          console.log(error);
        }
        finally {
          setIsLoading(false);
        }


      // await fetch( url + "/login", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(data),
      // })
      // .then((response) => {
      //   if (response.status == 400) {
      //     alert("User doesn't exist!");
      //     throw new Error();
      //   }
      //   if (response.status == 401) {
      //     alert("Password is wrong!");
      //     throw new Error();
      //   }
      //   return response.json();
      // })
      // .then((res) => {
      //   // setToken(res);
      //   // setUsername(res.username);
      //   // setUserID(res.userID);
      //   // setRole(res.role);
      //   // setGudangAccess(res.gudangID);
      //   // setIsLoading(false);
      //   window.location.reload();
      // })
      // .catch((error) => {
      //   console.error("There was an error:", error);
      // }).finally(() => {
      //   setIsLoading(false);
      // });
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
      </Box>
    </Container>
  );
}
