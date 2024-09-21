import styled from "styled-components";
import { Container } from "../../styles/styles";
import Breadcrumb from "../../components/common/Breadcrumb";
import { product_one } from "../../data/data";
import ProductPreview from "../../components/product/ProductPreview";
import { Link, useNavigate } from "react-router-dom";
import { AddToCartButton } from "../../styles/button";
import { currencyFormat } from "../../utils/helper";
import { breakpoints, defaultTheme } from "../../styles/themes/default";
import ProductDescriptionTab from "../../components/product/ProductDescriptionTab";
import ProductSimilar from "../../components/product/ProductSimilar";
import ProductServices from "../../components/product/ProductServices";
import { useParams } from 'react-router-dom';
import { useGetColorListQuery, useGetProductQuery } from "../../services/userProductsApi";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useEffect, useState } from "react";
import { useAddProductToCartMutation, useGetCartProductsQuery } from "../../services/userCartApi";
import { getToken } from "../../services/LocalStorageService";
import { useDispatch, useSelector } from "react-redux";
import { addItemToCart } from '../../features/cartSlice'
import CustomAlert from './WarningAlert'

const DetailsScreenWrapper = styled.main`
  margin: 60px 0;
`;

const DetailsContent = styled.div`
  margin-top: 40px; /* Add margin at the top */
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;

  @media (max-width: ${breakpoints.xl}) {
    gap: 24px;
    grid-template-columns: 3fr 2fr;
  }

  @media (max-width: ${breakpoints.lg}) {
    grid-template-columns: 100%;
  }
`;
const ProductColorWrapper = styled.div`
  margin-top: 32px;

  @media (max-width: ${breakpoints.sm}) {
    margin-top: 24px;
  }

  .prod-colors-top {
    margin-bottom: 16px;
  }

  .prod-colors-list {
    column-gap: 12px;
  }

  .prod-colors-item {
    position: relative;
    width: 22px;
    height: 22px;
    transition: ${defaultTheme.default_transition};

    &:hover {
      scale: 0.9;
    }

    input {
      position: absolute;
      top: 0;
      left: 0;
      width: 22px;
      height: 22px;
      opacity: 0;
      cursor: pointer;

      &:checked + span {
        outline: 1px solid ${defaultTheme.color_gray};
        outline-offset: 3px;
      }
    }

    .prod-colorbox {
      border-radius: 100%;
      width: 22px;
      height: 22px;
      display: inline-block;
    }
  }
`;

const ProductDetailsWrapper = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 40px; /* Add margin at the bottom */

  @media (max-width: ${breakpoints.sm}) {
    padding: 16px;
  }

  @media (max-width: ${breakpoints.xs}) {
    padding: 12px;
  }

  .btn-and-price {
    margin-top: 36px;
    column-gap: 16px;
    row-gap: 10px;
    display: flex;
    align-items: center;

    @media (max-width: ${breakpoints.sm}) {
      margin-top: 24px;
      column-gap: 10px;
    }
  }

  .price-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .prod-price-current {
    font-size: 24px;
    font-weight: bold;
    color: ${defaultTheme.color_outerspace};

    @media (max-width: ${breakpoints.sm}) {
      font-size: 20px;
    }
  }

  .old-price-container {
    display: flex;
    align-items: center;
    gap: 8px;
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
    color: black; /* White text */

    @media (max-width: ${breakpoints.sm}) {
      font-size: 12px;
    }
  }
`;

const ProductSizeWrapper = styled.div`
  margin-top: 30px; /* Add margin at the top */
  .prod-size-top {
    gap: 20px;
  }
  .prod-size-list {
    gap: 12px;
    margin-top: 16px;
    @media (max-width: ${breakpoints.sm}) {
      gap: 8px;
    }
  }

  .prod-size-item {
    position: relative;
    height: 38px;
    width: 38px;
    cursor: pointer;

    @media (max-width: ${breakpoints.sm}) {
      width: 32px;
      height: 32px;
    }

    input {
      position: absolute;
      top: 0;
      left: 0;
      width: 38px;
      height: 38px;
      opacity: 0;
      cursor: pointer;

      @media (max-width: ${breakpoints.sm}) {
        width: 32px;
        height: 32px;
      }

      &:checked + span {
        color: ${defaultTheme.color_white};
        background-color: ${defaultTheme.color_outerspace};
        border-color: ${defaultTheme.color_outerspace};
      }
    }

    span {
      width: 38px;
      height: 38px;
      border-radius: 8px;
      border: 1.5px solid ${defaultTheme.color_silver};
      text-transform: uppercase;

      @media (max-width: ${breakpoints.sm}) {
        width: 32px;
        height: 32px;
      }
    }
  }
