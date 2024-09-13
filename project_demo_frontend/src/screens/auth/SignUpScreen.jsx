import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  CheckboxGroup,
  FormGridWrapper,
  FormTitle,
} from "../../styles/form_grid";
import { Container } from "../../styles/styles";
import { staticImages } from "../../utils/images";
import AuthOptions from "../../components/auth/AuthOptions";
import { FormElement, Input } from "../../styles/form";
import PasswordInput from "../../components/auth/PasswordInput";
import { BaseButtonBlack } from "../../styles/button";
import { Link, useNavigate } from "react-router-dom";
import { useRegisterUserMutation } from "../../services/userAuthApi";
import { storeToken, getToken } from "../../services/LocalStorageService";
import { Alert, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch } from "react-redux";
import { setUserToken } from "../../features/authSlice";

const SignUpScreenWrapper = styled.section`
  form {
    margin-top: 40px;
    .form-elem-text {
      margin-top: -16px;
      display: block;
    }
  }

  .text-space {
    margin: 0 4px;
  }
`;

const SignUpScreen = () => {
  const [server_error, setServerError] = useState({});
  const [showAlert, setShowAlert] = useState(false); // State for alert visibility
  const navigate = useNavigate();
  const [registerUser, { isLoading }] = useRegisterUserMutation();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const actualData = {
      username: data.get("username"),
      email: data.get("email"),
      password: data.get("password"),
      password2: data.get("password2"),
    };
    const res = await registerUser(actualData);
    if (res.error) {
      setServerError(res.error.data.errors);
      setShowAlert(true); // Show alert when there's an error
    }
    if (res.data) {
      storeToken(res.data.token);
      let { access_token } = getToken();
      dispatch(setUserToken({ access_token: access_token }));
      navigate("/");
    }
  };

  let { access_token } = getToken();
  useEffect(() => {
    dispatch(setUserToken({ access_token: access_token }));
  }, [access_token, dispatch]);

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false); // Hide the alert after 4 seconds
      }, 3000);
      return () => clearTimeout(timer); // Cleanup timer on component unmount
    }
  }, [showAlert]);

  const handleClose = () => {
    setShowAlert(false); // Manually close the alert
  };

  return (
    <SignUpScreenWrapper>
      <FormGridWrapper>
        <Container>
          <div className="form-grid-content">
            <div className="form-grid-left">
              <img
                src={staticImages.form_img2}
                className="object-fit-cover"
                alt=""
              />
            </div>
            <div className="form-grid-right">
              <FormTitle>
                <h3>Sign Up</h3>
                <p className="text-base">
                  Sign up for free to access to in any of our products
                </p>
              </FormTitle>
              <AuthOptions />
              {/* Add onSubmit attribute here */}
              <form onSubmit={handleSubmit}>
                <FormElement>
                  <label htmlFor="username" className="form-elem-label">
                    User name
                  </label>
                  <Input
                    type="text"
                    placeholder=""
                    name="username"
                    className="form-elem-control"
                  />
                  {server_error.username ? (
                    <Typography
                      style={{ fontSize: 12, color: "red", paddingLeft: 10 }}
                    >
                      {server_error.username[0]}
                    </Typography>
                  ) : (
                    ""
                  )}
                </FormElement>
                <FormElement>
                  <label htmlFor="email" className="form-elem-label">
                    Email address
                  </label>
                  <Input
                    type="email"
                    placeholder=""
                    name="email"
                    className="form-elem-control"
                  />
                  {server_error.email ? (
                    <Typography
                      style={{ fontSize: 12, color: "red", paddingLeft: 10 }}
                    >
                      {server_error.email[0]}
                    </Typography>
                  ) : (
                    ""
                  )}
                </FormElement>
                <PasswordInput fieldName="Password" name="password" />
                {server_error.password ? (
                  <p style={{ marginTop: "-15px", marginBottom: "20px" }}>
                    <Typography
                      style={{ fontSize: 12, color: "red", paddingLeft: 10 }}
                    >
                      {server_error.password[0]}
                    </Typography>
                  </p>
                ) : (
                  ""
                )}
                <PasswordInput fieldName="Confirm Password" name="password2" />
                {server_error.password2 ? (
                  <p style={{ marginTop: "-15px", marginBottom: "22px" }}>
                    <Typography
                      style={{ fontSize: 12, color: "red", paddingLeft: 10 }}
                    >
                      {server_error.password2[0]}
                    </Typography>
                  </p>
                ) : (
                  ""
                )}

                <CheckboxGroup>
                  <li className="flex items-center">
                    <input type="checkbox" />
                    <span className="text-sm">
                      Agree to our
                      <Link to="/" className="text-underline">
                        Terms of use
                      </Link>
                      <span className="text-space">and</span>
                      <Link to="/" className="text-underline">
                        Privacy Policy
                      </Link>
                    </span>
                  </li>
                  <li className="flex items-center">
                    <input type="checkbox" />
                    <span className="text-sm">
                      Subscribe to our monthly newsletter
                    </span>
                  </li>
                </CheckboxGroup>
                <BaseButtonBlack type="submit" className="form-submit-btn">
                  Sign Up
                </BaseButtonBlack>
                {server_error.non_field_errors && showAlert ? (
                  <Alert
                    style={{ "marginTop": "20px" }}
                    severity="error"
                    action={
                      <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={handleClose}
                      >
                        <CloseIcon fontSize="inherit" />
                      </IconButton>
                    }
                  >
                    {server_error.non_field_errors[0]}
                  </Alert>
                ) : (
                  ""
                )}
              </form>
              <p className="flex flex-wrap account-rel-text">
                Already have an account?
                <Link to="/sign_in" className="font-medium">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </Container>
      </FormGridWrapper>
    </SignUpScreenWrapper>
  );
};

export default SignUpScreen;
