import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { BaseButtonGreen } from "../../styles/button";
import { breakpoints, defaultTheme } from "../../styles/themes/default";

const CartSummaryWrapper = styled.div`
  background-color: ${defaultTheme.color_flash_white};
  padding: 16px;

  .checkout-btn {
    min-width: 100%;
  }

  .summary-list {
    padding: 20px;

    @media (max-width: ${breakpoints.xs}) {
      padding-top: 0;
      padding-right: 0;
      padding-left: 0;
    }

    .summary-item {
      margin: 6px 0;

      &:last-child {
        margin-top: 20px;
        border-top: 1px dashed ${defaultTheme.color_sea_green};
        padding-top: 10px;
      }
    }
  }
`;

const CartSummary = ({ totalQuantity, totalPrice, savings }) => {
  const navigate = useNavigate();
  const handleCheckoutClick = () => {
    navigate('/checkout');
  };

  return (
    <CartSummaryWrapper>
      <ul className="summary-list">
        <li className="summary-item flex justify-between">
          <span className="font-medium text-outerspace">Sub Total</span>
          <span className="font-medium text-outerspace">₹{totalPrice}</span>
        </li>
        <li className="summary-item flex justify-between">
          <span className="font-medium text-outerspace">Savings</span>
          <span className="font-medium text-outerspace">₹{savings}</span>
        </li>
        <li className="summary-item flex justify-between">
          <span className="font-medium text-outerspace">Shipping</span>
          <span className="font-medium text-outerspace">FREE</span>
        </li>
        <li className="summary-item flex justify-between">
          <span className="font-medium text-outerspace">Grand Total</span>
          <span className="summary-item-value font-bold text-outerspace">
          ₹{totalPrice}
          </span>
        </li>
      </ul>
      <BaseButtonGreen type="button" className="checkout-btn" onClick={handleCheckoutClick}>
        Proceed To Checkout
      </BaseButtonGreen>
    </CartSummaryWrapper>
  );
};

export default CartSummary;
