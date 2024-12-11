
import { Face } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { useForm } from "react-hook-form";
import useAuth from "../utils/useAuth";

type FormValues = {
  username: string;
  password: string;
  confirmPassword: string;
  role: string;
  userID: string;
};

export default function Register() {
  
  const { setToken, setUsername, setUserID, setRole } = useAuth();
  const url = import.meta.env.VITE_API_URL;
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState, watch } = useForm<FormValues>();
  const { errors } = formState;

  const password = watch("password", "");

  const formSubmit = async (data: FormValues) => {
    data.role = '';
      setIsLoading(true);
      await fetch(url + "/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => {
          if (response.status == 400) {
            alert("User already exist!");
            throw new Error();
          }
          return response.json();
        })
        .then((res) => {
          setToken(res);
          setUsername(res.username);
          setUserID(res.userID);
          setRole(res.role);
          setIsLoading(false);
          window.location.reload();
        })
        .catch((error) => {
          console.error("There was an error:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
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
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <Face />
        </Avatar>
        <h1>Register</h1>
        <Box
          component="form"
          onSubmit={handleSubmit(formSubmit)}
          sx={{ mt: 1 }}
          noValidate
        >
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            type="username"
            {...register("username", {
              required: "Username is required",
            })}
            error={!!errors.username}
            helperText={errors.username?.message}
          />

          <TextField
            label="Password"
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

          <TextField
            label="Role"
            variant="outlined"
            fullWidth
            margin="normal"
            type="text"
            {...register("role")}
            value="Guest"
            disabled
            helperText={
              "Untuk mendapatkan role lainnya, harap hubungi admin kami"
            }
          />

          <LoadingButton
            loading={isLoading}
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Register
          </LoadingButton>

          <Grid container>
            <Grid item>
              <Link href="/login" variant="body2">
                {"Have an account? Login"}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}
