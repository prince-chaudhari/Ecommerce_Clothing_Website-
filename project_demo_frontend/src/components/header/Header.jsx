import styled from "styled-components";
import { HeaderMainWrapper, SiteBrandWrapper } from "../../styles/header";
import { Container } from "../../styles/styles";
import { staticImages } from "../../utils/images";
import { navMenuData } from "../../data/data";
import { Link, useLocation } from "react-router-dom";
import { Input, InputGroupWrapper } from "../../styles/form";
import { breakpoints, defaultTheme } from "../../styles/themes/default";
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebar } from "../../features/sidebarSlice";
import { BiSearch, BiMenu } from 'react-icons/bi'; // Import BiMenu
import { getToken } from "../../services/LocalStorageService";
import { BaseLinkGreen, BaseLinkOutlineDark } from "../../styles/button";

const ButtonGroupWrapper = styled.div`
  gap: 8px;
  @media (max-width: ${breakpoints.sm}) {
    button,
    a {
      min-width: 100px;
    }
  }
`;

const NavigationAndSearchWrapper = styled.div`
  column-gap: 20px;
  .search-form {
    @media (max-width: ${breakpoints.lg}) {
      width: 100%;
      max-width: 800px; // Further increased max-width
    }
    @media (max-width: ${breakpoints.sm}) {
      display: none;
    }
  }

  .input-group {
    min-width: 600px; // Further increased min-width

    .input-control {
      @media (max-width: ${breakpoints.sm}) {
        display: none;
      }
    }

    @media (max-width: ${breakpoints.xl}) {
      min-width: 400px; // Further increased min-width
    }

    @media (max-width: ${breakpoints.sm}) {
      min-width: auto;
      grid-template-columns: 100%;
    }
  }

  @media (max-width: ${breakpoints.lg}) {
    width: 100%;
    justify-content: flex-end;
  }
`;



const NavigationMenuWrapper = styled.nav`
  .nav-menu-list {
    margin-left: 20px;

    @media (max-width: ${breakpoints.lg}) {
      flex-direction: column;
    }
  }

  .nav-menu-item {
    margin-right: 20px;
    margin-left: 20px;

    @media (max-width: ${breakpoints.xl}) {
      margin-left: 16px;
      margin-right: 16px;
    }
  }

  .nav-menu-link {
    &.active {
      color: ${defaultTheme.color_outerspace};
      font-weight: 700;
    }

    &:hover {
      color: ${defaultTheme.color_outerspace};
    }
  }

  @media (max-width: ${breakpoints.lg}) {
    position: absolute;
    top: 0;
    right: 0;
    width: 260px;
    background: ${defaultTheme.color_white};
    height: 100%;
    z-index: 999;
    display: none;
  }
`;

const IconLinksWrapper = styled.div`
  column-gap: 18px;
  .icon-link {
    width: 36px;
    height: 36px;
    border-radius: 6px;

    &.active {
      background-color: ${defaultTheme.color_sea_green};
      img {
        filter: brightness(100);
      }
    }

    &:hover {
      background-color: ${defaultTheme.color_whitesmoke};
    }
  }

  @media (max-width: ${breakpoints.xl}) {
    column-gap: 8px;
  }

  @media (max-width: ${breakpoints.xl}) {
    column-gap: 6px;
  }
`;

const Header = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  const { cartCnt } = useSelector(state => state.cart)
  const { wishlistCnt } = useSelector(state => state.wishlist)
  const { access_token } = getToken()


  return (
    <HeaderMainWrapper className="header flex items-center">
      <Container className="container">
        <div className="header-wrap flex items-center justify-between">
          <div className="flex items-center">
            <button
              type="button"
              className="sidebar-toggler"
              onClick={() => dispatch(toggleSidebar())}
            >
              <BiMenu size={27} /> {/* Replaced with BiMenu icon */}
            </button>
            <SiteBrandWrapper to="/" className="inline-flex">
              <div className="brand-img-wrap flex items-center justify-center">
                <img
                  className="site-brand-img"
                  src={staticImages.logo}
                  alt="site logo"
                />
              </div>
              <span className="site-brand-text text-outerspace">GreenCart</span>
            </SiteBrandWrapper>
          </div>
          <NavigationAndSearchWrapper className="flex items-center">
            <NavigationMenuWrapper>
              <ul className="nav-menu-list flex items-center">
                {navMenuData?.map((menu) => {
                  return (
                    <li className="nav-menu-item" key={menu.id}>
                      <Link
                        to={menu.menuLink}
                        className="nav-menu-link text-base font-medium text-gray"
                      >
                        {menu.menuText}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </NavigationMenuWrapper>
            <form className="search-form">
              <InputGroupWrapper className="input-group">
                <span className="input-icon flex items-center justify-center text-xl text-gray">
                  <BiSearch />
                </span>
                <Input
                  type="text"
                  className="input-control w-full"
                  placeholder="Search"
                />
              </InputGroupWrapper>
            </form>
          </NavigationAndSearchWrapper>

          {
            access_token ?
              <IconLinksWrapper className="flex items-center">
                <Link
                  to="/wishlist"
                  className={`icon-link ${location.pathname === "/wishlist" ? "active" : ""
                    } inline-flex items-center justify-center`}
                >
                  {wishlistCnt > 0 &&
                    <span>{wishlistCnt}</span>
                  }
                  <img src={staticImages.heart} alt="Wishlist" />
                </Link>
                <Link
                  to="/account"
                  className={`icon-link ${location.pathname === "/account" ||
                    location.pathname === "/account/add"
                    ? "active"
                    : ""
                    } inline-flex items-center justify-center`}
                >
                  <img src={staticImages.user} alt="" />
                </Link>
                <Link
                  to="/cart"
                  className={`icon-link ${location.pathname === "/cart" ? "active" : ""}`}
                >
                  {cartCnt > 0 &&
                    <span>{cartCnt}</span>
                  }
                  <img src={staticImages.cart} alt="Cart" />
                </Link>

              </IconLinksWrapper>
              :
              <ButtonGroupWrapper className="flex items-center">
                <BaseLinkGreen to="/sign_in">Login</BaseLinkGreen>
                <BaseLinkOutlineDark to="/sign_up">Sign up</BaseLinkOutlineDark>
              </ButtonGroupWrapper>
          }
        </div>
      </Container>
    </HeaderMainWrapper>
  );
};

export default Header;
