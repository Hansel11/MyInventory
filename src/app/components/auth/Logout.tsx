import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import React from "react";

interface LogoutPopupProps {
  open: boolean;
  handleClose: () => void;
  handleLogout: () => void;
}

export const LogoutPopup: React.FC<LogoutPopupProps> = ({
  open,
  handleClose,
  handleLogout
}) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      sx={{
        "& .MuiPaper-root": {
          borderRadius: 6,
          padding:2,
          boxShadow:8,
        },
      }}
    >
      <DialogTitle fontWeight={"bold"}>Logout</DialogTitle>
      <DialogContent>
        <DialogContentText>Are you sure you want to log out?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleLogout} color="primary">
          Logout
        </Button>
      </DialogActions>
    </Dialog>
  );
};

