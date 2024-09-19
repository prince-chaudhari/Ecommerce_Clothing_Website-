import styled from "styled-components";
import { Container } from "../../styles/styles";
import Breadcrumb from "../../components/common/Breadcrumb";
import { UserContent, UserDashboardWrapper } from "../../styles/user";
import UserMenu from "../../components/user/UserMenu";
import Title from "../../components/common/Title";
import { FormElement, Input } from "../../styles/form";
import { BaseLinkGreen } from "../../styles/button";
import { breakpoints, defaultTheme } from "../../styles/themes/default";
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { useChangeUserProfileMutation } from "../../services/userAuthApi";
import { getToken } from "../../services/LocalStorageService";
import { setUserInfo } from "../../features/userSlice";
import CustomAlert from "../product/WarningAlert";
import ChangePasswordScreen from "./ChangePasswordScreen";
import { Link } from "react-router-dom";
import { useDeleteUserAddressMutation } from "../../services/userAddressApi";
import { every } from "lodash";
import { removeUserAddress } from "../../features/addressSlice";

// Custom style for Save Changes button
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

const AccountScreenWrapper = styled.main`
  .address-list {
    margin-top: 20px;
    grid-template-columns: repeat(2, 1fr);
    gap: 25px;

    @media (max-width: ${breakpoints.lg}) {
      grid-template-columns: repeat(1, 1fr);
    }
  }

  .address-item {
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    padding: 25px;
    row-gap: 8px;
  }

  .address-tags {
    gap: 12px;

    li {
      height: 28px;
      border-radius: 8px;
      padding: 2px 12px;
      background-color: ${defaultTheme.color_whitesmoke};
    }
  }

  .address-btns {
    margin-top: 12px;
    .btn-separator {
      width: 1px;
      border-radius: 50px;
      background: ${defaultTheme.color_platinum};
      margin: 0 10px;
    }
  }

  /* Position the form relative to allow absolute positioning for Save Changes button */
  form {
    position: relative;
  }
`;

const breadcrumbItems = [
  {
    label: "Home",
    link: "/",
  },
  { label: "Account", link: "/account" },
];

