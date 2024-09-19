import React, { useState } from 'react';
import styled from 'styled-components';
import { FormElement, Input } from '../../styles/form';
// import { SaveChangesButton } from '../../styles/button'; // Reuse the button styling
import { breakpoints, defaultTheme } from "../../styles/themes/default";
import { Avatar, Box, Button, Grid, Paper, TextField, Typography, MenuItem, Tooltip, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { useChangeUserPasswordMutation } from '../../services/userAuthApi';
import { getToken } from '../../services/LocalStorageService';
import CustomAlert from '../product/WarningAlert';

const SaveChangesButton = styled.button`
  background-color: ${defaultTheme.color_sea_green};
  border-color: ${defaultTheme.color_sea_green};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 14px;
  text-transform: uppercase;
  transition: background-color 0.3s;

  &:hover {
    background-color: ${defaultTheme.color_dark_green};
  }
`;

const ChangePasswordWrapper = styled.div`
  max-width: 500px;
  margin: 0 auto;
`;

const ChangePasswordScreen = () => {

    const [userChangePassword, { isLoading: isLoadingUserChangePassword }] = useChangeUserPasswordMutation();
    const { access_token } = getToken();
    const [server_error, setServerError] = useState({});
    const [server_msg, setServerMsg] = useState("");
    const [successAlertOpen, setSuccessAlertOpen] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
    });

    const handleClose = () => {
        setSuccessAlertOpen(false);
    };



    const handleChangePassword = async (e) => {
        e.preventDefault();

        // Validation logic
        const newErrors = {
            currentPassword: !formData.currentPassword,
            newPassword: !formData.newPassword,
            confirmPassword: !formData.confirmPassword || formData.newPassword !== formData.confirmPassword,
        };

        setErrors(newErrors);

        const actualData = {
            current_password: formData.currentPassword,
            password: formData.newPassword,
            password2: formData.confirmPassword
        }

        const res = await userChangePassword({ actualData, access_token });

        if (res.error) {
            setServerMsg({});
            setServerError(res.error.data.errors);
            console.log(res.error.data);
        }

        if (res.data) {
            setServerError({});
            setServerMsg(res.data);
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            })
            setSuccessAlertOpen(true)
        }

    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    return (
        <ChangePasswordWrapper>
            <h2>Change Password</h2>
            <Box component="form" noValidate autoComplete="off" onSubmit={handleChangePassword}>
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="currentPassword"
                    label="Current Password"
                    type="password"
                    id="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    error={errors.currentPassword}
                    helperText={errors.currentPassword ? 'Current password is required' : ''}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="newPassword"
                    label="New Password"
                    type="password"
                    id="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    error={errors.newPassword}
                    helperText={errors.newPassword ? 'New password is required' : ''}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm New Password"
                    type="password"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    helperText={
                        errors.confirmPassword
                            ? formData.newPassword !== formData.confirmPassword
                                ? 'Passwords do not match'
                                : 'Confirm password is required'
                            : ''
                    }
                />
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, backgroundColor: "#10b9b0", borderColor: "#10b9b0" }}>
                    Change Password
                </Button>


            </Box>
            {Object.keys(server_error).length > 0 && (
                <div>
                    {Object.keys(server_error).map((key) => (
                        server_error[key] == "Current password is incorrect." &&

                        <div key={key}>
                            <p>
                            {server_error[key]}
                                </p> 
                        </div>
                    ))}
                </div>
            )}
            <CustomAlert
                open={successAlertOpen}
                handleClose={handleClose}
                message="Password updated successfully!"
                severity="success"
            />
        </ChangePasswordWrapper>
    );
};

export default ChangePasswordScreen;
