import { useState } from "react";
import styled from "styled-components";
import Title from "../common/Title";
import { ContentStylings } from "../../styles/styles";
import { breakpoints, defaultTheme } from "../../styles/themes/default";
import ProductDescriptionMedia from "./ProductDescriptionMedia";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import { useAddUserAddressMutation } from "../../services/userAddressApi";
import { useParams } from "react-router-dom";
import { getToken } from "../../services/LocalStorageService";
import { useDispatch, useSelector } from "react-redux";
import { addUserAddress } from "../../features/addressSlice";
import { addReview } from "../../features/reviewSlice";
import CustomAlert from "../../screens/product/WarningAlert";
import { useGetProductQuery } from "../../services/userProductsApi";
import { useAddUserReviewMutation, useDeleteUserReviewMutation } from "../../services/userReviewApi";
const DetailsContent = styled.div`
  margin-top: 60px;
  @media (max-width: ${breakpoints.lg}) {
    margin-top: 40px;
  }

  .details-content-wrapper {
    grid-template-columns: auto 500px;
    gap: 40px;

    @media (max-width: ${breakpoints.xl}) {
      grid-template-columns: auto 400px;
    }

    @media (max-width: ${breakpoints.lg}) {
      grid-template-columns: 100%;
      gap: 24px;
    }
  }
`;


const DescriptionTabsWrapper = styled.div`
  .tabs-heads {
    column-gap: 20px;
    row-gap: 16px;
    margin-bottom: 24px;

    @media (max-width: ${breakpoints.sm}) {
      flex-wrap: wrap;
      margin-bottom: 16px;
    }

    @media (max-width: ${breakpoints.xs}) {
      gap: 12px;
    }
  }

  .tabs-head {
    padding-bottom: 16px;
    position: relative;

    &-active {
      color: ${defaultTheme.color_outerspace};

      &::after {
        content: "";
        position: absolute;
        left: 0;
        top: 100%;
        width: 40px;
        height: 1px;
        background-color: ${defaultTheme.color_outerspace};
      }
    }

    @media (max-width: ${breakpoints.sm}) {
      padding-bottom: 12px;
    }
  }

  .tabs-badge {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    font-size: 10px;
    margin-left: 6px;

    &-purple {
      background-color: ${defaultTheme.color_purple};
    }

    &-outerspace {
      background-color: ${defaultTheme.color_outerspace};
    }
  }

  .tabs-contents {
    max-height: 400px;
    overflow-y: scroll;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
      border-radius: 12px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: ${defaultTheme.color_platinum};
      border-radius: 12px;
    }
  }

  .tabs-content {
    display: none;
    padding: 20px;
    background-color: rgba(0, 0, 0, 0.02);

    &.show {
      display: block;
    }

    @media (max-width: ${breakpoints.sm}) {
      padding: 12px;
    }
  }
`;

const ReviewFormWrapper = styled.div`
  form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 20px;

    label {
      font-weight: bold;
    }

    textarea {
      padding: 10px;
      font-size: 1rem;
      border-radius: 6px;
      border: 1px solid #ccc;
      width: 100%;
    }

    .stars {
      display: flex;
      gap: 5px;
      font-size: 2rem;
    }

    button {
      padding: 10px 20px;
      background-color: green;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.3s ease;

      &:hover {
        background-color: darkgreen;
      }
    }
  }
`;

const ReviewsSection = styled.div`
  margin-bottom: 30px;

  h4 {
    margin-bottom: 10px;
  }

  .review-item {
    margin-bottom: 20px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 8px;
  }

  .review-stars {
    display: flex;
    gap: 5px;
    color: green;
    font-size: 1.5rem; /* Adjust the size for consistency */
  }
`;



