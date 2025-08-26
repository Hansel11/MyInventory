import { Help, Inventory, Logout, 
  // People,
   Person, WarehouseSharp } from '@mui/icons-material';
import BarChartIcon from '@mui/icons-material/BarChart';
import LoginIcon from "@mui/icons-material/Login";
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Link } from 'react-router-dom';
import { useEffect, useState } from "react";

import {
  useLocation,
} from "react-router-dom";
import { Box, Button, Menu, MenuItem, useTheme } from '@mui/material';
import { LogoutPopup } from './components/auth/Logout';

import { auth } from "./components/utils/FirebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";

interface ItemProps {
  text: string;
  logo?: React.ReactNode;
}


const CustomItem:React.FC<ItemProps> = (props) => {
  const location = useLocation();

  // const [currentPage, setCurrentPage] = useState(location.pathname);
  const [inCurrentPage, setInCurrentPage] = useState(false);

  useEffect(() => {
    // setCurrentPage(location.pathname.substring(1));
    setInCurrentPage(location.pathname.substring(1) === props.text.toLowerCase());
  }, [location]);

  return (
    <ListItemButton
      sx={{
        borderRadius: 4,
        marginRight: 1,
        marginLeft: 1,
        marginBottom: 1,
        backgroundColor: inCurrentPage ? "primary.light" : "",
        color: inCurrentPage ? "background.default" : "",
        "&:hover": {
          backgroundColor: inCurrentPage ? "primary.main" : "",
        },
      }}
    >
      <ListItemIcon
        sx={{ color: inCurrentPage ? "background.default" : "none" }}
      >
        {props.logo}
      </ListItemIcon>
      <ListItemText
        primary={props.text}
      />
    </ListItemButton>
  );
}


export default function MainListItems() {
  // TEMP VVVVVVV
  const [user] = useAuthState(auth);

  return (
    <Box>
      {!user ? (
        <Link to="/login" style={{ textDecoration: "none", color: "inherit" }}>
          <CustomItem logo={<Person />} text="ログイン" />
        </Link>
      ) : null}

      {user ? (
        <Link to="/item" style={{ textDecoration: "none", color: "inherit" }}>
          <CustomItem logo={<Inventory />} text="商品" />
        </Link>
      ) : null}

      {user ? (
        <Link to="/mutation" style={{ textDecoration: "none", color: "inherit" }}>
          <CustomItem logo={<BarChartIcon />} text="履歴" />
        </Link>
      ) : null}

      {user ? (
        <Link to="/warehouse" style={{ textDecoration: "none", color: "inherit" }}>
          <CustomItem logo={<WarehouseSharp />} text="在庫" />
        </Link>
      ) : null}
      
      {/* 
      {role == "Admin" ? (
        <Link
          to="/user"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <CustomItem logo={<People />} text="User" />
        </Link>
      ) : null} */}
    </Box>
  );
};

export const bottomListItems = (
  <>
    <Link to="/about" style={{ textDecoration: "none", color: "inherit" }}>
      <CustomItem logo={<Help />} text="概要" />
    </Link>
  </>
);

export function AuthNavItems() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [popup, setPopup] = useState(false);
  const [ user ] = useAuthState(auth);
  const theme = useTheme();

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const openPopup = () => {
    setPopup(true);
  };

  const closePopup = () => {
    setPopup(false);
  };

    

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error: any) {
      alert(error.message);
      console.log(error);
    }
  };



  return (
    <>
      <LogoutPopup
        open={popup}
        handleClose={closePopup}
        handleLogout={handleLogout}
      />

      <Button
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick}
        sx={{
          marginTop: 0,
          // marginBottom:2,
          borderRadius: 4,
          textTransform: "none",
          textDecoration: "none",
          color: "white",
        }}
      >
        <ListItemText primary={user ? user.email : "User"}/>
      </Button>

      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {/* <MenuItem component={Link} to="/profile" onClick={handleClose}>
          <Box
            sx={{
              display: "flex",
              width: "100%",
            }}
          >
            <Person sx={{ mr:1 }} />
            Profile
          </Box>
        </MenuItem> */}
        <MenuItem
          onClick={openPopup}
          sx={{ color: theme.palette.error.main }}
        >
          <Box
            sx={{
              display: "flex",
              width: "100%",
            }}
          >
            <Logout sx={{ mr:1, color: theme.palette.error.main }} />
            ログアウト
          </Box>
        </MenuItem>
      </Menu>
    </>
  );

};

  
export function GuestNavItems() {
  return(
  <Link to="/login" style={{ textDecoration: "none", color: "inherit" }}>
    <ListItemButton sx={{ borderRadius: 6 }}>
      <ListItemText primary="ログイン" style={{ marginRight: 16 }} />
      <LoginIcon />
    </ListItemButton>
  </Link>
  );
}