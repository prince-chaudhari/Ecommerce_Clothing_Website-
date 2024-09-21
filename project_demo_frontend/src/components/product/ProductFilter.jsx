import React, { useCallback, useEffect, useState } from "react";
import {
  ColorsFilter,
  FilterTitle,
  FilterWrap,
  PriceFilter,
  ProductCategoryFilter,
  SizesFilter,
  StyleFilter,
} from "../../styles/filter";
import { ProductFilterList, StyleFilterList } from "../../data/data";
import { staticImages } from "../../utils/images";
import { useGetCategoriesQuery } from "../../services/userCategoriesApi";
import { setCategory, setColors, setPrice, setSizes } from "../../features/productFilterSlice";
import { useDispatch, useSelector } from "react-redux";
import { useGetColorListQuery, useGetPriceRangeQuery, useGetSizeListQuery } from "../../services/userProductsApi";
import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import { debounce } from "lodash";

const ProductFilter = React.memo(() => {
  console.log("ProductFilter rendered");

  const [isProductFilterOpen, setProductFilterOpen] = useState(true);
  const [isPriceFilterOpen, setPriceFilterOpen] = useState(true);
  const [isColorFilterOpen, setColorFilterOpen] = useState(true);
  const [isSizeFilterOpen, setSizeFilterOpen] = useState(true);
  const [isStyleFilterOpen, setStyleFilterOpen] = useState(true);
  const [isMenCategoryOpen, setMenCategoryOpen] = useState(false);
  const [isWomenCategoryOpen, setWomenCategoryOpen] = useState(false);
  const [checkedCategories, setCheckedCategories] = useState([]);
  const [showAllMenCategories, setShowAllMenCategories] = useState(false);
  const [showAllWomenCategories, setShowAllWomenCategories] = useState(false);
  const dispatch = useDispatch();

  const filteredCategories = useSelector((state) => state.productFilter.category);
  const filteredPriceRange = useSelector((state) => state.productFilter.price);
  const filteredColorList = useSelector((state) => state.productFilter.colors);
  const filteredSizeList = useSelector((state) => state.productFilter.sizes);

  const { data: categories } = useGetCategoriesQuery();
  const { data: colors, isSuccess: isSuccessColorList } = useGetColorListQuery();
  const { data: sizes, isSuccess: isSuccessSizeList } = useGetSizeListQuery();
  console.log("sizes", sizes);
  console.log("filteredSizeList", filteredSizeList);


  const minPrice = filteredPriceRange?.min_price || 0;
  const maxPrice = filteredPriceRange?.max_price || 1000;

  // Local state to track the price range values
  const [value, setValue] = useState([minPrice, maxPrice]);

  // Debounced function to dispatch price changes after a delay
  const debouncedSetPrice = useCallback(
    debounce((min, max) => {
      dispatch(setPrice({ min_price: min, max_price: max }));
    }, 1000), // 1-second delay
    [dispatch]
  );

  // Sync local state with Redux store when filteredPriceRange changes
  useEffect(() => {
    if (value[0] !== minPrice || value[1] !== maxPrice) {
      setValue([minPrice, maxPrice]);
    }
  }, [minPrice, maxPrice]);


  // Handler for slider input change
  const handleSliderChange = (newValue) => {
    setValue(newValue);
    // Debounced call to update Redux state
    debouncedSetPrice(newValue[0], newValue[1]);
  };

  const toggleFilter = (filter) => {
    switch (filter) {
      case "product":
        setProductFilterOpen(!isProductFilterOpen);
        break;
      case "price":
        setPriceFilterOpen(!isPriceFilterOpen);
        break;
      case "color":
        setColorFilterOpen(!isColorFilterOpen);
        break;
      case "size":
        setSizeFilterOpen(!isSizeFilterOpen);
        break;
      case "style":
        setStyleFilterOpen(!isStyleFilterOpen);
        break;
      case "men":
        setMenCategoryOpen(!isMenCategoryOpen);
        break;
      case "women":
        setWomenCategoryOpen(!isWomenCategoryOpen);
        break;
      default:
        break;
    }
  };


  const handleCategoryChange = (categoryId) => {
    dispatch(setCategory(categoryId));
  };

  const handleColorChange = (colorName) => {
    dispatch(setColors(colorName));
  };

  const handleSizeChange = (sizeID) => {
    dispatch(setSizes(sizeID));
  };


  // Handler for manual input change
  const handleInputChange = (e) => {
    const inputName = e.target.name;
    const inputValue = parseInt(e.target.value);

    if (inputName === "min") {
      const newMin = inputValue;
      setValue([newMin, value[1]]);
      debouncedSetPrice(newMin, value[1]);
    } else if (inputName === "max") {
      const newMax = inputValue;
      setValue([value[0], newMax]);
      debouncedSetPrice(value[0], newMax);
    }
  };

  const toggleShowMoreMenCategories = () => {
    setShowAllMenCategories(!showAllMenCategories);
  };

  const toggleShowMoreWomenCategories = () => {
    setShowAllWomenCategories(!showAllWomenCategories);
  };

  const displayCategories = (categoryPrefix, showAllCategories) => {
    const filteredCategories = categories?.categories.filter((category) =>
      category.title.startsWith(categoryPrefix)
    );

    return showAllCategories ? filteredCategories : filteredCategories.slice(0, 4);
  };

  return (
    <>
      <ProductCategoryFilter>
        <FilterTitle
          className="filter-title flex items-center justify-between"
          onClick={() => toggleFilter("product")}
        >
          <p className="filter-title-text text-gray text-base font-semibold text-lg">Filter</p>
          <span className={`text-gray text-xxl filter-title-icon ${!isProductFilterOpen ? "rotate" : ""}`}>
            <i className="bi bi-filter"></i>
          </span>
        </FilterTitle>

        <FilterWrap className={`${!isProductFilterOpen ? "hide" : "show"}`}>
          {/* Men Category */}
          <div className="product-filter-item">
            <button
              type="button"
              className="filter-item-head w-full flex items-center justify-between"
              onClick={() => toggleFilter("men")}
            >
              <span className="filter-head-title text-base text-gray font-semibold">Men ({categories && categories.men_cnt})</span>
              <span className="filter-head-icon text-gray">
                <i className={`bi ${isMenCategoryOpen ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
              </span>
            </button>

            {(isMenCategoryOpen || filteredCategories.length > 0) && (
              <div className="subcategory-list pl-4">
                {displayCategories("Men", showAllMenCategories).map((category) => (
                  <label id={category.cid} className="subcategory-item flex items-center space-x-2" key={category.cid}>
                    <input type="checkbox" checked={filteredCategories.includes(category.cid)} onChange={() => handleCategoryChange(category.cid)} />
                    <span>{category.title.split("-")[1]} ({category.product_count})</span>
                  </label>
                ))}

                {categories && categories?.categories.filter((category) => category.title.startsWith("Men")).length > 4 && (
                  <button type="button" className="text-blue-500" onClick={toggleShowMoreMenCategories}>
                    {showAllMenCategories ? "Show Less" : "Show More"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Women Category */}
          <div className="product-filter-item">
            <button
              type="button"
              className="filter-item-head w-full flex items-center justify-between"
              onClick={() => toggleFilter("women")}
            >
              <span className="filter-head-title text-base text-gray font-semibold">Women ({categories && categories.women_cnt})</span>
              <span className="filter-head-icon text-gray">
                <i className={`bi ${isWomenCategoryOpen ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
              </span>
            </button>

            {(isWomenCategoryOpen || filteredCategories.length > 0) && (
              <div className="subcategory-list pl-4">
                {displayCategories("Women", showAllWomenCategories).map((category) => (
                  <label id={category.cid} className="subcategory-item flex items-center space-x-2" key={category.cid}>
                    <input type="checkbox" checked={filteredCategories.includes(category.cid)} onChange={() => handleCategoryChange(category.cid)} />
                    <span>{category.title.split("-")[1]} ({category.product_count})</span>
                  </label>
                ))}

                {categories && categories?.categories.filter((category) => category.title.startsWith("Women")).length > 4 && (
                  <button type="button" className="text-blue-500" onClick={toggleShowMoreWomenCategories}>
                    {showAllWomenCategories ? "Show Less" : "Show More"}
                  </button>
                )}
              </div>
            )}
          </div>
        </FilterWrap>
      </ProductCategoryFilter>

      <PriceFilter>
        <FilterTitle
          className="filter-title flex items-center justify-between"
          onClick={() => setPriceFilterOpen(!isPriceFilterOpen)}
        >
          <p className="filter-title-text text-gray text-base font-semibold text-lg">Price (₹)</p>
          <span className={`text-gray text-xl filter-title-icon ${!isPriceFilterOpen ? "rotate" : ""}`}>
            <i className="bi bi-chevron-up"></i>
          </span>
        </FilterTitle>

        <FilterWrap className={`range filter-wrap ${!isPriceFilterOpen ? "hide" : "show"}`}>

          <div className="range-price w-full flex items-center">
            <input
              type="number"
              className="text-center"
              name="min"
              value={value[0]}
              onChange={handleInputChange}
              min={minPrice}
              max={maxPrice}
            />
            <input
              type="number"
              className="text-center"
              name="max"
              value={value[1]}
              onChange={handleInputChange}
              min={minPrice}
              max={maxPrice}
            />
          </div>
        </FilterWrap>
      </PriceFilter>


      <ColorsFilter>
        <FilterTitle
          className="flex items-center justify-between"
          onClick={() => toggleFilter("color")}
        >
          <p className="filter-title-text text-gray text-base font-semibold text-lg">
            Colors
          </p>
          <span
            className={`text-gray text-xl filter-title-icon ${!isColorFilterOpen ? "rotate" : ""}`}
          >
            <i className="bi bi-chevron-up"></i>
          </span>
        </FilterTitle>
        <FilterWrap className={`${!isColorFilterOpen ? "hide" : "show"}`}>
          <div className="colors-list grid">
            {colors && colors.map((color) => (
              <div
                key={color.id}
                id={color.id}
                className="colors-item text-center flex flex-col justify-center items-center"
              >
                <input type="checkbox" id={`color-${color.id}`} onChange={() => handleColorChange(color.name)} />
                <label htmlFor={`color-${color.id}`} className="color-swatch">
                  {filteredColorList.includes(color.name) ?
                    <div
                      style={{
                        backgroundColor: color.code,
                        width: '30px', // Set a width
                        height: '30px', // Set a height
                        borderRadius: '30%', // Optional: for a circular swatch
                        border: '3px solid black', // Border for visible box
                        boxShadow: '0 0 17px rgba(0, 0, 0, 0.7)', // Optional: adds a shadow to indicate selection

                      }}
                    ></div>
                    :
                    <div
                      style={{
                        backgroundColor: color.code,
                        width: '30px', // Set a width
                        height: '30px', // Set a height
                        borderRadius: '30%', // Optional: for a circular swatch
                        border: '1px solid gray', // Border to make the box visible but less prominent
                      }}
                    ></div>
                  }
                </label>
              </div>
            ))}
          </div>
        </FilterWrap>
      </ColorsFilter>

      <SizesFilter>
        <FilterTitle
          className="flex items-center justify-between"
          onClick={() => toggleFilter("size")}
        >
          <p className="filter-title-text text-gray text-base font-semibold text-lg">
            Size
          </p>
          <span
            className={`text-gray text-xl filter-title-icon ${!isSizeFilterOpen ? "rotate" : ""}`}
          >
            <i className="bi bi-chevron-up"></i>
          </span>
        </FilterTitle>
        <FilterWrap className={`${!isSizeFilterOpen ? "hide" : "show"}`}>
          <div className="sizes-list grid text-center justify-center">
            {sizes && sizes.map((size) => (
              <div
                key={size.id}
                className={`sizes-item text-sm font-semibold text-outerspace w-full ${filteredSizeList.includes(size.id) ? 'bg-gray-300' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={filteredSizeList.includes(size.id)}
                  onChange={() => handleSizeChange(size.id)}
                />
                <span className="flex items-center justify-center uppercase">
                  {size.name}
                </span>
              </div>
            ))}
          </div>
        </FilterWrap>
      </SizesFilter>

      <StyleFilter onClick={() => toggleFilter("style")}>
        <FilterTitle className="flex items-center justify-between">
          <p className="filter-title-text text-gray text-base font-semibold text-lg">
            Dress Style
          </p>
          <span
            className={`text-gray text-xl filter-title-icon ${!isStyleFilterOpen ? "rotate" : ""
              }`}
          >
            <i className="bi bi-chevron-up"></i>
          </span>
        </FilterTitle>
        <FilterWrap className={`${!isStyleFilterOpen ? "hide" : "show"}`}>
          {StyleFilterList?.map((styleFilter) => {
            return (
              <div className="style-filter-item" key={styleFilter.id}>
                <button
                  type="button"
                  className="filter-item-head w-full flex items-center justify-between"
                >
                  <span className="filter-head-title text-base text-gray font-semibold">
                    {styleFilter.title}
                  </span>
                  <span className="filter-head-icon text-gray">
                    <i className="bi bi-chevron-right"></i>
                  </span>
                </button>
              </div>
            );
          })}
        </FilterWrap>
      </StyleFilter>
    </>
  );
});

export default ProductFilter;
