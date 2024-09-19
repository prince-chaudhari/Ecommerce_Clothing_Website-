// ProductItem.js
import { useState, useEffect } from 'react';
import { PropTypes } from 'prop-types';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { commonCardStyles } from '../../styles/card';
import { breakpoints, defaultTheme } from '../../styles/themes/default';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { useAddProductToWishlistMutation, useDeleteProductWishlistMutation } from '../../services/userWishlistApi';
import { addItemToWishlist, removeItemFromWishlist } from '../../features/wishlistSlice';
import { useDispatch, useSelector } from 'react-redux';
import { getToken } from '../../services/LocalStorageService';

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
    background: none;
    border: none;
    cursor: pointer;

    &:hover {
      background-color: ${defaultTheme.color_yellow};
      color: ${defaultTheme.color_white};
    }
  }

  .product-discount { 
    position: absolute;
    top: 16px;
    left: 16px;
    background-color: #2ecc71;
    color: ${defaultTheme.color_white};
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: bold;
    z-index: 10;

    @media (max-width: ${breakpoints.sm}) {
      top: 12px;
      left: 12px;
    }
  }

  &:hover {
    .product-discount {
      display: block;
    }
  }
`;

const ProductItem = ({ product }) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const dispatch = useDispatch();
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const { access_token } = getToken();

  const [addProductToWishlist, { isLoading: isAdding }] = useAddProductToWishlistMutation();
  const [deleteProductFromWishlist, { isLoading: isDeleting }] = useDeleteProductWishlistMutation();

  useEffect(() => {
    setIsInWishlist(
      wishlistItems.some((item) => item.product.pid === product.pid)
    );
  }, [wishlistItems, product.pid]);

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    try {
      const result = await addProductToWishlist({ actualData: { product: product.pid }, access_token }).unwrap();
      dispatch(addItemToWishlist({ wishlist_id: result.wishlist_id, product: result.product }));
    } catch (error) {
      console.error('Failed to add to wishlist: ', error);
    }
  };

  const handleRemoveFromWishlist = async (e) => {
    e.preventDefault();
    const item = wishlistItems.find((item) => item.product.pid === product.pid);
    if (!item) return;

    try {
      await deleteProductFromWishlist({ actualData: { wishlist_id: item.wishlist_id }, access_token }).unwrap();
      dispatch(removeItemFromWishlist({ id: item.wishlist_id }));
    } catch (error) {
      console.error('Failed to remove from wishlist: ', error);
    }
  };

  return (
    <ProductCardWrapper key={product.pid} to={`/product/details/${product.pid}`}>
      <div className="product-img">
        {product.get_percentage && (
          <div className="product-discount">
            {product.get_percentage.toFixed(0)}% OFF
          </div>
        )}
        <img className="object-fit-cover" src={product.product_image} alt={product.title} />
        {isInWishlist ? (
          <button
            type="button"
            className="product-wishlist-icon flex items-center justify-center"
            onClick={handleRemoveFromWishlist}
          >
            <AiFillHeart size={18} />
          </button>
        ) : (
          <button
            type="button"
            className="product-wishlist-icon flex items-center justify-center"
            onClick={handleAddToWishlist}
          >
            <AiOutlineHeart size={18} />
          </button>
        )}
      </div>
      <div className="product-info">
        <p className="font-bold">{product.title}</p>
        <div className="flex items-center justify-between text-sm font-medium">
          <span className="text-gray">{product.category?.title}</span>
          <span className="text-outerspace font-bold">₹{product.price}</span>
        </div>
      </div>
    </ProductCardWrapper>
  );
};

ProductItem.propTypes = {
  product: PropTypes.object.isRequired,
};

export default ProductItem;
