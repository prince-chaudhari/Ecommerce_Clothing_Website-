import styled from "styled-components";
import { Container } from "../../styles/styles";
import Breadcrumb from "../../components/common/Breadcrumb";
import { product_one } from "../../data/data";
import ProductPreview from "../../components/product/ProductPreview";
import { Link } from "react-router-dom";
import { BaseLinkGreen } from "../../styles/button";
import { currencyFormat } from "../../utils/helper";
import { breakpoints, defaultTheme } from "../../styles/themes/default";
import ProductDescriptionTab from "../../components/product/ProductDescriptionTab";
import ProductSimilar from "../../components/product/ProductSimilar";
import ProductServices from "../../components/product/ProductServices";
import { useParams } from 'react-router-dom';
import { useGetColorListQuery, useGetProductQuery } from "../../services/userProductsApi";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useEffect } from "react";

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
  const { data, isSuccess, isLoading, isError } = useGetProductQuery({ pid });
  console.log(data);

  if (isLoading) {
    return <div>Loading...</div>; // or a spinner/loading component
  }

  if (isError) {
    return <div>Error loading product details.</div>;
  }

  if (!data || !data.product) {
    return <div>No product data available.</div>;
  }

  // Proceed with rendering the product details
  const stars = Array.from({ length: 5 }, (_, index) => (
    <span
      key={index}
      className={`text-yellow ${index < Math.floor(data.average_rating.rating)
        ? "bi bi-star-fill"
        : index + 0.5 === data.average_rating.rating
          ? "bi bi-star-half"
          : "bi bi-star"
        }`}
      style={{ paddingRight: '4px', marginTop: '10px' }} // Add padding between stars
    ></span>
  ));

  const breadcrumbItems = [
    { label: "Shop", link: "" },
    { label: data.product.title.split(' ')[0], link: "" },
    { label: data.product.category.title.split('-')[1], link: "" },
  ];
  console.log(data && data.product.product_image);

  return (
    <DetailsScreenWrapper>
      <Container>
        <BreadcrumbStyled items={breadcrumbItems} />
        <DetailsContent className="grid">
          <ProductPreview
            key={data.product.product_image}
            mainImage={data.product.product_image}
            previewImages={data.p_image}
          />
          <ProductDetailsWrapper>
            <h2 className="prod-title">{data.product.title}</h2>
            <div className="flex items-center rating-and-comments flex-wrap">
              <div className="prod-rating flex items-center">
                {stars}
                <span className="text-gray text-xs">
                  {data.average_rating.rating}
                </span>
              </div>
            </div>

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
                {product_one.sizes.map((size, index) => (
                  <div className="prod-size-item" key={index}>
                    <input type="radio" name="size" />
                    <span className="flex items-center justify-center font-medium text-outerspace text-sm">
                      {size}
                    </span>
                  </div>
                ))}
              </div>
            </ProductSizeWrapper>
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
              <BaseLinkGreen
                to="/cart"
                as={BaseLinkGreen}
                className="prod-add-btn"
              >
                <span className="prod-add-btn-icon">
                  <i className="bi bi-cart2"></i>
                </span>
                <span className="prod-add-btn-text">Add to cart</span>
              </BaseLinkGreen>
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
        <ProductDescriptionTabStyled description={data.product.description} />
        <ProductSimilarStyled relatedProducts={data.related_products} />
      </Container>
    </DetailsScreenWrapper>
  );
};

export default ProductDetailsScreen;

