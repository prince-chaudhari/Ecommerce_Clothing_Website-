import React, { useEffect, useState } from 'react';
import styled from "styled-components";
import { Container } from "../../styles/styles";
import Breadcrumb from "../../components/common/Breadcrumb";
import { UserContent, UserDashboardWrapper } from "../../styles/user";
import UserMenu from "../../components/user/UserMenu";
import Title from "../../components/common/Title";
import { FormElement, Input, Textarea } from "../../styles/form";
import { BaseButtonGreen, BaseButtonWhitesmoke } from "../../styles/button";
import { defaultTheme } from "../../styles/themes/default";
import { useAddUserAddressMutation, useUpdateUserAddressMutation } from '../../services/userAddressApi';
import { addUserAddress, updateUserAddress } from '../../features/addressSlice';
import { useDispatch, useSelector } from 'react-redux';
import { getToken } from '../../services/LocalStorageService';
import CustomAlert from '../product/WarningAlert';
import { useParams } from 'react-router-dom';

const AddressScreenWrapper = styled.main`
  .form-elem-control {
    padding-left: 16px;
    border: 1px solid ${defaultTheme.color_platinum};

    &:focus {
      border-color: ${defaultTheme.color_silver};
    }
  }
  
  .form-elem-control.error {
    border-color: red;
  }
  
  .error-message {
    color: red;
    font-size: 0.875rem;
  }
`;

const breadcrumbItems = [
  { label: "Home", link: "/" },
  { label: "Account", link: "/account" },
  { label: "Add Address", link: "/account/add" },
];


