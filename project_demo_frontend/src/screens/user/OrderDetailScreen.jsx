import styled from "styled-components";
import { Container } from "../../styles/styles";
import Breadcrumb from "../../components/common/Breadcrumb";
import { UserContent, UserDashboardWrapper } from "../../styles/user";
import UserMenu from "../../components/user/UserMenu";
import { Link, useParams } from "react-router-dom";
import Title from "../../components/common/Title";
import { orderData } from "../../data/data";
import { currencyFormat } from "../../utils/helper";
import { breakpoints, defaultTheme } from "../../styles/themes/default";
import { useGetOrderProductQuery } from "../../services/userOrderApi";
import { getToken } from "../../services/LocalStorageService";

const OrderDetailScreenWrapper = styled.main`
  .btn-and-title-wrapper {
    margin-bottom: 24px;
    .title {
      margin-bottom: 0;
    }

    .btn-go-back {
      margin-right: 12px;
      transition: ${defaultTheme.default_transition};

      &:hover {
        margin-right: 16px;
      }
    }
  }

  .order-d-top {
    background-color: ${defaultTheme.color_whitesmoke};
    padding: 26px 32px;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.05);

    @media (max-width: ${breakpoints.sm}) {
      flex-direction: column;
      row-gap: 12px;
    }
  }
`;

const OrderDetailStatusWrapper = styled.div`
  margin: 0 36px;
  @media (max-width: ${breakpoints.sm}) {
    margin: 0 10px;
    overflow-x: scroll;
  }

  .order-status {
    height: 4px;
    margin: 50px 0;
    max-width: 580px;
    width: 340px;
    margin-left: auto;
    margin-right: auto;
    position: relative;
    margin-bottom: 70px;

    @media (max-width: ${breakpoints.sm}) {
      margin-right: 40px;
      margin-left: 40px;
    }

    &-dot {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background-color: ${defaultTheme.color_silver}; /* Default color */

      &:nth-child(1) {
        left: 0;
      }

      &:nth-child(2) {
        left: calc(33.3333% - 10px);
      }

      &:nth-child(3) {
        left: calc(66.6666% - 10px);
      }

      &:nth-child(4) {
        right: 0;
      }

      &.status-active {
        background-color: ${defaultTheme.color_black}; /* Active status color */
      }
    }

    &-text {
      position: absolute;
      top: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
    }
  }
`;


const OrderDetailMessageWrapper = styled.div`
  background-color: ${defaultTheme.color_whitesmoke};
  max-width: 748px;
  margin-right: auto;
  margin-left: auto;
  min-height: 68px;
  padding: 16px 24px;
  border-radius: 8px;
  position: relative;
  margin-top: 80px;

  &::after {
    content: "";
    position: absolute;
    top: -34px;
    left: 20%;
    border-bottom: 22px solid ${defaultTheme.color_whitesmoke};
    border-top: 18px solid transparent;
    border-left: 18px solid transparent;
    border-right: 18px solid transparent;
  }

  @media (max-width: ${breakpoints.sm}) {
    margin-top: 10px;
  }
`;

const OrderDetailListWrapper = styled.div`
  padding: 24px;
  margin-top: 40px;
  border: 1px solid rgba(0, 0, 0, 0.05);

  @media (max-width: ${defaultTheme.md}) {
    padding: 18px;
  }

  @media (max-width: ${defaultTheme.md}) {
    padding: 12px;
  }

  .order-d-item {
    grid-template-columns: 80px 1fr 1fr 32px;
    gap: 20px;
    padding: 12px 0;
    border-bottom: 1px solid ${defaultTheme.color_whitesmoke};
    position: relative;

    @media (max-width: ${defaultTheme.xl}) {
      grid-template-columns: 80px 3fr 2fr 32px;
      padding: 16px 0;
      gap: 16px;
    }

    @media (max-width: ${defaultTheme.sm}) {
      grid-template-columns: 50px 3fr 2fr;
      gap: 16px;
    }

    @media (max-width: ${defaultTheme.xs}) {
      grid-template-columns: 100%;
      gap: 12px;
    }

    &:first-child {
      padding-top: 0;
    }

    &:last-child {
      padding-bottom: 0;
      border-bottom: 0;
    }

    &-img {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;

      @media (max-width: ${breakpoints.sm}) {
        width: 50px;
        height: 50px;
      }

      @media (max-width: ${breakpoints.sm}) {
        width: 100%;
        height: 100%;
      }
    }

    &-calc {
      p {
        display: inline-block;
        margin-right: 50px;

        @media (max-width: ${defaultTheme.lg}) {
          margin-right: 20px;
        }
      }
    }

    &-btn {
      margin-bottom: auto;
      &:hover {
        color: ${defaultTheme.color_sea_green};
      }

      @media (max-width: ${breakpoints.sm}) {
        position: absolute;
        right: 0;
        top: 10px;
      }

      @media (max-width: ${defaultTheme.xs}) {
        width: 28px;
        height: 28px;
        z-index: 5;
        background-color: ${defaultTheme.color_white};
        border-radius: 50%;
        right: 8px;
        top: 24px;
      }
    }
  }
`;

