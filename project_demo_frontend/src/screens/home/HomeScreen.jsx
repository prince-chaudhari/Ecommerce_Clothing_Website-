import styled from "styled-components";
import Hero from "../../components/home/Hero";
import Featured from "../../components/home/Featured";
import NewArrival from "../../components/home/NewArrival";
import SavingZone from "../../components/home/SavingZone";
import Catalog from "../../components/home/Catalog";
import { limelightCatalog, mensCatalog, womensCatalog } from "../../data/data";
import Brands from "../../components/home/Brands";
import Feedback from "../../components/home/Feedback";
import { getToken } from "../../services/LocalStorageService";
import { useDispatch, useSelector } from "react-redux";
import { useGetLoggedUserQuery } from "../../services/userAuthApi";
import { setUserInfo } from '../../features/userSlice'
import { useEffect } from "react";
import { useGetPriceRangeQuery, useGetProductsQuery } from "../../services/userProductsApi";
import { setColors, setPrice } from "../../features/productFilterSlice";
import { useGetCartProductsQuery } from "../../services/userCartApi";
import { addItemToCart, clearCart } from "../../features/cartSlice";
import { useGetWishlistProductsQuery } from "../../services/userWishlistApi";
import { addItemToWishlist } from "../../features/wishlistSlice";
import { useGetUserAdressQuery } from "../../services/userAddressApi";
import { addUserAddress } from "../../features/addressSlice";

const HomeScreenWrapper = styled.main``;

const HomeScreen = () => {

  const dispatch = useDispatch();
  const { access_token } = getToken();
  const { data, isSuccess } = useGetLoggedUserQuery(access_token);
  const { data: cartData, isSuccess: isSuccessCart } = useGetCartProductsQuery({ access_token });
  const { data: wishlistData, isSuccess: isSuccessWishlist } = useGetWishlistProductsQuery({ access_token });
  const { data: addressData, isSuccess: isSuccessAddress } = useGetUserAdressQuery({ access_token });
  const { data: priceRange, isSuccess: isSuccessPriceRange } = useGetPriceRangeQuery();

  useEffect(() => {
    if (data && isSuccess) {
      console.log("data", data);
      
      dispatch(
        setUserInfo({
          id: data.id,
          email: data.email,
          username: data.username,
          get_avatar: data.get_avatar,
          date_of_birth: data.date_of_birth,
          gender: data.gender,
        })
      );
    }
  }, [data, isSuccess, dispatch]);

  useEffect(() => {
    if (cartData && isSuccessCart) {
      // Assuming `cartData` is an array of cart items
      dispatch(clearCart())
      cartData.forEach((item) => {
        dispatch(addItemToCart({
          product: item.product,    // Assuming item contains a `product` field
          quantity: item.quantity,   // Assuming item contains a `quantity` field
          cart_id : item.cart_id,
          size: item.size
        }));
      });
    }
  }, [cartData, isSuccessCart]);

  useEffect(() => {
    if (wishlistData && isSuccessWishlist) {
      // Assuming `cartData` is an array of cart items
      wishlistData.forEach((item) => {
        dispatch(addItemToWishlist({
          product: item.product,    // Assuming item contains a `product` field
          wishlist_id : item.wishlist_id,
        }));
      });
    }
  }, [wishlistData, isSuccessWishlist]);
  useEffect(() => {
    if (addressData && isSuccessAddress) {
      // Assuming `cartData` is an array of cart items
      addressData.forEach((item) => {
        dispatch(addUserAddress({
          address: item,    // Assuming item contains a `product` field
        }));
      });
    }
  }, [addressData, isSuccessAddress]);

  useEffect(() => {
    if (isSuccessPriceRange) {

      dispatch(setPrice({ min_price: priceRange.min_price, max_price: priceRange.max_price }));
    }
  }, [isSuccessPriceRange, priceRange]);


  const { data: products, isSuccess: isSuccessProducts, isLoading } = useGetProductsQuery();
  if (isLoading) return <div>Loading...</div>;
  if (!isSuccessProducts) return <div>Failed to load products</div>;

  let mensCatalog = [];
  if (products && isSuccessProducts) {
    const addedCategories = new Set(); // Track added categories

    mensCatalog = products.filter((product) => {
      // Ensure product title exists and starts with "Men"
      if (product.title && product.title.startsWith("Men")) {
        const category = product.category.title.split("-")[1]; // Extract the category part (before the space)

        // Only add the product if its category hasn't been added yet
        if (!addedCategories.has(category)) {
          addedCategories.add(category);
          return true; // Include this product
        }
      }
      return false; // Exclude this product
    });
  }
  let womensCatalog = [];
  if (products && isSuccessProducts) {
    const addedCategories = new Set(); // Track added categories

    womensCatalog = products.filter((product) => {
      // Ensure product title exists and starts with "Men"
      if (product.title && product.title.startsWith("Women")) {
        const category = product.category.title.split("-")[1]; // Extract the category part (before the space)

        // Only add the product if its category hasn't been added yet
        if (!addedCategories.has(category)) {
          addedCategories.add(category);
          return true; // Include this product
        }
      }
      return false; // Exclude this product
    });
  }


  return (
    <HomeScreenWrapper>
      <Hero />
      <Featured />
      <NewArrival />
      <SavingZone />
      <Catalog catalogTitle={"Products For Men"} products={mensCatalog} />
      <Catalog catalogTitle={"Products For Women"} products={womensCatalog} />
      <Brands />
      <Catalog catalogTitle={"In The LimeLight"} products={products} />
      <Feedback />
    </HomeScreenWrapper>
  );
};

export default HomeScreen;
