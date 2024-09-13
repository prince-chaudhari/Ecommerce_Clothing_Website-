from django.urls import path, include
from .views import IndexView, ProductListView, CategoryListView, VendorListView, VendorDetailView, ProductDetailView, TagListView, SearchView, FilterProduct, AddToCart, CartView, DeleteCartItem, UpdateCartItem, CheckoutView, CustomerDashboardView, OrderDetailView, ProductPriceRangeAPIView, ColorListView, SizeListView

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

    # Add to cart
    path("add-to-cart/", AddToCart.as_view(), name='add-to-cart'),

    # Cart Page
    path("cart/", CartView.as_view(), name='cart-page'),

    # Delete Item from cart
    path("delete-cart-item/", DeleteCartItem.as_view(), name='delete-cart-item'),

    # Update Item from cart
    path("update-cart-item/", UpdateCartItem.as_view(), name='update-cart-item'),

    # Checkout Page
    path("checkout/", CheckoutView.as_view(), name='checkout-page'),

    # Customer Dashboard Page
    path("dashboard/", CustomerDashboardView.as_view(), name='dashboard-page'),

    # Order Detail Page
    path("dashboard/order/<int:id>", OrderDetailView.as_view(), name='order-detail-page'),


]