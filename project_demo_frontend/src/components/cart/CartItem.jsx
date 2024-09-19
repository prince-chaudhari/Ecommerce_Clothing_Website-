import styled from "styled-components";
import { PropTypes } from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import { breakpoints, defaultTheme } from "../../styles/themes/default";
import { useEffect, useState } from "react";
import { useDeleteProductCartMutation, useUpdateProductCartMutation } from "../../services/userCartApi";
import { getToken } from "../../services/LocalStorageService";
import { removeItemFromCart, updateItemQuantity } from "../../features/cartSlice";
import { useDispatch } from "react-redux";
import CustomAlert from "../../screens/product/WarningAlert";

const CartTableRowWrapper = styled.tr`
  .cart-tbl {
    &-prod {
      grid-template-columns: 80px auto;
      column-gap: 12px;

      @media (max-width: ${breakpoints.xl}) {
        grid-template-columns: 60px auto;
      }
    }

    &-qty {
      .qty-inc-btn,
      .qty-dec-btn {
        width: 24px;
        height: 24px;
        border: 1px solid ${defaultTheme.color_platinum};
        border-radius: 2px;
        transition: background-color 0.3s ease, border-color 0.3s ease;

        &:hover {
          border-color: ${defaultTheme.color_sea_green};
          background-color: ${defaultTheme.color_sea_green};
          color: ${defaultTheme.color_white};
          cursor: pointer;
        }
      }

      .qty-value {
        width: 40px;
        height: 24px;
      }
    }
  }

  .cart-prod-info {
    
  h4 {
      transition: color 0.3s ease, text-decoration 0.3s ease;
      cursor: pointer;
      color: ${defaultTheme.color_dark_gray};

      &:hover {
        color: ${defaultTheme.color_sea_green};
        text-decoration: underline;
      }
    }

    p {
      margin-right: 8px;
      span {
        margin-right: 4px;
      }
    }
  }

  .cart-prod-img {
    width: 80px;
    height: 80px;
    overflow: hidden;
    border-radius: 8px;

    @media (max-width: ${breakpoints.xl}) {
      width: 60px;
      height: 60px;
    }
  }

  .tbl-actions {
    display: flex;
    justify-content: center;
    gap: 8px;

    .tbl-action-btn {
      text-decoration: none;
      color: ${defaultTheme.color_red};
      font-size: 1.2rem;

      &:hover {
        color: ${defaultTheme.color_sea_green};
      }
    }

    .tbl-update-btn {
      text-decoration: none;
      color: ${defaultTheme.color_blue};
      font-size: 1.2rem;

      &:hover {
        color: ${defaultTheme.color_sea_green};
      }
    }
  }
`;

const CartItem = ({ cartItem }) => {
  const navigate = useNavigate();
  console.log("cartItem.quantity", cartItem.quantity);
  
  const [quantity, setQuantity] = useState(cartItem.quantity);
  const [showUpdateBtn, setShowUpdateBtn] = useState(false);
  const { access_token } = getToken();
  const dispatch = useDispatch();
  const [updateAlertOpen, setUpdateAlertOpen] = useState(false);

  const [userUpdateProduct] = useUpdateProductCartMutation();
  const [userDeleteProduct] = useDeleteProductCartMutation();

  const handleClick = () => {
    navigate(`/product/details/${cartItem.product.pid}`);
  };

  const handleIncrement = () => {
    setQuantity(quantity + 1);
    setShowUpdateBtn(true);
  };

  const handleClose = () => {
    setUpdateAlertOpen(false);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
      setShowUpdateBtn(true);
    }
  };

  const handleUpdate = async () => {
    const res = await userUpdateProduct({ actualData: { cart_id: cartItem.cart_id, quantity: quantity }, access_token });

    if (res.error) {
      console.log(res.error.data);
      return;
    }

    if (res.data) {
      console.log(res.data);
      setShowUpdateBtn(false);
      setUpdateAlertOpen(true)
      dispatch(updateItemQuantity({ id: cartItem.cart_id, quantity: quantity }));
    }
  };

  const handleDelete = async () => {
    const res = await userDeleteProduct({ actualData: { cart_id: cartItem.cart_id }, access_token });
  
    if (res.error) {
      console.log(res.error.data);
      return;
    }
  
    // Remove the item from the cart after deletion
    dispatch(removeItemFromCart({ id: cartItem.cart_id }));
  };
  

  return (
    <CartTableRowWrapper key={cartItem.cart_id}>
      <td>
        <div className="cart-tbl-prod grid">
          <div className="cart-prod-img">
            <img src={cartItem.product.product_image} className="object-fit-cover" alt="" />
          </div>
          <div className="cart-prod-info" >
            <h4 className="text-base" onClick={handleClick}>{cartItem.product.title}</h4>
            <p className="text-sm text-gray inline-flex">
              <span className="font-semibold">Color: </span> {cartItem.product.color}
            </p>
            <p className="text-sm text-gray inline-flex">
              <span className="font-semibold">Size: </span>
              {cartItem.size.toUpperCase()}
            </p>
          </div>
        </div>
      </td>
      <td>
        <span className="text-lg font-bold text-outerspace">
          ₹{cartItem.product.price}
        </span>
      </td>
      <td>
        <div className="cart-tbl-qty flex items-center">
          <button className="qty-dec-btn" onClick={handleDecrement}>
            <i className="bi bi-dash-lg"></i>
          </button>
          <span className="qty-value inline-flex items-center justify-center font-medium text-outerspace">
            {quantity}
          </span>
          <button className="qty-inc-btn" onClick={handleIncrement}>
            <i className="bi bi-plus-lg"></i>
          </button>
        </div>
      </td>
      <td>
        <span className="cart-tbl-shipping uppercase text-silver font-bold">
          Free
        </span>
      </td>
      <td>
        <span className="text-lg font-bold text-outerspace">
          ₹{cartItem.product.price * quantity}
        </span>
      </td>
      <td>
        <div className="tbl-actions">
          {showUpdateBtn && quantity !== cartItem.quantity && (
            <button className="tbl-update-btn" onClick={handleUpdate}>
              <i className="bi bi-pencil"></i>
            </button>
          )}
          <button className="tbl-action-btn" onClick={handleDelete}>
            <i className="bi bi-trash3"></i>
          </button>
        </div>
      </td>
      <CustomAlert
        open={updateAlertOpen}
        handleClose={handleClose}
        message="Item updated successfully!"
        severity="success"
      />
    </CartTableRowWrapper>
  );
};

export default CartItem;

CartItem.propTypes = {
  cartItem: PropTypes.object.isRequired,
};
