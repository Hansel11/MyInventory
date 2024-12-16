import MenuIcon from '@mui/icons-material/Menu';
import { ListItemIcon } from '@mui/material';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import MainListItems, { AuthNavItems, bottomListItems, GuestNavItems } from './Nagivations';
import Login from './components/auth/Login';
import '@fontsource/roboto';
import NotFound from './components/others/NotFound';
import Unauthorized from './components/others/Unauthorized';
import About from './components/pages/About';
import Items from './components/pages/Items';
import Mutations from './components/pages/Mutations';
import Warehouse from './components/pages/Warehouse';
import ThemeSwitch from './components/utils/ThemeSwitch';
import useThemeMode from './components/utils/useThemeMode';

import { collection, getDocs } from "firebase/firestore";
import { auth, db } from './components/utils/FirebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';

// import Profile from './components/auth/Profile';

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  })
}));

const CustomDrawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    boxShadow: theme.shadows[10],
    position: "relative",
    width: 240,

    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),

    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

const Dashboard:React.FC = () => {
  // const { token, warehouseAccess } = useAuth();
  //////////////temp////////////////////
  // const warehouseAccess = 1;
  //////////////////////////////////////

  const role = "Admin";
  const [user, setUser] = useState<User | null>(null);

  const [open, setOpen] = useState(true);
  const [warehouseList, setWarehouseList] = useState<any[]>([]);
  const [warehouseID, setWarehouseID] = useState("");
  const [verifying, setVerifying] = useState(true);
  

  const fetchWarehouse = async () => {
    try {
      const collectionRef = collection(db, "warehouses");
      const snapshot = await getDocs(collectionRef);
      const warehouseData = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWarehouseList(warehouseData);
      setWarehouseID(warehouseData[0].warehouseID);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    setVerifying(true);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setVerifying(false);
    });

    fetchWarehouse();
    return () => unsubscribe();

  }, []);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const { theme, setTheme } = useThemeMode();

  const handleSwitch = () => {
    const newTheme = theme == "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  const darkTheme = createTheme({
    palette: {
      mode: "dark",
    },
    typography: {
      fontFamily: "Montserrat, sans-serif",
    },
  });

  const lightTheme = createTheme({
    typography: {
      fontFamily: "Montserrat, sans-serif",
    },
  });

  return (
    <ThemeProvider theme={theme == "dark" ? darkTheme : lightTheme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar
          position="absolute"
          open={open}
          sx={{ backgroundColor: "#000000" }}
        >
          <Toolbar
            sx={theme == "dark" ? {} : { backgroundColor: "primary.light" }}
          >
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                paddingLeft: 1.5,
                paddingRight: 1.5,
                marginRight: 1,
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component={"span"}
              color="inherit"
              noWrap
              sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}
            >
              <ListItemIcon>
                <img src="/logo.png" width="48" height="48" />
              </ListItemIcon>
              <Box
                display="inline"
                sx={{
                  fontWeight: "bold",
                  fontSize: "h5.fontSize",
                  fontFamily: "Poppins",
                }}
              >
                MyInventory
              </Box>
            </Typography>

            <Box display="flex" alignItems="center">
              <Box>
                <ThemeSwitch
                  checked={theme == "dark"}
                  onChange={handleSwitch}
                  name="dark mode"
                />
              </Box>
              <Box>{user ? <AuthNavItems /> : <GuestNavItems />}</Box>
            </Box>
          </Toolbar>
        </AppBar>

        <CustomDrawer variant="permanent" open={open} sx={{}}>
          <Toolbar
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              px: [1],
            }}
          ></Toolbar>
          <List component="nav">
            <MainListItems />
          </List>
          <Divider sx={{ mt: "auto" }} />
          <List component="nav">{bottomListItems}</List>
        </CustomDrawer>

        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === "light"
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: "100vh",
            overflow: "auto",
          }}
        >
          <Toolbar />

          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Routes>
              <Route
                path="/"
                Component={() =>
                  user ? (
                    role == "Admin" ||
                    role == "Staff warehouse" ||
                    role == "Staff Purchasing" ? (
                      <Navigate to="/item" replace />
                    ) : (
                      <Unauthorized />
                    )
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              <Route
                path="/item"
                Component={() =>
                  user ? (
                    role == "Admin" ||
                    role == "Staff warehouse" ||
                    role == "Staff Purchasing" ? (
                      <Items
                        warehouseID={warehouseID}
                        setWarehouseID={setWarehouseID}
                        warehouseList={warehouseList}
                        // setWarehouseList={setWarehouseList}
                      />
                    ) : (
                      <Unauthorized />
                    )
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              <Route
                path="/mutation"
                Component={() =>
                  user ? (
                    role == "Admin" ||
                    role == "Staff warehouse" ||
                    role == "Staff Purchasing" ? (
                      <Mutations
                        warehouse={warehouseID}
                        setWarehouse={setWarehouseID}
                        warehouseList={warehouseList}
                        setWarehouseList={setWarehouseList}
                      />
                    ) : (
                      <Unauthorized />
                    )
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              <Route
                path="/warehouse"
                Component={() =>
                  user ? (
                    role == "Admin" ? (
                      <Warehouse 
                      setWarehouseID={setWarehouseID}
                      />
                    ) : (
                      <Unauthorized />
                    )
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              {/* <Route
                path="/pengguna"
                Component={() =>
                  user ? (
                    role == "Admin" ? (
                      <Users warehouseList={warehouseList} />
                    ) : (
                      <Unauthorized />
                    )
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              /> */}

              <Route
                path="/login"
                Component={() =>
                  !user ? <Login verifying={verifying} /> : <Navigate to="/" replace />
                }
              />

              <Route path="/about" Component={About} />

              <Route path="*" Component={NotFound} />
            </Routes>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

const Menu: React.FC = () => (
  <Router>
    <Dashboard />
  </Router>
);

export default Menu;