const AccountScreen = () => {
  const dispatch = useDispatch();
  const { access_token } = getToken();
  const { username, email, gender, date_of_birth } = useSelector((state) => state.user);
  const [userProfile, { isLoading }] = useChangeUserProfileMutation();
  const [userDeleteAddress, { isLoading: isLoadingUserDeleteAddress }] = useDeleteUserAddressMutation();
  const [server_error, setServerError] = useState({});
  const [server_msg, setServerMsg] = useState({});
  const [successAlertOpen, setSuccessAlertOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const { address: addressData } = useSelector(state => state.address);
  console.log("addressData", addressData);


  const handleShowChangePassword = () => {
    setShowChangePassword(true);
  };

  const handleBackToAccount = () => {
    setShowChangePassword(false);
  };

  // Create local state for form fields
  const [formValues, setFormValues] = useState({
    username,
    email,
    gender,
    date_of_birth,
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);

    if (formValues.username === username && formValues.gender === gender && formValues.date_of_birth === date_of_birth) {
      console.log("No changes detected");
      return;
    }

    data.append('username', formValues.username);
    data.append('gender', formValues.gender);
    data.append('date_of_birth', formValues.date_of_birth);

    const res = await userProfile({ actualData: data, access_token });

    if (res.error) {
      setServerMsg({});
      setServerError(res.error.data.errors);
      console.log(res.error.data);
    }

    if (res.data) {
      setServerError({});
      setServerMsg(res.data);
      console.log(res.data);

      // Dispatch the action to update the Redux state
      dispatch(setUserInfo(formValues));
      setSuccessAlertOpen(true)
      // Optionally refetch the logged user data
      // refetch();
    }
  };

  const handleClose = () => {
    setSuccessAlertOpen(false);
  };

  const handleDeleteAddress = async (addressId, event) => {
    event.preventDefault();
    const item = addressData.find((item) => item.address.address_id === addressId);
    if (!item) return;

    try {
      await userDeleteAddress({ address_id: addressId, access_token }).unwrap();
      dispatch(removeUserAddress({ addressIdToRemove: addressId }));
    } catch (error) {
      console.error('Failed to remove from wishlist: ', error);
    }
  }

  return (
    <AccountScreenWrapper className="page-py-spacing">
      <Container>
        <Breadcrumb items={breadcrumbItems} />
        <UserDashboardWrapper>
          <UserMenu />
          <UserContent>
            {showChangePassword ? (
              <ChangePasswordScreen />
            ) : (
              <>
                <Title titleText={"My Account"} />
                <h4 className="title-sm">Contact Details</h4>
                <form onSubmit={handleSubmit}>
                  <div className="form-wrapper">
                    <FormElement className="form-elem">
                      <label htmlFor="username" className="form-label font-semibold text-base">
                        Username
                      </label>
                      <div className="form-input-wrapper flex items-center">
                        <Input
                          type="text"
                          name="username"
                          className="form-elem-control text-outerspace font-semibold"
                          value={formValues.username}
                          onChange={handleChange}
                        />
                      </div>
                    </FormElement>

                    <FormElement className="form-elem">
                      <label htmlFor="email" className="form-label font-semibold text-base">
                        Email Address
                      </label>
                      <div className="form-input-wrapper flex items-center">
                        <Input
                          type="email"
                          name="email"
                          className="form-elem-control text-outerspace font-semibold"
                          value={formValues.email}
                          onChange={handleChange}
                          readOnly
                          style={{ cursor: 'not-allowed' }}
                        />
                      </div>
                    </FormElement>

                    <FormElement className="form-elem">
                      <label htmlFor="gender" className="form-label font-semibold text-base">
                        Gender
                      </label>
                      <div className="form-input-wrapper flex items-center">
                        <select
                          name="gender"
                          className="form-elem-control text-outerspace font-semibold"
                          value={formValues.gender}
                          onChange={handleChange}
                        >
                          <option value="">Select Gender</option>
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                          <option value="O">Other</option>
                        </select>
                      </div>
                    </FormElement>

                    <FormElement className="form-elem">
                      <label htmlFor="date_of_birth" className="form-label font-semibold text-base">
                        Date of Birth
                      </label>
                      <div className="form-input-wrapper flex items-center">
                        <Input
                          type="date"
                          name="date_of_birth"
                          className="form-elem-control text-outerspace font-semibold"
                          value={formValues.date_of_birth}
                          onChange={handleChange}
                        />
                      </div>
                    </FormElement>
                  </div>

                  {/* Save Changes button positioned at the bottom right */}
                  <SaveChangesButton type="submit">Save Changes</SaveChangesButton>
                </form>
                <div>
                  <h4 className="title-sm" style={{ marginBottom: '4px' }}>My Contact Addresses</h4>
                  <BaseLinkGreen to="/account/add">Add Address</BaseLinkGreen>
                </div>
                <div>
                  <h4 className="title-sm" style={{ marginBottom: '4px', marginTop: '14px' }}>Change Password</h4>
                  <BaseLinkGreen as="button" onClick={handleShowChangePassword}>
                    Change Password
                  </BaseLinkGreen>
                </div>
              </>
            )}
            {showChangePassword && (
              <BaseLinkGreen as="button" onClick={handleBackToAccount}>
                Back to Account
              </BaseLinkGreen>
            )}
            <div className="address-list grid" >
              {addressData && addressData.length > 0 && addressData.map((address, index) => (
                <div className="address-item grid" key={`${address.address.address_id}-${index}`}>
                  <p className="text-outerspace text-lg font-semibold address-title">
                    First Name: {address.address.first_name} 
                    <br />
                    Last Name: {address.address.last_name}
                  </p>
                  <p className="text-gray text-base font-medium address-description">
                  Full address: {address.address.apartment},{address.address.street_address},{address.address.city}-{address.address.postal_code},{address.address.country}
                  </p>
                  <p className="text-gray text-base font-medium ">
                    Phone Number: {address.address.phone}
                  </p>
                  <div className="address-btns flex">
                    <button
                      onClick={(event) => handleDeleteAddress(address.address.address_id, event)}
                      className="text-base text-outerspace font-semibold"
                    >
                      Remove
                    </button>
                    <div className="btn-separator"></div>
                    <Link
                      to={`address/edit/${address.address.address_id}`}
                      className="text-base text-outerspace font-semibold"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </UserContent>
        </UserDashboardWrapper>
      </Container>
      <CustomAlert
        open={successAlertOpen}
        handleClose={handleClose}
        message="Your profile updated successfully!"
        severity="success"
      />
    </AccountScreenWrapper>
  );
};

export default AccountScreen;