const ProductDescriptionTab = ({ description, reviews }) => {

  const [userAddReview, { isLoading: isLoadingUserAddReview }] = useAddUserReviewMutation();
  const [userDeleteReview, { isLoading: isLoadingUserDeleteReview }] = useDeleteUserReviewMutation();
  const { pid } = useParams();
  const dispatch = useDispatch();
  const { access_token } = getToken();
  const [server_error, setServerError] = useState({});
  const [server_msg, setServerMsg] = useState({});
  const [successAlertOpen, setSuccessAlertOpen] = useState(false);
  const { refetch } = useGetProductQuery({ pid });
  const { id } = useSelector(state => state.user)
  const productDescriptionTabHeads = [
    {
      id: "tab-description",
      tabHead: "tabDescription",
      tabText: "Description",
      badgeValue: null,
      badgeColor: "",
    },
    {
      id: "tab-comments",
      tabHead: "tabComments",
      tabText: "User Comments",
      badgeValue: `${reviews.length}`,
      badgeColor: "purple",
    },
  ];
  const [activeDesTab, setActiveDesTab] = useState(
    productDescriptionTabHeads[0].tabHead
  );
  const [reviewData, setReviewData] = useState({
    review: "",
    rating: 0,
  });
  const [hoverRating, setHoverRating] = useState(0);



  const handleTabChange = (tabHead) => {
    setActiveDesTab(tabHead);
  };

  const handleInputChange = (e) => {
    setReviewData({ ...reviewData, [e.target.name]: e.target.value });
  };

  const handleStarClick = (rating) => {
    setReviewData({ ...reviewData, rating });
  };

  const handleStarHover = (rating) => {
    setHoverRating(rating);
  };

  const handleDeleteReview = async (reviewId, event) => {
    event.preventDefault();

    try {
      await userDeleteReview({ product_id: pid, review_id: reviewId, access_token }).unwrap();
      refetch()
    } catch (error) {
      console.error('Failed to remove from wishlist: ', error);
    }
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault();


    const data = new FormData(e.currentTarget);

    data.append('review', reviewData.review);
    data.append('rating', reviewData.rating);

    const res = await userAddReview({ product_id: pid, actualData: data, access_token });

    if (res.error) {
      setServerMsg({});
      setServerError(res.error.data.errors);
      console.log(res.error.data.errors);

    }

    if (res.data) {
      setServerError({});
      setServerMsg(res.data);
      refetch()
      setSuccessAlertOpen(true);
      setReviewData({
        review: "",
        rating: 0,
      })
    }

  };

  const handleClose = () => {
    setSuccessAlertOpen(false);
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    return (
      <>
        {Array(fullStars)
          .fill(0)
          .map((_, i) => (
            <FaStar key={i} />
          ))}
        {halfStar && <FaStarHalfAlt />}
      </>
    );
  };


  return (
    <DetailsContent>
      <Title titleText={"Product Description"} />
      <div className="details-content-wrapper grid">
        <DescriptionTabsWrapper>
          <div className="tabs-heads flex items-center flex-wrap">
            {productDescriptionTabHeads.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`tabs-head text-gray font-medium text-lg flex items-center ${tab.tabHead === activeDesTab ? "tabs-head-active" : ""}`}
                onClick={() => handleTabChange(tab.tabHead)}
              >
                <span className={tab.tabHead === activeDesTab ? "text-sea-green" : ""}>
                  {tab.tabText}
                </span>
                {tab.badgeValue && (
                  <span
                    className={`tabs-badge inline-flex items-center justify-center text-white tabs-badge-${tab.badgeColor}`}
                  >
                    {tab.badgeValue}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="tabs-contents">
            <div
              className={`tabs-content ${activeDesTab === "tabDescription" ? "show" : ""}`}
            >
              <ContentStylings>{description}</ContentStylings>
            </div>

            <div
              className={`tabs-content ${activeDesTab === "tabComments" ? "show" : ""}`}
            >
              <ReviewsSection>
                {reviews.length === 0 ?

                  <h4>No User Reviews</h4>
                  :
                  <>
                    <h4>User Reviews</h4>
                    {reviews.map((review) => (
                      <div className="review-item" key={review.id}>
                        {id === review.user.id ?
                          <div><strong>{review.user.username} </strong>(You) {review.created_at_formatted}</div>
                          :
                          <div><strong>{review.user.username}</strong> {review.created_at_formatted} ago</div>
                        }
                        <div>{review.review}</div>
                        <div className="review-stars">
                          {renderStars(review.rating)}
                        </div>
                        {id === review.user.id &&
                          <button
                            className="text-base text-white font-semibold bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none"

                            style={{
                              backgroundColor: '#10b9b0', color: '#10b9b0', border: 'none',
                              padding: '10px 20px',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              // marginBottom: '14px',
                              marginTop: '7px',
                              textTransform: 'uppercase',
                              transition: 'background-color 0.3s'
                            }}
                            onClick={(event) => handleDeleteReview(review.id, event)}
                          >
                            Remove
                          </button>
                        }
                      </div>
                    ))}
                  </>

                }
              </ReviewsSection>

              <ReviewFormWrapper>
                <form onSubmit={handleReviewSubmit}>
                  <label htmlFor="review">Review</label>
                  <textarea
                    id="review"
                    name="review"
                    value={reviewData.review}
                    onChange={handleInputChange}
                    required
                  />

                  <label htmlFor="rating">Rating</label>
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => handleStarHover(star)}
                        onMouseLeave={() => handleStarHover(0)}
                        style={{ cursor: "pointer", color: hoverRating >= star || reviewData.rating >= star ? "gold" : "gray" }}
                      >
                        <FaStar />
                      </span>
                    ))}
                  </div>

                  <button type="submit">Submit Review</button>
                </form>
              </ReviewFormWrapper>
            </div>
          </div>
        </DescriptionTabsWrapper>

        <ProductDescriptionMedia />
      </div>
      <CustomAlert
        open={successAlertOpen}
        handleClose={handleClose}
        message="Review added successfully!"
        severity="success"
      />
    </DetailsContent>

  );
};

export default ProductDescriptionTab;
