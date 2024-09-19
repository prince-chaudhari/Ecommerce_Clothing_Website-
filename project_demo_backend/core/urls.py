from django.urls import path, include
from .views import IndexView, ProductListView, CategoryListView, VendorListView, VendorDetailView, ProductDetailView, TagListView, SearchView, FilterProduct, ProductPriceRangeAPIView, ColorListView, SizeListView, AddToCartView, CartListView, CartRetrieveUpdateDestroyAPIView, WishlistCreateView, WishlistDeleteView, WishlistListView, AddressCreateView, AddressListView, DeleteAddressView, UpdateAddressView, ProductReviewDetailView, ProductReviewListCreateView, ClearCartAPIView, OrderListView, CreateOrderView, RetrieveOrderView, ApplyCouponAPIView, CheckCouponAPIView

urlpatterns = [
    # HomePage
    path("", IndexView.as_view(), name='index'),
    path("product/", ProductListView.as_view(), name='product-list'),
    path("product/<uuid:pid>/", ProductDetailView.as_view(), name='product-detail'),
    path("product/price-range/", ProductPriceRangeAPIView.as_view(), name='product-price-range'),

    # Category
    path("category/", CategoryListView.as_view(), name='category-list'),
    path("category/<uuid:cid>/", CategoryListView.as_view(), name='category-products-list'),

    # Colors
    path("colors/", ColorListView.as_view(), name='color-list'),

    # Sizes
    path("sizes/", SizeListView.as_view(), name='size-list'),

    # Vendor
    path("vendor/", VendorListView.as_view(), name='vendor-list'),
    path("vendor/<uuid:vid>", VendorDetailView.as_view(), name='vendor-detail'),

    # Tags
    path("product/tag/<slug:tag_slug>/", TagListView.as_view(), name='tags'),

    # Search
    path("search/", SearchView.as_view(), name='search'),

    # Filter product
    path("product/filter/", FilterProduct.as_view(), name='filter-products'),

    # View cart
    path("cart/", CartListView.as_view(), name='cart-page'),
    # Add to cart
    path("cart/add/", AddToCartView.as_view(), name='add-to-cart'),
    # Update Item from cart
    path("cart/update/", CartRetrieveUpdateDestroyAPIView.as_view(), name='update-cart-item'),
    # Delete Item from cart
    path("cart/delete/", CartRetrieveUpdateDestroyAPIView.as_view(), name='delete-cart-item'),
    path("cart/clear/", ClearCartAPIView.as_view(), name='clear-cart-items'),


    # View Wishlist
    path("wishlist/", WishlistListView.as_view(), name='wishlist-page'),
    # Add Item to Wishlist
    path("wishlist/add/", WishlistCreateView.as_view(), name='add-to-wishlist'),
    # Delete Item from Wishlist
    path("wishlist/delete/", WishlistDeleteView.as_view(), name='delete-wishlist-item'),

    path('address/create/', AddressCreateView.as_view(), name='address-create'),
    path('address/remove/<uuid:address_id>/', DeleteAddressView.as_view(), name='address-remove'),
    path('address/update/<uuid:address_id>/', UpdateAddressView.as_view(), name='address-update'),
    path('address/', AddressListView.as_view(), name='address-list'),

    path('<uuid:product_id>/reviews/', ProductReviewListCreateView.as_view(), name='product-review-list-create'),
    path('<uuid:product_id>/reviews/<int:review_id>/', ProductReviewDetailView.as_view(), name='product-review-detail'),

    path('orders/', OrderListView.as_view(), name='order-list'),
    path('orders/create/', CreateOrderView.as_view(), name='create-order'),
    path('orders/<uuid:order_id>/', RetrieveOrderView.as_view(), name='retrieve_order'),

    path('apply-coupon/', ApplyCouponAPIView.as_view(), name='apply_coupon_api'),
    path('check-coupon/', CheckCouponAPIView.as_view(), name='check_coupon_api'),

]