const breadcrumbItems = [
  { label: "Home", link: "/" },
  { label: "Order", link: "/order" },
  { label: "Order Details", link: "/order_detail" },
];

const OrderDetailScreen = () => {
  const { orderId } = useParams();
  const { access_token } = getToken()

  const { data, isSuccess, isLoading, isError } = useGetOrderProductQuery({ order_id: orderId, access_token });
  console.log(data);

  if (isLoading) {
    return <div>Loading...</div>; // or a spinner/loading component
  }

  if (isError) {
    return <div>Error loading product details.</div>;
  }

  const statusMapping = {
    'pending': 2,
    'shipped': 3,
    'delivered': 4,
    'cancelled': 0,  // You can decide how to handle cancelled orders
  };
  
  const currentStatus = statusMapping[data.order_status]; // orderStatus comes from your backend
  console.log(data.order_status);
  

  return (
    <OrderDetailScreenWrapper className="page-py-spacing">
      <Container>
        <Breadcrumb items={breadcrumbItems} />
        <UserDashboardWrapper>
          <UserMenu />
          <UserContent>
            <div className="flex items-center justify-start btn-and-title-wrapper">
              <Link
                to="/order"
                className="btn-go-back inline-flex items-center justify-center text-xxl"
              >
                <i className="bi bi-chevron-left"></i>
              </Link>
              <Title titleText={"Order Details"} />
            </div>

            <div className="order-d-wrapper">
              <div className="order-d-top flex justify-between items-start">
                <div className="order-d-top-l">
                  <h4 className="text-3xl order-d-no">
                    Order no: #{data.order_id}
                  </h4>
                  <p className="text-lg font-medium text-gray">
                    Placed On {data.order_date_formatted}
                  </p>
                </div>
                <div className="order-d-top-r text-xxl text-gray font-semibold">
                  Total: <span className="text-outerspace">₹{data.total_price}</span>
                </div>
              </div>

              <OrderDetailStatusWrapper className="order-d-status" status={currentStatus}>
                <div className="order-status bg-silver">
                  <div className={`order-status-dot status-active`}>
                    <span className="order-status-text font-semibold text-center no-wrap">
                      Order Placed
                    </span>
                  </div>
                  <div className={`order-status-dot ${currentStatus >= 2 ? 'status-active' : ''}`}>
                    <span className="order-status-text font-semibold text-center no-wrap">
                      In Progress
                    </span>
                  </div>
                  <div className={`order-status-dot ${currentStatus >= 3 ? 'status-active' : ''}`}>
                    <span className="order-status-text font-semibold text-center no-wrap">
                      Shipped
                    </span>
                  </div>
                  <div className={`order-status-dot ${currentStatus >= 4 ? 'status-active' : ''}`}>
                    <span className="order-status-text font-semibold text-center no-wrap">
                      Delivered
                    </span>
                  </div>
                </div>
              </OrderDetailStatusWrapper>

              <OrderDetailMessageWrapper className="order-message flex items-center justify-start">
                <p className="font-semibold text-gray">
                  8 June 2023 3:40 PM &nbsp;
                  <span className="text-outerspace">
                    Your order has been successfully verified.
                  </span>
                </p>
              </OrderDetailMessageWrapper>

              <OrderDetailListWrapper className="order-d-list">
                {data.order_items.map((item) => {
                  return (
                    <div className="order-d-item grid" key={item.product.pid}>
                      <div className="order-d-item-img">
                        <img
                          src={item.product.product_image}
                          alt=""
                          className="object-fit-cover"
                        />
                      </div>
                      <div className="order-d-item-info">
                        <p className="text-xl font-bold">{item.product.title}</p>
                        <p className="text-md font-bold">
                          Color: &nbsp;
                          <span className="font-medium text-gray">
                            {item.product.color}
                          </span>
                        </p>
                        <p className="text-md font-bold">
                          Size: &nbsp;
                          <span className="font-medium text-gray">
                            {item.size}
                          </span>
                        </p>
                      </div>
                      <div className="order-d-item-calc">
                        <p className="font-bold text-lg">
                          Qty: &nbsp;
                          <span className="text-gray">{item.quantity}</span>
                        </p>
                        <p className="font-bold text-lg">
                          Price: &nbsp;
                          <span className="text-gray">
                            {item.product.price}
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </OrderDetailListWrapper>
            </div>
          </UserContent>
        </UserDashboardWrapper>
      </Container>
    </OrderDetailScreenWrapper>
  );
};

export default OrderDetailScreen;