const AddressScreen = () => {
  const [userAddress, { isLoading }] = useAddUserAddressMutation();
  const [userUpdateAddress, { isLoading: isLoadingUserUpdateAddress }] = useUpdateUserAddressMutation();
  const { addressId } = useParams();
  const state = useSelector(state => state.address);
  const addresses = state.address; // Assuming `state.address` contains the `address` array

  // Find the specific address by addressId
  const address = addressId ? addresses.find(addr => addr.address.address_id === addressId) : null;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    country: '',
    companyName: '',
    streetAddress: '',
    aptSuiteUnit: '',
    city: '',
    state: '',
    phone: '',
    postalCode: '',
    deliveryInstruction: '',
    defaultShipping: false,
    defaultBilling: false,
  });

  // Update formData only when address changes
  useEffect(() => {
    console.log("address", address);
    
    if (address) {
      setFormData({
        firstName: address.address.first_name || '',
        lastName: address.address.last_name || '',
        country: address.address.country || '',
        companyName: address.address.company_name || '',
        streetAddress: address.address.street_address || '',
        aptSuiteUnit: address.address.apartment || '',
        city: address.address.city || '',
        state: address.address.state || '',
        phone: address.address.phone || '',
        postalCode: address.address.postal_code || '',
        deliveryInstruction: address.address.delivery_instruction || '',
        defaultShipping: address.address.default_shipping || false,
        defaultBilling: address.address.default_billing || false,
      });
    }
  }, [address]); // Only run when `address` changes

  const [errors, setErrors] = useState({});
  const [server_error, setServerError] = useState({});
  const [server_msg, setServerMsg] = useState({});
  const [successAlertOpen, setSuccessAlertOpen] = useState(false);
  const [successUpdateAlertOpen, setSuccessUpdateAlertOpen] = useState(false);
  const dispatch = useDispatch();
  const { access_token } = getToken();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (!formData[key] && key !== 'companyName' && key !== 'aptSuiteUnit' && key !== 'deliveryInstruction') {
        newErrors[key] = `${key.replace(/([A-Z])/g, ' $1')} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      console.log(errors);
      return
    } else {
      setErrors({});

      const data = new FormData(e.currentTarget);

      data.append('first_name', formData.firstName);
      data.append('last_name', formData.lastName);
      data.append('country', formData.country);
      data.append('company_name', formData.companyName);
      data.append('street_address', formData.streetAddress);
      data.append('apartment', formData.aptSuiteUnit);
      data.append('city', formData.city);
      data.append('state', formData.state);
      data.append('phone', formData.phone);
      data.append('postal_code', formData.postalCode);
      data.append('delivery_instruction', formData.deliveryInstruction);
      data.append('default_shipping', formData.defaultShipping);
      data.append('default_billing', formData.defaultBilling);

      const res = await userAddress({ actualData: data, access_token });

      if (res.error) {
        setServerMsg({});
        setServerError(res.error.data.errors);
        console.log(res.error.data.errors);
        
      }

      if (res.data) {
        setServerError({});
        setServerMsg(res.data);

        // Dispatch the action to update the Redux state
        // Wrap the res.data inside an 'address' object
        const addAddressData = {
          address: {
            ...res.data
          }
        };

        // Dispatch the action to update the Redux state with the transformed data
        dispatch(addUserAddress(addAddressData));
        setSuccessAlertOpen(true);
        setFormData({
          firstName: '',
          lastName: '',
          country: '',
          companyName: '',
          streetAddress: '',
          aptSuiteUnit: '',
          city: '',
          state: '',
          phone: '',
          postalCode: '',
          deliveryInstruction: '',
          defaultShipping: false,
          defaultBilling: false,
        });
      }
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (!formData[key] && key !== 'companyName' && key !== 'aptSuiteUnit' && key !== 'deliveryInstruction') {
        newErrors[key] = `${key.replace(/([A-Z])/g, ' $1')} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return
    } else {
      setErrors({});

      const data = new FormData(e.currentTarget);

      data.append('first_name', formData.firstName);
      data.append('last_name', formData.lastName);
      data.append('country', formData.country);
      data.append('company_name', formData.companyName);
      data.append('street_address', formData.streetAddress);
      data.append('apartment', formData.aptSuiteUnit);
      data.append('city', formData.city);
      data.append('state', formData.state);
      data.append('phone', formData.phone);
      data.append('postal_code', formData.postalCode);
      data.append('delivery_instruction', formData.deliveryInstruction);
      data.append('default_shipping', formData.defaultShipping);
      data.append('default_billing', formData.defaultBilling);

      const res = await userUpdateAddress({ address_id: addressId, actualData: data, access_token });

      if (res.error) {
        setServerMsg({});
        setServerError(res.error.data.errors);
      }

      if (res.data) {
        setServerError({});
        setServerMsg(res.data);
        console.log("res.data", res.data);

        // Wrap the res.data inside an 'address' object
        const updatedAddressData = {
          address: {
            ...res.data
          }
        };

        // Dispatch the action to update the Redux state with the transformed data
        dispatch(updateUserAddress(updatedAddressData));
        setSuccessUpdateAlertOpen(true);
      }
    }
  };

  const handleClose = () => {
    setSuccessAlertOpen(false);
    setSuccessUpdateAlertOpen(false);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      country: '',
      companyName: '',
      streetAddress: '',
      aptSuiteUnit: '',
      city: '',
      state: '',
      phone: '',
      postalCode: '',
      deliveryInstruction: '',
      defaultShipping: false,
      defaultBilling: false,
    });
    setErrors({});
  };

  return (
    <AddressScreenWrapper className="page-py-spacing">
      <Container>
        <Breadcrumb items={breadcrumbItems} />
        <UserDashboardWrapper>
          <UserMenu />
          <UserContent>
            <Title titleText={"My Account"} />
            <h4 className="title-sm">Add Address</h4>
            <form onSubmit={addressId ? handleUpdateSubmit : handleSubmit}>
              <div className="form-wrapper">
                <FormElement>
                  <label
                    htmlFor="firstName"
                    className="form-label font-semibold text-base"
                  >
                    First Name*
                  </label>
                  <Input
                    type="text"
                    name="firstName"
                    className={`form-elem-control ${errors.firstName ? 'error' : ''}`}
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                  {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                </FormElement>
                <FormElement>
                  <label
                    htmlFor="lastName"
                    className="form-label font-semibold text-base"
                  >
                    Last Name*
                  </label>
                  <Input
                    type="text"
                    name="lastName"
                    className={`form-elem-control ${errors.lastName ? 'error' : ''}`}
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                  {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                </FormElement>
                <FormElement>
                  <label
                    htmlFor="country"
                    className="form-label font-semibold text-base"
                  >
                    Country / Region
                  </label>
                  <Input
                    type="text"
                    name="country"
                    className={`form-elem-control ${errors.country ? 'error' : ''}`}
                    placeholder="Country/Region"
                    value={formData.country}
                    onChange={handleChange}
                  />
                  {errors.country && <span className="error-message">{errors.country}</span>}
                </FormElement>
                <FormElement>
                  <label
                    htmlFor="companyName"
                    className="form-label font-semibold text-base"
                  >
                    Company Name
                  </label>
                  <Input
                    type="text"
                    name="companyName"
                    className="form-elem-control"
                    placeholder="Company (optional)"
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                </FormElement>
                <FormElement>
                  <label
                    htmlFor="streetAddress"
                    className="form-label font-semibold text-base"
                  >
                    Street Address*
                  </label>
                  <Input
                    type="text"
                    name="streetAddress"
                    className={`form-elem-control ${errors.streetAddress ? 'error' : ''}`}
                    placeholder="House number and street name"
                    value={formData.streetAddress}
                    onChange={handleChange}
                  />
                  {errors.streetAddress && <span className="error-message">{errors.streetAddress}</span>}
                </FormElement>
                <FormElement>
                  <label
                    htmlFor="aptSuiteUnit"
                    className="form-label font-semibold text-base"
                  >
                    Apt, suite, unit
                  </label>
                  <Input
                    type="text"
                    name="aptSuiteUnit"
                    className="form-elem-control"
                    placeholder="Apartment, suite, unit, etc. (optional)"
                    value={formData.aptSuiteUnit}
                    onChange={handleChange}
                  />
                </FormElement>
                <FormElement>
                  <label
                    htmlFor="city"
                    className="form-label font-semibold text-base"
                  >
                    City*
                  </label>
                  <Input
                    type="text"
                    name="city"
                    className={`form-elem-control ${errors.city ? 'error' : ''}`}
                    placeholder="Town / City"
                    value={formData.city}
                    onChange={handleChange}
                  />
                  {errors.city && <span className="error-message">{errors.city}</span>}
                </FormElement>
                <FormElement>
                  <label
                    htmlFor="state"
                    className="form-label font-semibold text-base"
                  >
                    State*
                  </label>
                  <select
                    className={`form-elem-control ${errors.state ? 'error' : ''}`}
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                  >
                    <option value="">Select State</option>
                    <option value="state1">State 1</option>
                    <option value="state2">State 2</option>
                  </select>
                  {errors.state && <span className="error-message">{errors.state}</span>}
                </FormElement>
                <FormElement>
                  <label
                    htmlFor="phone"
                    className="form-label font-semibold text-base"
                  >
                    Phone*
                  </label>
                  <Input
                    type="text"
                    name="phone"
                    className={`form-elem-control ${errors.phone ? 'error' : ''}`}
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </FormElement>
                <FormElement>
                  <label
                    htmlFor="postalCode"
                    className="form-label font-semibold text-base"
                  >
                    Postal Code*
                  </label>
                  <Input
                    type="text"
                    name="postalCode"
                    className={`form-elem-control ${errors.postalCode ? 'error' : ''}`}
                    placeholder="Postal Code"
                    value={formData.postalCode}
                    onChange={handleChange}
                  />
                  {errors.postalCode && <span className="error-message">{errors.postalCode}</span>}
                </FormElement>
                <FormElement>
                  <label
                    htmlFor="deliveryInstruction"
                    className="form-label font-semibold text-base"
                  >
                    Delivery Instruction
                  </label>
                  <Textarea
                    className="form-elem-control"
                    placeholder="Delivery Instruction"
                    name="deliveryInstruction"
                    value={formData.deliveryInstruction}
                    onChange={handleChange}
                  ></Textarea>
                </FormElement>
              </div>
              <FormElement className="form-check-elem flex items-center">
                <div className="form-elem-checkbox">
                  <input
                    type="checkbox"
                    name="defaultShipping"
                    checked={formData.defaultShipping}
                    onChange={handleChange}
                  />
                  <span className="checkmark flex items-center justify-center">
                    <i className="bi bi-check-lg"></i>
                  </span>
                </div>
                <span>Set as default shipping address</span>
              </FormElement>
              <FormElement className="form-check-elem flex items-center">
                <div className="form-elem-checkbox">
                  <input
                    type="checkbox"
                    name="defaultBilling"
                    checked={formData.defaultBilling}
                    onChange={handleChange}
                  />
                  <span className="checkmark flex items-center justify-center">
                    <i className="bi bi-check-lg"></i>
                  </span>
                </div>
                <span>Set as default billing address</span>
              </FormElement>
              <div className="form-btns flex">
                {addressId ?
                  <BaseButtonGreen type="submit">Update</BaseButtonGreen>
                  :
                  <BaseButtonGreen type="submit">Save</BaseButtonGreen>
                }
                <BaseButtonWhitesmoke type="reset" onClick={resetForm}>Reset</BaseButtonWhitesmoke>
              </div>
            </form>
          </UserContent>
        </UserDashboardWrapper>
      </Container>
      <CustomAlert
        open={successAlertOpen}
        handleClose={handleClose}
        message="Address added successfully!"
        severity="success"
      />
      <CustomAlert
        open={successUpdateAlertOpen}
        handleClose={handleClose}
        message="Address updated successfully!"
        severity="success"
      />
    </AddressScreenWrapper>
  );
};

export default AddressScreen;
