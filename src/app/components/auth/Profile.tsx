
// import { Face } from "@mui/icons-material";
// import { LoadingButton } from "@mui/lab";
// import { Button } from "@mui/material";
// import Avatar from "@mui/material/Avatar";
// import Box from "@mui/material/Box";
// import Container from "@mui/material/Container";
// import CssBaseline from "@mui/material/CssBaseline";
// import TextField from "@mui/material/TextField";
// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import useAuth from "../utils/useAuth";

// type FormValues = {
//   userID: Number;
//   username: string;
//   password: string;
//   confirmPassword: string;
//   role: string;
// };

// export default function Profile() {
  
//   const { userID, username, role, token } = useAuth();
//   const url = import.meta.env.VITE_API_URL;
//   const [showPass, setShowPass] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
    
//   const { register, handleSubmit, formState, watch } = useForm<FormValues>();
  
//   const password = watch("password", "");

//   const { errors } = formState;

//   const handleTogglePass = () => {
//     setShowPass(!showPass);
//   };

//   const formSubmit = async (data: FormValues) => {

//       setIsLoading(true);
//       data.userID = Number(userID);

//       console.log(data);
//       await fetch(url + "/user?userID=" + userID, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(data),
//       })
//         .then((response) => {
//           if (response.status == 400) {
//             alert("User doesn't exist!");
//             throw new Error();
//           }
//           if (response.status == 401) {
//             alert("Unexpected Error");
//             throw new Error();
//           }
//           return response.json();
//         })
//         .then((res) => {
//           alert("heysa" + res);
//         })
//         .catch((error) => {
//           console.error("There was an error:", error);
//         })
//         .finally(() => {
//           setIsLoading(false);
//         });
//   };

// 	return (
//     <Container component="main" maxWidth="xs">
//       <CssBaseline />
//       <Box
//         sx={{
//           marginTop: 8,
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//         }}
//       >
//         <Avatar sx={{ m: 1, bgcolor: "primary.dark" }}>
//           <Face />
//         </Avatar>
//         <h1>Edit Profile</h1>
//         <Box
//           component="form"
//           onSubmit={handleSubmit((data) => {
//             console.log("handleSubmit triggered"); // Debugging log
//             formSubmit(data);
//           })}
//           sx={{ mt: 1 }}
//           noValidate
//         >

//           <TextField
//             label="Username"
//             variant="outlined"
//             fullWidth
//             margin="normal"
//             type="username"
//             defaultValue={username}
//             {...register("username", {
//               required: "Username is required",
//             })}
//             error={!!errors.username}
//             helperText={errors.username?.message}
//           />

//           <TextField
//             label="Role"
//             variant="outlined"
//             disabled
//             fullWidth
//             margin="normal"
//             type="text"
//             defaultValue={role}

//           />

//           <Button
//             fullWidth
//             variant="contained"
//             color="secondary"
//             sx={{ mt: 2, mb: 1 }}
//             onClick={handleTogglePass}
//           >
//             {showPass ? "Keep Password" : "Change password"}
//           </Button>

//           {showPass && (
//             <>
//               <TextField
//                 label={showPass ? "New Password" : "Password"}
//                 variant="outlined"
//                 fullWidth
//                 margin="normal"
//                 type="password"
//                 {...register("password", {
//                   required: "password is required",
//                 })}
//                 error={!!errors.password}
//                 helperText={errors.password?.message}
//               />

//               <TextField
//                 label="Confirm Password"
//                 variant="outlined"
//                 fullWidth
//                 margin="normal"
//                 type="password"
//                 {...register("confirmPassword", {
//                   required: "confirm password is required",
//                   validate: (value) => {
//                     if (value === password) {
//                       return true; // Passwords match
//                     } else {
//                       return "Passwords do not match";
//                     }
//                   },
//                 })}
//                 error={!!errors.confirmPassword}
//                 helperText={errors.confirmPassword?.message}
//               />
//             </>
//           )}

//           <LoadingButton
//             loading={isLoading}
//             type="submit"
//             fullWidth
//             variant="contained"
//             sx={{ mt: 3, mb: 2 }}
//           >
//             Save
//           </LoadingButton>


//         </Box>
//       </Box>
//     </Container>
//   );
// }
