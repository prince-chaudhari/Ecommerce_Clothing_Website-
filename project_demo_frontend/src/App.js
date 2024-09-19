import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./screens/home/HomeScreen";
// layouts
import BaseLayout from "./components/layout/BaseLayout";
import AuthLayout from "./components/layout/AuthLayout";
import { GlobalStyles } from "./styles/global/GlobalStyles";
// auth pages
import SignIn from "./screens/auth/SignInScreen";
import SignUp from "./screens/auth/SignUpScreen";
import Reset from "./screens/auth/ResetScreen";
import ChangePassword from "./screens/auth/ChangePasswordScreen";
import CheckMail from "./screens/auth/CheckMailScreen";
import Verification from "./screens/auth/VerificationScreen";
import NotFound from "./screens/error/NotFoundScreen";
import ProductList from "./screens/product/ProductListScreen";
import ProductDetails from "./screens/product/ProductDetailsScreen";
import Cart from "./screens/cart/CartScreen";
import CartEmpty from "./screens/cart/CartEmptyScreen";
import Checkout from "./screens/checkout/CheckoutScreen";
import Order from "./screens/user/OrderListScreen";
import OrderDetail from "./screens/user/OrderDetailScreen";
import WishList from "./screens/user/WishListScreen";
import WishListEmpty from "./screens/user/WishListEmptyScreen";
import Confirm from "./screens/user/ConfirmScreen";
import Account from "./screens/user/AccountScreen";
import Address from "./screens/user/AddressScreen";
import { useSelector } from "react-redux";
import './App.css';
import { getToken } from "./services/LocalStorageService";
import ChangePasswordScreen from "./screens/user/ChangePasswordScreen";
import ShippingPayment from "./components/checkout/ShippingPayment";


function App() {
  const { access_token } = useSelector(state => state.auth)
  const { wishlistCnt } = useSelector(state => state.wishlist || {});
  const { cartCnt } = useSelector(state => state.cart || {});

  return (
    <>
      <Router>
        <GlobalStyles />
        <Routes>
          {/* main screens */}
          <Route path="/" element={<BaseLayout />}>
            <Route index element={<Home />} />
            <Route path="/product" element={<ProductList />} />
            <Route path="/product/details/:pid" element={<ProductDetails />} />
            <Route path="/cart" element={access_token ? cartCnt > 0 ? <Cart /> : <Navigate to="/empty_cart" /> : <Navigate to="/sign_in" />} />
            <Route path="/empty_cart" element={access_token ? <CartEmpty /> : <Navigate to="/sign_in" />} />
            <Route path="/checkout" element={access_token ? <Checkout /> : <Navigate to="/sign_in" />} />
            <Route path="/checkout/payment" element={access_token ? <ShippingPayment /> : <Navigate to="/sign_in" />} />
            <Route path="/order" element={access_token ? <Order /> : <Navigate to="/sign_in" />} />
            <Route path="/order_detail/:orderId" element={access_token ? <OrderDetail /> : <Navigate to="/sign_in" />} />
            <Route path="/wishlist" element={access_token ? wishlistCnt > 0 ? <WishList /> : <Navigate to="/empty_wishlist" /> : <Navigate to="/sign_in" />} />
            <Route path="/empty_wishlist" element={access_token ? <WishListEmpty /> : <Navigate to="/sign_in" />} />
            <Route path="/confirm" element={access_token ? <Confirm /> : <Navigate to="/sign_in" />} />
            <Route path="/account" element={access_token ? <Account /> : <Navigate to="/sign_in" />} />
            <Route path="/account/add" element={access_token ? <Address /> : <Navigate to="/sign_in" />} />
            <Route path="/account/address/edit/:addressId" element={access_token ? <Address /> : <Navigate to="/sign_in" />} />
            <Route path="/account/changepassword" element={access_token ? <ChangePasswordScreen /> : <Navigate to="/sign_in" />} />
          </Route>

          {/* auth screens */}
          <Route path="/" element={<AuthLayout />}>
            <Route path="sign_in" element={!access_token ? <SignIn /> : <Navigate to="/" />} />
            <Route path="sign_up" element={!access_token ? <SignUp /> : <Navigate to="/" />} />
            <Route path="reset" element={<Reset />} />
            <Route path="change_password" element={<ChangePassword />} />
            <Route path="check_mail" element={<CheckMail />} />
            <Route path="verification" element={<Verification />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
