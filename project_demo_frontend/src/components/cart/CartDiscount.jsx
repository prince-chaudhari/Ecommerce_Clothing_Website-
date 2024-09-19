import styled from "styled-components";
import { Input } from "../../styles/form";
import {
  BaseButtonOuterspace,
  BaseLinkOutlinePlatinum,
} from "../../styles/button";
import { breakpoints, defaultTheme } from "../../styles/themes/default";
import { useState } from "react";
import { getToken } from "../../services/LocalStorageService";
import { useCheckCouponMutation } from "../../services/userProductsApi";
import CustomAlert from "../../screens/product/WarningAlert";
import { useDispatch } from "react-redux";
import { setDiscount } from "../../features/cartSlice";

const CartDiscountWrapper = styled.div`
  @media (max-width: ${breakpoints.xl}) {
    max-width: 420px;
  }

  @media (max-width: ${breakpoints.md}) {
    max-width: 100%;
  }

  .coupon-group {
    margin-top: 20px;
    overflow: hidden;
    border-radius: 6px;
    height: 40px;
  }

  .coupon-input {
    border-top-left-radius: 6px;
    border-bottom-left-radius: 6px;
    border: 1px solid ${defaultTheme.color_platinum};
    padding-left: 12px;
    padding-right: 12px;
    border-right: none;
  }
  
  .coupon-btn {
    padding: 2px 16px;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  .contd-shop-btn {
    height: 40px;
    margin-top: 10px;
  }

  .coupon-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
    background-color: ${defaultTheme.color_light_gray};
    padding: 10px;
    border-radius: 6px;
  }

  .remove-btn {
    cursor: pointer;
    color: red;
    background: none;
    border: none;
    font-size: 14px;
  }
`;

const CartDiscount = () => {
  const [userCoupon] = useCheckCouponMutation();
  const [code, setCode] = useState("");
  const { access_token } = getToken();
  const [alertOpen, setAlertOpen] = useState(false);
  const [successAlertOpen, setSuccessAlertOpen] = useState(false);
  const [appliedCoupons, setAppliedCoupons] = useState([]); // Track applied coupons
  const [duplicateCouponAlertOpen, setDuplicateCouponAlertOpen] = useState(false); // Duplicate coupon alert
  const dispatch = useDispatch();

  const calculateDiscount = (coupons) => {
    let totalDiscount = coupons.reduce((acc, coupon) => {
      return acc * (1 - coupon.discount / 100);
    }, 1);

    return (1 - totalDiscount) * 100;
  };

  const handleClick = async (e) => {
    e.preventDefault();
  
    const data = new FormData(e.currentTarget);
    data.append("code", code);
    const res = await userCoupon({ data, access_token });
    
    if (res.error) {
      console.log(res);
      setAlertOpen(true);
    } else {
      const newCoupon = { name: res.data.coupon_name, discount: res.data.discount_percentage };
  
      const isCouponApplied = appliedCoupons.some(coupon => coupon.name === newCoupon.name);
  
      if (isCouponApplied) {
        setDuplicateCouponAlertOpen(true);
      } else {
        setSuccessAlertOpen(true);
        const updatedCoupons = [...appliedCoupons, newCoupon];
        setAppliedCoupons(updatedCoupons);
        setCode("");
        
  
        const totalDiscount = calculateDiscount(updatedCoupons);
  
        // Dispatch both discount and applied coupons
        dispatch(setDiscount({ discountPercentage: totalDiscount, coupons: updatedCoupons }));
      }
    }
  };
  

  const handleRemoveCoupon = (couponName) => {
    // Remove the selected coupon
    const updatedCoupons = appliedCoupons.filter(
      (coupon) => coupon.name !== couponName
    );
    setAppliedCoupons(updatedCoupons);

    if (updatedCoupons.length > 0) {
      // Apply all remaining discounts sequentially
      let totalDiscount = updatedCoupons.reduce((acc, coupon) => {
        return acc * (1 - coupon.discount / 100);
      }, 1);

      const finalDiscount = (1 - totalDiscount) * 100;
      dispatch(setDiscount(finalDiscount)); // Set the calculated discount
    } else {
      // No coupons left, reset discount to 0
      dispatch(setDiscount(0));
    }
  };

  const handleClose = () => {
    setAlertOpen(false);
    setSuccessAlertOpen(false);
    setDuplicateCouponAlertOpen(false); // Close duplicate coupon alert
  };

  return (
    <CartDiscountWrapper>
      <h3 className="text-xxl text-outerspace">Discount Codes</h3>
      <p className="text-base text-gray">
        Enter your coupon code if you have one.
      </p>
      <form action="" onSubmit={(e) => handleClick(e)}>
        <div className="coupon-group flex">
          <Input
            type="text"
            className="coupon-input w-full"
            placeholder="Search"
            value={code}
            required
            onChange={(e) => setCode(e.target.value)}
            name="code"
          />
          <BaseButtonOuterspace
            type="submit"
            className="coupon-btn no-wrap h-full"
          >
            Apply Coupon
          </BaseButtonOuterspace>
        </div>
      </form>

      {appliedCoupons.length > 0 && (
        <div className="applied-coupons">
          <h4>Applied Coupons</h4>
          {appliedCoupons.map((coupon) => (
            <div className="coupon-item" key={coupon.name}>
              <span>
                {coupon.name} - {coupon.discount}% off
              </span>
              <button
                className="remove-btn"
                onClick={() => handleRemoveCoupon(coupon.name)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <BaseLinkOutlinePlatinum
        as={BaseLinkOutlinePlatinum}
        to="/"
        className="contd-shop-btn w-full text-gray"
      >
        Continue shopping
      </BaseLinkOutlinePlatinum>

      <CustomAlert
        open={alertOpen}
        handleClose={handleClose}
        message="Invalid coupon code."
        severity="warning"
      />
      <CustomAlert
        open={successAlertOpen}
        handleClose={handleClose}
        message="Coupon applied successfully!"
        severity="success"
      />
      <CustomAlert
        open={duplicateCouponAlertOpen} // Alert for duplicate coupon
        handleClose={handleClose}
        message="Coupon already applied."
        severity="warning"
      />
    </CartDiscountWrapper>
  );
};

export default CartDiscount;
