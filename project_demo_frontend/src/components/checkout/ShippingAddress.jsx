import React, { useState } from "react";
import styled from "styled-components";
import { Input } from "../../styles/form";
import { BaseButtonGreen } from "../../styles/button";
import { breakpoints, defaultTheme } from "../../styles/themes/default";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CustomAlert from "../../screens/product/WarningAlert";
import { useClearProductCartMutation } from "../../services/userCartApi";
import { getToken } from "../../services/LocalStorageService";
import { clearCart } from "../../features/cartSlice";
import { useAddProductsToOrderMutation } from "../../services/userOrderApi";
import { useApplyCouponMutation } from "../../services/userProductsApi";

const ShippingAddressWrapper = styled.div`
  .shipping-addr,
  .shipping-method,
  .payment-method {
    margin: 20px 0;

    &-title {
      margin-bottom: 8px;
    }

    .list-group {
      padding: 24px;
      background-color: ${defaultTheme.color_whitesmoke};
      max-width: 818px;
      margin-top: 24px;
      border-radius: 12px;

      @media (max-width: ${breakpoints.sm}) {
        padding: 16px;
        border-radius: 8px;
        margin-top: 16px;
      }
    }

    .list-group-item {
      column-gap: 20px;
    }
    .horiz-line-separator {
      margin: 20px 0;
      @media (max-width: ${breakpoints.sm}) {
        margin: 12px 0;
      }
    }
  }

  .payment-method {
    .list-group-item {
      &-head {
        column-gap: 20px;
      }
    }

    .payment-cards {
      gap: 20px;
      margin: 24px 0 30px 34px;

      @media (max-width: ${breakpoints.lg}) {
        gap: 16px;
      }

      @media (max-width: ${breakpoints.sm}) {
        margin-top: 16px;
        margin-bottom: 16px;
        gap: 10px;
        margin-left: 0;
      }
      .payment-card {
        position: relative;
        width: 80px;
        height: 46px;
        input {
          opacity: 0;
          position: absolute;
          top: 0;
          left: 0;
          width: 80px;
          height: 46px;
          z-index: 10;
          cursor: pointer;

          &:checked {
            & + .card-wrapper {
              .card-selected {
                position: absolute;
                top: -8px;
                right: -5px;
                width: 14px;
                height: 14px;
                display: inline-block;
              }
            }
          }
        }

        .card-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          border-radius: 5px;
          border: 1px solid rgba(0, 0, 0, 0.1);

          .card-selected {
            display: none;
            transition: ${defaultTheme.default_transition};
          }
        }
      }
    }

    .payment-details {
      margin-left: 34px;
      display: grid;
      row-gap: 16px;

      @media (max-width: ${breakpoints.sm}) {
        margin-left: 0;
      }

      .form-elem-group {
        display: grid;
        grid-template-columns: repeat(2, 2fr);
        gap: 24px;
        @media (max-width: ${breakpoints.sm}) {
          grid-template-columns: 100%;
          gap: 0;
        }
      }

      .form-elem {
        height: 40px;
        border: 1px solid ${defaultTheme.color_platinum};
        border-radius: 6px;
        padding: 16px;

        &:focus {
          border-color: ${defaultTheme.color_sea_green};
        }

        @media (max-width: ${breakpoints.sm}) {
          margin-bottom: 10px;
          border-radius: 4px;
        }
      }
    }
  }

  .pay-now-btn {
    @media (max-width: ${breakpoints.sm}) {
      width: 100%;
    }
  }
`;

const AddressScreenWrapper = styled.main`
  .address-list {
    margin-top: 20px;
    display: grid;
    grid-template-columns: repeat(2, 1fr); /* Two columns */
    gap: 20px; /* Gap between items */

    @media (max-width: ${breakpoints.lg}) {
      grid-template-columns: 1fr; /* Stack on smaller screens */
    }
  }

  .address-item {
    border-radius: 12px;
    border: 1px solid ${defaultTheme.color_platinum};
    padding: 20px;
    cursor: pointer;
    background-color: ${defaultTheme.color_whitesmoke};
    transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      background-color: ${defaultTheme.color_light_gray};
    }

    &.selected {
      background-color: ${defaultTheme.color_sea_green}; /* Change background when selected */
      color: white; /* Text color for contrast */
      border-color: ${defaultTheme.color_sea_green}; /* Change border color */
      box-shadow: 0 4px 12px rgba(0, 128, 0, 0.2); /* Add a soft shadow when selected */
    }

    p,
    ul li {
      transition: color 0.3s ease;
    }

    &.selected p,
    &.selected ul li {
      color: white; /* Text color change on selection */
    }
  }

  .address-tags {
    gap: 12px;

    li {
      height: 28px;
      border-radius: 8px;
      padding: 2px 12px;
      background-color: ${defaultTheme.color_light_green};
      color: ${defaultTheme.color_emerald};

      &.selected {
        background-color: ${defaultTheme.color_green_tea};
        color: white;
      }
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

  /* Hide radio buttons */
  input[type="radio"] {
    display: none;
  }
`;