`;
const BreadcrumbStyled = styled(Breadcrumb)`
  margin-bottom: 20px; /* Add bottom margin for Breadcrumb */
`;

const ProductDescriptionTabStyled = styled(ProductDescriptionTab)`
  margin-top: 40px; /* Add top margin for Product Description */
  margin-bottom: 60px; /* Add bottom margin for Product Description */
`;

const ProductSimilarStyled = styled(ProductSimilar)`
  margin-top: 40px; /* Add top margin for Similar Products */
`;


const ProductDetailsScreen = () => {
  const { pid } = useParams();
  const { data, isSuccess, isLoading, isError, refetch } = useGetProductQuery({ pid });
  const [isInCart, setIsInCart] = useState(false);
  const [size, setSize] = useState("");
  const [selectedSize, setSelectedSize] = useState(""); // Add selectedSize state to track the user's selected size
  const [successAlertOpen, setSuccessAlertOpen] = useState(false);
  const [loginAlertOpen, setLoginAlertOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    // Reset size and isInCart when the pid changes
    setSize("");
    setIsInCart(false);
    setSelectedSize(""); // Reset the selectedSize when the product changes
  }, [pid]); // The effect will run whenever the pid changes
  

  const handleGoToCart = () => {
    navigate('/cart'); // Redirect to /cart
  };

  const showAlert = () => {
    setAlertOpen(true);
  };

  const handleClose = () => {
    setAlertOpen(false);
    setSuccessAlertOpen(false);
    setLoginAlertOpen(false);
  };

  const { access_token } = getToken();

  const [userCart] = useAddProductToCartMutation();
  const dispatch = useDispatch();


  const handleAddToCart = async () => {
    if(!access_token){
      setLoginAlertOpen(true)
      return
    }
    if (size === "") {
      showAlert();
      return;
    }

    const res = await userCart({ actualData: { product: pid, size: size }, access_token });

    if (res.error) {
      console.log(res.error.data);
      return;
    }

    if (res.data) {
      dispatch(addItemToCart({ cart_id: res.data.cart_id, product: res.data.product, quantity: 1, size: size }));
      setIsInCart(true);
      setSuccessAlertOpen(true); // Ensure this is set to true
      setSelectedSize(size); // Update the selected size
    }
  };

  // When a new size is selected, reset isInCart if it is not the size already added to the cart
  const handleSizeChange = (newSize) => {
    setSize(newSize);
    // If the new size is not the size already added to the cart, reset isInCart
    if (newSize !== selectedSize) {
      setIsInCart(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>; // or a spinner/loading component
  }

  if (isError) {
    return <div>Error loading product details.</div>;
  }

  if (!data || !data.product) {
    return <div>No product data available.</div>;
  }

  const stars = Array.from({ length: 5 }, (_, index) => (
    <span
      key={index}
      className={`text-yellow ${index < Math.floor(data.average_rating.rating)
        ? "bi bi-star-fill"
        : index + 0.5 === data.average_rating.rating
          ? "bi bi-star-half"
          : "bi bi-star"
        }`}
      style={{ paddingRight: '4px', marginTop: '10px' }}
    ></span>
  ));

  const breadcrumbItems = [
    { label: "Shop", link: "/product" },
    { label: data.product.title.split(' ')[0], link: "/product" },
    { label: data.product.category.title.split('-')[1], link: "" },
  ];

  return (
    <DetailsScreenWrapper>
      <Container>
        <BreadcrumbStyled items={breadcrumbItems} />
        <DetailsContent className="grid">
          <ProductPreview
            // key={data.product.product_image}
            mainImage={data.product.product_image}
            previewImages={data.p_image}
          />
          <ProductDetailsWrapper>
            <h2 className="prod-title">{data.product.title}</h2>
            {/* <div className="flex items-center rating-and-comments flex-wrap"> */}
            <div className="prod-rating flex items-center space-x-2">
              <div className="stars text-yellow-500 text-2xl flex flex-row items-center">
                {/* Assuming `stars` is an array of elements/icons */}
                {stars}
              </div>
              <div className="rating text-gray-800 text-lg font-semibold" style={{ marginTop: '10px', marginLeft: '7px' }}>
                {data.average_rating.rating}
              </div>
              <div className="rating text-gray-800 text-lg font-semibold" style={{ marginTop: '10px', marginLeft: '7px' }}>
                {data.product_reviews.length} Comment(s)
              </div>
            </div>

            {data.product.sizes && data.product.sizes.length > 0 &&
              <ProductSizeWrapper>
                <div className="prod-size-top flex items-center flex-wrap">
                  <p className="text-lg font-semibold text-outerspace">
                    Select size
                  </p>
                  <Link to="/" className="text-lg text-gray font-medium">
                    Size Guide &nbsp; <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
                <div className="prod-size-list flex items-center">
                  {data.product.sizes.map((size) => {
                    return (
                      <div className="prod-size-item" key={size.id}>
                        {isInCart && selectedSize === size.name ? (
                          <input type="radio" name="size" checked readOnly />
                        ) : (
                          <input
                            type="radio"
                            name="size"
                            onClick={() => handleSizeChange(size.name)}
                          />
                        )}
                        <span className="flex items-center justify-center font-medium text-outerspace text-sm">
                          {size.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </ProductSizeWrapper>
            }
            {data.product.colors && data.product.colors.length > 0 &&
              <ProductColorWrapper>
                <div className="prod-colors-top flex items-center flex-wrap">
                  <p className="text-lg font-semibold text-outerspace">
                    Colours Available
                  </p>
                </div>
                <div className="prod-colors-list flex items-center">
                  {data.product.colors?.map((color) => (
                    <Link to={`/product/details/${color.products[0].pid}/`}>
                      <div className="prod-colors-item" key={color.id} id={color.id} >
                        <input type="radio" name="colors" />
                        {data.product.color == color.name ?
                          <span
                            className="prod-colorbox"
                            style={{
                              backgroundColor: color.code,
                              width: '30px', // Set a width
                              height: '30px', // Set a height
                              borderRadius: '30%', // Optional: for a circular swatch
                              border: '3px solid black', // Border for visible box
                              boxShadow: '0 0 17px rgba(0, 0, 0, 0.7)', // Optional: adds a shadow to indicate selection
                            }}
                          ></span>
                          :
                          <span
                            className="prod-colorbox"
                            style={{
                              backgroundColor: color.code,
                              width: '30px', // Set a width
                              height: '30px', // Set a height
                              borderRadius: '30%', // Optional: for a circular swatch
                              border: '1px solid gray', // Border to make the box visible but less prominent
                            }}

                          ></span>
                        }
                      </div>
                    </Link>
                  ))}
                </div>

              </ProductColorWrapper>
            }

            <div className="btn-and-price flex items-center flex-wrap">
              <AddToCartButton className="prod-add-btn">
                <span className="prod-add-btn-icon">
                  <i className="bi bi-cart2"></i>
                </span>
                {isInCart ? (
                  <span className="prod-add-btn-text" onClick={handleGoToCart}>
                    Go to cart
                  </span>
                ) : (
                  <span className="prod-add-btn-text" onClick={handleAddToCart}>
                    Add to cart
                  </span>
                )}
              </AddToCartButton>

              <div className="price-container">
                <span className="prod-price-current">₹{data.product.price}</span>
                {data.product.old_price && (
                  <div className="old-price-container">
                    <span className="prod-price-old">₹{data.product.old_price}</span>
                    <span className="prod-percentage">
                      ({data.product.get_percentage.toFixed(0)}% OFF)
                    </span>
                  </div>
                )}
              </div>
            </div>
            <ProductServices />
          </ProductDetailsWrapper>
        </DetailsContent>
        <ProductDescriptionTabStyled description={data.product.description} reviews={data.product_reviews} />
        <ProductSimilarStyled relatedProducts={data.related_products} />
      </Container>
      {!isInCart && (
        <CustomAlert
          open={alertOpen}
          handleClose={handleClose}
          message="Please select a size before adding to the cart."
          severity="warning"
        />
      )}
      <CustomAlert
        open={successAlertOpen}
        handleClose={handleClose}
        message="Item added to cart successfully!"
        severity="success"
      />
      <CustomAlert
        open={loginAlertOpen}
        handleClose={handleClose}
        message="Please login to continue!"
        severity="warning"
      />
    </DetailsScreenWrapper>
  );
};


export default ProductDetailsScreen;

