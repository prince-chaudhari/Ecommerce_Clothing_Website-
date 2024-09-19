import styled from "styled-components";
import { Container } from "../../styles/styles";
import Breadcrumb from "../../components/common/Breadcrumb";
import { UserContent, UserDashboardWrapper } from "../../styles/user";
import UserMenu from "../../components/user/UserMenu";
import Title from "../../components/common/Title";
import { breakpoints, defaultTheme } from "../../styles/themes/default";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useAddProductToCartMutation } from "../../services/userCartApi";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../services/LocalStorageService";
import { addItemToCart } from "../../features/cartSlice";
import { AddToCartButton } from "../../styles/button";
import CustomAlert from "../product/WarningAlert";
import { useDeleteProductWishlistMutation, useGetWishlistProductsQuery } from "../../services/userWishlistApi";
import { addItemToWishlist, removeItemFromWishlist } from "../../features/wishlistSlice";

const WishListScreenWrapper = styled.main`
  .wishlist {
    gap: 20px;
  }
`;

const WishItemWrapper = styled.div`
  gap: 30px;
  max-width: 900px;
  position: relative;

  @media (max-width: ${breakpoints.xl}) {
    column-gap: 20px;
  }

  @media (max-width: ${breakpoints.lg}) {
    column-gap: 16px;
  }

  @media (max-width: ${breakpoints.xs}) {
    flex-direction: column;
    gap: 12px;
  }
  .wish-item-title{
    transition: color 0.3s ease, text-decoration 0.3s ease;
      cursor: pointer;
      color: ${defaultTheme.color_dark_gray};

      &:hover {
        color: ${defaultTheme.color_sea_green};
        text-decoration: underline;
      }
  }

  .wish-item-img {
    column-gap: 30px;

    @media (max-width: ${breakpoints.xl}) {
      column-gap: 20px;
    }

    @media (max-width: ${breakpoints.lg}) {
      column-gap: 16px;
    }

    &-wrapper {
      min-width: 110px;
      width: 110px;
      border-radius: 4px;
      overflow: hidden;

      @media (max-width: ${breakpoints.xs}) {
        min-width: 100%;
        height: 180px;

        img {
          object-position: top;
        }
      }
    }

    .wish-remove-btn {
      width: 20px;
      min-width: 20px;
      height: 20px;
      border: 1px solid ${defaultTheme.color_outerspace};
      border-radius: 50%;
      font-size: 10px;
      margin-top: auto;
      margin-bottom: auto;

      &:hover {
        background-color: ${defaultTheme.color_gray};
        color: ${defaultTheme.color_white};
        border-color: ${defaultTheme.color_gray};
      }

      @media (max-width: ${breakpoints.sm}) {
        position: absolute;
        right: -10px;
        top: -10px;
      }

      @media (max-width: ${breakpoints.xs}) {
        right: 6px;
        top: 6px;
        background-color: ${defaultTheme.color_jet};
        color: ${defaultTheme.color_white};
      }
    }
  }

  .wish-item-info {
    flex: 1;

    @media (max-width: ${breakpoints.sm}) {
      flex-direction: column;
      row-gap: 8px;
    }

    &-l {
      row-gap: 4px;

      ul {
        row-gap: 4px;
        li {
          span {
            &:last-child {
              margin-left: 4px;
            }
          }
        }
      }
    }

    &-r {
      column-gap: 40px;

      @media (max-width: ${breakpoints.xl}) {
        column-gap: 20px;
      }

      @media (max-width: ${breakpoints.lg}) {
        flex-direction: column;
        align-items: flex-end;
        row-gap: 8px;
      }

      @media (max-width: ${breakpoints.sm}) {
        flex-direction: row;
        align-items: center;
      }

      .wish-item-price {
        font-size: 18px;
        font-weight: bold;
        color: ${defaultTheme.color_primary}; /* Highlight the price with the primary theme color */
        display: flex;
        flex-direction: column; /* Stack the old price and percentage below the main price */
        align-items: center; /* Center the price */
        text-align: center; /* Center-align the text */
        margin-right: 8px; /* Add some margin to the right of the price */

        @media (max-width: ${breakpoints.sm}) {
          order: 2;
        }

        .old-price-container {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
          flex-direction: row; /* Stack old price and percentage vertically */
        }

        .prod-price-old {
          font-size: 14px;
          font-weight: 400;
          color: ${defaultTheme.color_gray};
          text-decoration: line-through;

          @media (max-width: ${breakpoints.sm}) {
            font-size: 12px;
          }
        }

        .prod-percentage {
          font-size: 14px;
          font-weight: 500;
          color: ${defaultTheme.color_success}; /* Highlight the discount percentage with a green color */
          background-color: ${defaultTheme.color_success_light}; /* Add a light background to the discount percentage */
          padding: 2px 6px; /* Add some padding to the discount percentage */
          border-radius: 4px; /* Add border-radius to the discount percentage */

          @media (max-width: ${breakpoints.sm}) {
            font-size: 12px;
          }
        }
      }

      .wish-cart-btn {
        @media (max-width: ${breakpoints.sm}) {
          order: 1;
        }
      }
    }
  }

  .wish-item-sizes {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;

    select {
      padding: 4px 8px;
      border: 1px solid ${defaultTheme.color_gray};
      border-radius: 4px;
      background-color: ${defaultTheme.color_white};
      font-size: 14px;
      color: ${defaultTheme.color_outerspace};
      font-weight: 500;

      @media (max-width: ${breakpoints.sm}) {
        font-size: 12px;
      }
    }
  }
`;

