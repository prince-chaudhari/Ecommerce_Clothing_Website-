import React, { useEffect, useState } from 'react';
import styled from "styled-components";
import { FormGridWrapper, FormTitle } from "../../styles/form_grid";
import { Container } from "../../styles/styles";
import { staticImages } from "../../utils/images";
import AuthOptions from "../../components/auth/AuthOptions";
import { FormElement, Input } from "../../styles/form";
import PasswordInput from "../../components/auth/PasswordInput";
import { BaseButtonBlack } from "../../styles/button";
import { breakpoints, defaultTheme } from "../../styles/themes/default";
import { Link, useNavigate } from 'react-router-dom';
import { setUserToken } from '../../features/authSlice';
import { getToken, storeToken } from '../../services/LocalStorageService';
import { useLoginUserMutation } from '../../services/userAuthApi';
import { useDispatch } from 'react-redux';
import { Alert, Typography, CircularProgress } from "@mui/material"; // Imported CircularProgress

const SignInScreenWrapper = styled.section`
  .form-separator {
    margin: 32px 0;
    column-gap: 18px;

    @media (max-width: ${breakpoints.lg}) {
      margin: 24px 0;
    }

    .separator-text {
      border-radius: 50%;
      min-width: 36px;
      height: 36px;
      background-color: ${defaultTheme.color_purple};
      position: relative;
    }

    .separator-line {
      width: 100%;
      height: 1px;
      background-color: ${defaultTheme.color_platinum};
    }
  }

  .form-elem-text {
    margin-top: -16px;
    display: block;
  }
`;

const SignInScreen = () => {
  const [server_error, setServerError] = useState({});
  const [alertVisible, setAlertVisible] = useState(false); // State for alert visibility
  const navigate = useNavigate();
  const [loginUser, { isLoading }] = useLoginUserMutation(); // Destructured isLoading
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const actualData = {
      email: data.get('email'),
      password: data.get('password'),
    };

    const res = await loginUser(actualData);
    if (res.error) {
      setServerError(res.error.data.errors);
      setAlertVisible(true); // Show the alert
    }
    if (res.data) {
      storeToken(res.data.token);
      let { access_token } = getToken();
      dispatch(setUserToken({ access_token: access_token }));
      navigate('/');
    }
  };

  let { access_token } = getToken();
  useEffect(() => {
    dispatch(setUserToken({ access_token: access_token }));
  }, [access_token, dispatch]);

  // Hide the alert after 3 seconds
  useEffect(() => {
    if (alertVisible) {
      const timer = setTimeout(() => {
        setAlertVisible(false); // Hide the alert
      }, 3000); // Alert disappears after 3 seconds

      return () => clearTimeout(timer); // Cleanup timeout on unmount
    }
  }, [alertVisible]);

  return (
    <SignInScreenWrapper>
      <FormGridWrapper>
        <Container>
          <div className="form-grid-content">
            <div className="form-grid-left">
              <img src={staticImages.form_img1} className="object-fit-cover" />
            </div>
            <div className="form-grid-right">
              <FormTitle>
                <h3>Sign In</h3>
              </FormTitle>
              <AuthOptions />
              <div className="form-separator flex items-center justify-center">
                <span className="separator-line"></span>
                <span className="separator-text inline-flex items-center justify-center text-white">
                  OR
                </span>
                <span className="separator-line"></span>
              </div>

              <form onSubmit={handleSubmit}>
                <FormElement>
                  <label htmlFor="inp_data" className="form-elem-label">
                    Email
                  </label>
                  <Input
                    type="text"
                    placeholder=""
                    name="email"
                    className="form-elem-control"
                  />
                  {server_error.email ? <Typography style={{ fontSize: 12, color: 'red', paddingLeft: 10 }}>{server_error.email[0]}</Typography> : ""}
                </FormElement>
                <PasswordInput fieldName="Password" name="password" />
                {server_error.password ? (
                  <p style={{ "marginTop": "-15px", "marginBottom": "20px" }}>
                    <Typography style={{ fontSize: 12, color: "red", paddingLeft: 10 }}>
                      {server_error.password[0]}
                    </Typography>
                  </p>
                ) : ""}
                <Link to="/reset" className="form-elem-text text-end font-medium">
                  Forgot your password?
                </Link>
                <BaseButtonBlack
                  type="submit"
                  className="form-submit-btn"
                  disabled={isLoading} // Disable button when loading
                >
                  {isLoading ? ( // Show loader if loading
                    <CircularProgress size={24} style={{ color: "white" }} />
                  ) : (
                    "Sign In"
                  )}
                </BaseButtonBlack>
                {/* Show alert if alertVisible is true */}
                {alertVisible && server_error.non_field_errors ? (
                  <Alert severity='error' style={{ "marginTop": "20px" }} onClose={() => setAlertVisible(false)}>
                    {server_error.non_field_errors[0]}
                  </Alert>
                ) : ''}
              </form>

              <p className="flex flex-wrap account-rel-text">
                Don&apos;t have an account?
                <Link to="/sign_up" className="font-medium">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </Container>
      </FormGridWrapper>
    </SignInScreenWrapper>
  );
};

export default SignInScreen;
