import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';

const CustomSnackbar = styled(Snackbar)(({ theme }) => ({
  '& .MuiSnackbarContent-root': {
    marginBottom: '20px', // Add bottom margin for spacing
    marginRight: '20px',  // Add right margin for spacing
  },
}));

function CustomAlert({ open, handleClose, message, severity }) {
  return (
    <CustomSnackbar
      open={open}
      autoHideDuration={4000} // 4 seconds
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} // Position at bottom-right corner
    >
      <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </CustomSnackbar>
  );
}

export default CustomAlert;