const breadcrumbItems = [
  { label: "Home", link: "/" },
  { label: "Wishlist", link: "/wishlist" },
];

const WishListScreen = () => {
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const [sizes, setSizes] = useState({});
  const [userCart] = useAddProductToCartMutation();
  const [deleteProductFromWishlist, { isLoading: isDeleting }] = useDeleteProductWishlistMutation();
  const navigate = useNavigate(); // Initialize navigate
  const { access_token } = getToken();
  const dispatch = useDispatch();
  const [alertOpen, setAlertOpen] = useState(false);
  const [successAlertOpen, setSuccessAlertOpen] = useState(false);
  const [isInCart, setIsInCart] = useState({}); // Change to object

  const [sizeChanged, setSizeChanged] = useState({}); // Track if size changed for each product

  const handleClick = (pid) => {
    navigate(`/product/details/${pid}`);
  };

  const showAlert = () => {
    setAlertOpen(true);
  };

  const handleClose = () => {
    setAlertOpen(false);
    setSuccessAlertOpen(false);
  };

  const handleAddToCart = async (pid) => {
    const selectedSize = sizes[pid];
    if (!selectedSize) {
      showAlert();
      return;
    }

    const res = await userCart({ actualData: { product: pid, size: selectedSize }, access_token });

    if (res.error) {
      console.log(res.error.data);
      return;
    }

    if (res.data) {
      dispatch(addItemToCart({ cart_id: res.data.cart_id, product: res.data.product, quantity: 1, size: selectedSize }));
      setSuccessAlertOpen(true);
      setSizeChanged((prev) => ({ ...prev, [pid]: false }));
      setIsInCart((prev) => ({ ...prev, [pid]: true })); // Update only the selected product
    }
  };


  const handleGoToCart = () => {
    navigate('/cart'); // Redirect to /cart
  };

  const handleSizeChange = (pid, event) => {
    const newSize = event.target.value;
    setSizes((prevSizes) => ({
      ...prevSizes,
      [pid]: newSize,
    }));

    const cartItem = cartItems.find((item) => item.product.pid === pid);
    if (cartItem && cartItem.size !== newSize) {
      setSizeChanged((prev) => ({
        ...prev,
        [pid]: true, // Mark that size has changed
      }));
    }
  };

  const handleRemoveFromWishlist = async (pid, e) => {
    e.preventDefault();
    const item = wishlistItems.find((item) => item.product.pid === pid);
    if (!item) return;

    try {
      await deleteProductFromWishlist({ actualData: { wishlist_id: item.wishlist_id }, access_token }).unwrap();
      dispatch(removeItemFromWishlist({ id: item.wishlist_id }));
    } catch (error) {
      console.error('Failed to remove from wishlist: ', error);
    }
  };

  return (
    <WishListScreenWrapper className="page-py-spacing">
      <Container>
        <Breadcrumb items={breadcrumbItems} />
        <UserDashboardWrapper>
          <UserMenu />
          <UserContent>
            <Title titleText={"Wishlist"} />
            <div className="wishlist grid">
              {wishlistItems?.map((wishlist) => {

                return (
                  <WishItemWrapper className="wish-item flex" key={wishlist.wishlist_id}>
                    <div className="wish-item-img flex items-stretch" >
                      <button type="button" className="wish-remove-btn" onClick={(e) => handleRemoveFromWishlist(wishlist.product.pid, e)}>
                        <i className="bi bi-x-lg"></i>
                      </button>
                      <div className="wish-item-img-wrapper">
                        <img
                          src={wishlist.product.product_image}
                          className="object-fit-cover"
                          alt=""
                        />
                      </div>
                    </div>
                    <div className="wish-item-info flex justify-between">
                      <div className="wish-item-info-l flex flex-col"  >
                        <p className="wish-item-title text-xl font-bold text-outerspace" onClick={() => handleClick(wishlist.product.pid)}>
                          {wishlist.product.title}
                        </p>
                        <ul className="flex flex-col">
                          <li>
                            <span className="text-lg font-bold">Color:</span>
                            <span className="text-lg text-gray font-medium capitalize">
                              {wishlist.product.color}
                            </span>
                          </li>
                          <li className="flex items-center">
                            <span className="text-lg font-bold">Sizes:&nbsp;&nbsp;</span>
                            <div className="wish-item-sizes">
                              <select onChange={(event) => handleSizeChange(wishlist.product.pid, event)}>
                                <option value="">Select Size</option>
                                {wishlist.product.sizes.map((size) => (
                                  <option key={size.id} value={size.name}>{size.name}</option>
                                ))}
                              </select>
                            </div>
                          </li>
                        </ul>
                      </div>
                      <div className="wish-item-info-r flex items-center">
                        <div className="wish-item-price">
                          ₹{wishlist.product.price}
                          <div className="old-price-container">
                            <span className="prod-price-old">₹{wishlist.product.old_price}</span>
                            <span className="prod-percentage">
                              ({wishlist.product.get_percentage.toFixed(0)}% OFF)
                            </span>
                          </div>
                        </div>
                        <div className="wish-cart-btn">
                          {isInCart[wishlist.product.pid] && !sizeChanged[wishlist.product.pid] ? (
                            <AddToCartButton onClick={handleGoToCart}>Go to Cart</AddToCartButton>
                          ) : (
                            <AddToCartButton onClick={() => handleAddToCart(wishlist.product.pid)}>Add to Cart</AddToCartButton>
                          )}
                        </div>
                      </div>
                    </div>
                  </WishItemWrapper>
                );
              })}

            </div>
          </UserContent>
        </UserDashboardWrapper>
      </Container>
      {
        alertOpen &&
        <CustomAlert
          open={alertOpen}
          handleClose={handleClose}
          message="Please select a size before adding to the cart."
          severity="warning"
        />
      }
      <CustomAlert
        open={successAlertOpen}
        handleClose={handleClose}
        message="Item added to cart successfully!"
        severity="success"
      />
    </WishListScreenWrapper>
  );
};

export default WishListScreen;
