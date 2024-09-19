import styled from "styled-components";
import { BaseButtonGreen } from "../../styles/button";
import CheckoutSummary from "./CheckoutSummary";
import { breakpoints, defaultTheme } from "../../styles/themes/default";
import { useState } from "react";
import { getToken } from "../../services/LocalStorageService";
import { useDispatch } from "react-redux";
import { useAddUserAddressMutation } from "../../services/userAddressApi";
import { addUserAddress } from "../../features/addressSlice";
import { FormElement, Input, Textarea } from "../../styles/form";
import CustomAlert from "../../screens/product/WarningAlert";

const BillingOrderWrapper = styled.div`
  gap: 60px;
  grid-template-columns: 2fr 1fr;

  @media (max-width: ${breakpoints.xl}) {
    gap: 40px;
  }
  @media (max-width: ${breakpoints.lg}) {
    gap: 30px;
    grid-template-columns: 100%;
  }
`;

const BillingDetailsWrapper = styled.div`
  @media (max-width: ${breakpoints.lg}) {
    order: 2;
  }

  .checkout-form {
    margin-top: 24px;

    .input-elem {
      margin-bottom: 16px;

      @media (max-width: ${breakpoints.xs}) {
        margin-bottom: 10px;
      }

      label {
        margin-bottom: 8px;
        display: block;
      }

      input,
      select {
        height: 40px;
        border-radius: 4px;
        background: ${defaultTheme.color_whitesmoke};
        padding-left: 12px;
        padding-right: 12px;
        width: 100%;
        border: 1px solid ${defaultTheme.color_platinum};
        font-size: 12px;

        &::placeholder {
          font-size: 12px;
        }
      }
    }

    .elem-col-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      column-gap: 24px;

      @media (max-width: ${breakpoints.lg}) {
        column-gap: 12px;
      }
      @media (max-width: ${breakpoints.sm}) {
        grid-template-columns: 100%;
      }
    }

    .elem-col-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      column-gap: 24px;

      @media (max-width: ${breakpoints.lg}) {
        column-gap: 12px;
      }
      @media (max-width: ${breakpoints.sm}) {
        grid-template-columns: 100%;
      }
    }

    .input-check-group {
      column-gap: 10px;
      margin-top: 16px;
    }
    .contd-delivery-btn {
      margin-top: 20px;

      @media (max-width: ${breakpoints.sm}) {
        width: 100%;
      }
    }
  }
`;

const Billing = () => {
  const [errors, setErrors] = useState({});
  const [server_error, setServerError] = useState({});
  const [server_msg, setServerMsg] = useState({});
  const dispatch = useDispatch();
  const [userAddress, { isLoading }] = useAddUserAddressMutation();
  const { access_token } = getToken();
  const [successAlertOpen, setSuccessAlertOpen] = useState(false);
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
  });

  const handleClose = () => {
    setSuccessAlertOpen(false);
  };

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

      const res = await userAddress({ actualData: data, access_token });

      if (res.error) {
        setServerMsg({});
        setServerError(res.error.data.errors);
        console.log(res.error.data.errors);

      }

      if (res.data) {
        setServerError({});
        setServerMsg(res.data);
        setSuccessAlertOpen(true);
        const addAddressData = {
          address: {
            ...res.data
          }
        };

        // Dispatch the action to update the Redux state with the transformed data
        dispatch(addUserAddress(addAddressData));
      }
    }
  };

  return (
    <BillingOrderWrapper className="billing-and-order grid items-start">
      <BillingDetailsWrapper>
        <h4 className="text-xxl font-bold text-outerspace">Billing Details</h4>
        <form onSubmit={handleSubmit}>
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
              {errors.firstName && <span className="error-message ">{errors.firstName}</span>}
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
          <BaseButtonGreen type="submit">Save</BaseButtonGreen>
        </form>
      </BillingDetailsWrapper>
      <CheckoutSummary />
      <CustomAlert
        open={successAlertOpen}
        handleClose={handleClose}
        message="Address added successfully!"
        severity="success"
      />
    </BillingOrderWrapper>
  );
};

export default Billing;
