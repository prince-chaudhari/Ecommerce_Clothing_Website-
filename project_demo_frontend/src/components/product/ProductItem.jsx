import { PropTypes } from "prop-types";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { commonCardStyles } from "../../styles/card";
import { breakpoints, defaultTheme } from "../../styles/themes/default";
import { AiOutlineHeart } from "react-icons/ai"; // Import the heart icon from react-icons

const ProductCardWrapper = styled(Link)`
  ${commonCardStyles}
  @media(max-width: ${breakpoints.sm}) {
    padding-left: 0;
    padding-right: 0;
  }

  .product-img {
    height: 393px;
    position: relative;

    @media (max-width: ${breakpoints.sm}) {
      height: 320px;
    }
  }

  .product-wishlist-icon {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 32px;
    height: 32px;
    border-radius: 100%;

    &:hover {
      background-color: ${defaultTheme.color_yellow};
      color: ${defaultTheme.color_white};
    }
  }

  .product-discount { 
    position: absolute;
    top: 16px;
    left: 16px;
    background-color: #2ecc71; /* Red background for discount */
    color: ${defaultTheme.color_white}; /* White text */
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.875rem; /* Smaller font for discount */
    font-weight: bold;
    z-index: 10; /* Ensure it stays above other content */

    @media (max-width: ${breakpoints.sm}) {
      top: 12px;
      left: 12px;
    }
  }

  &:hover {
    .product-discount {
      /* Keep the discount visible when hovering */
      display: block;
    }
  }
`;

const ProductItem = ({ product }) => {
  return (
    <ProductCardWrapper key={product.pid} to={`/product/details/${product.pid}`}>
      <div className="product-img">
        {/* Discount label */}
        {product.get_percentage && (
          <div className="product-discount">
            {product.get_percentage.toFixed(0)}% OFF {/* Fix the discount to whole number */}
          </div>
        )}
        <img className="object-fit-cover" src={product.product_image} alt={product.title} />
        <button
          type="button"
          className="product-wishlist-icon flex items-center justify-center bg-white"
        >
          <AiOutlineHeart size={18} /> {/* Use the imported heart icon here */}
        </button>
      </div>
      <div className="product-info">
        <p className="font-bold">{product.title}</p>
        <div className="flex items-center justify-between text-sm font-medium">
          <span className="text-gray">{product.category?.title}</span>
          <span className="text-outerspace font-bold">₹{product.price}</span> {/* Display price with two decimal places */}
        </div>
      </div>
    </ProductCardWrapper>
  );
};


export default ProductItem;