// Add a styled component for the loader
const Loader = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1); /* Light grey */
  border-radius: 50%;
  border-top: 4px solid ${defaultTheme.color_sea_green}; /* Green color */
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ShippingAddress = () => {
  const { address: addressData } = useSelector((state) => state.address);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [noAddressOpen, setNoAddressOpen] = useState(false);
  const [userClearProduct] = useClearProductCartMutation();
  const [userOrderProduct] = useAddProductsToOrderMutation();
  const { access_token } = getToken();
  const userAddress = addressData.filter(item => item.address.address_id === selectedAddress)
  const [userCoupon] = useApplyCouponMutation();
  const appliedCoupons = useSelector((state) => state.cart.appliedCoupons);
  const [loading, setLoading] = useState(false); // New state for loading
  const { cartItems, totalQuantity, totalPrice, discount } = useSelector(state => state.cart)

  // Function to calculate the savings
  const calculateSavings = () => {
    return (totalPrice / (1 - discount / 100)) - totalPrice;
  };

  const savings = calculateSavings();
  
  const dispatch = useDispatch();

  const handleClose = () => {
    setAlertOpen(false);
    setNoAddressOpen(false);
  };

  const handleAddressSelect = (addressId) => {
    setSelectedAddress(addressId);
  };
  const navigate = useNavigate()

  const handleClick = async () => {
    if (addressData.length === 0) {
      setNoAddressOpen(true);
      return;
    }

    if (!selectedAddress) {
      setAlertOpen(true);
      return;
    }

    setLoading(true); // Set loading to true when starting

    try {
      const actualData = {
        product: cartItems.map((item) => ({
          pid: item.product.pid,
          quantity: item.quantity,
          size: item.size,
        })),
        payment_method: 'paypal',
        address: userAddress[0].address,
        total_price: totalPrice,
        savings: savings,
      };

      console.log("actualData", actualData);

      // Apply all coupons
      for (const coupon of appliedCoupons) {
        const couponData = {
          name: coupon.name,
        };

        // Call the apply coupon API
        await userCoupon({
          data: couponData,
          access_token
        }).unwrap();
      }

      // Proceed with order creation
      const response = await userOrderProduct({
        actualData,
        access_token,
      }).unwrap();

      console.log('Order created successfully:', response);

      // Clear the cart and navigate to confirmation
      await userClearProduct({ access_token });
      dispatch(clearCart({}));
      navigate('/confirm');
    } catch (error) {
      console.error('Error applying coupon or creating order:', error);
    } finally {
      setLoading(false); // Set loading to false when done
    }
  };


  return (
    <ShippingAddressWrapper>
      <div className="shipping-method">
        <h3 className="text-xxl shipping-method-title">Shipping Address</h3>
        {addressData.length == 0 ?
          <p className="text-base text-outerspace">
            You don't have any address please save address from above form
          </p>
          :
          <p className="text-base text-outerspace">
            Select the address that matches your card or payment method.
          </p>
        }
        <AddressScreenWrapper>
          <div className="address-list">
            {addressData &&
              addressData.length > 0 &&
              addressData.map((address, index) => (
                <div
                  className={`address-item ${selectedAddress === address.address.address_id ? "selected" : ""}`}
                  key={`${address.address.address_id}-${index}`}
                  onClick={() => handleAddressSelect(address.address.address_id)}
                >
                  {/* Hidden radio button for form handling */}
                  <input
                    type="radio"
                    name="shipping_address"
                    value={address.address.address_id}
                    checked={selectedAddress === address.address.address_id}
                    // onChange={() => setSelectedAddress()}
                    readOnly
                  />
                  <p className="text-outerspace text-lg font-semibold address-title">
                    First Name: {address.address.first_name}
                    <br />
                    Last Name: {address.address.last_name}
                  </p>
                  <p className="text-gray text-base font-medium address-description">
                    Full address: {address.address.apartment}, {address.address.street_address}, {address.address.city} - {address.address.postal_code}, {address.address.country}
                  </p>
                  <p className="text-gray text-base font-medium inline-flex items-center justify-center">
                    Phone Number: {address.address.phone}
                  </p>
                </div>
              ))}
          </div>
        </AddressScreenWrapper>
      </div>

      <BaseButtonGreen type="submit" className="pay-now-btn" onClick={handleClick}>
        {loading ? <Loader /> : "Pay Now"}
      </BaseButtonGreen>
      <CustomAlert
        open={alertOpen}
        handleClose={handleClose}
        message="Please select any address to continue."
        severity="warning"
      />
      <CustomAlert
        open={noAddressOpen}
        handleClose={handleClose}
        message="Please add address to continue."
        severity="warning"
      />
    </ShippingAddressWrapper>
  );
};

export default ShippingAddress;
