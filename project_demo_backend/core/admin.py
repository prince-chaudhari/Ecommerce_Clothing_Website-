from django.contrib import admin
from .models import Product, Category, ProductImages, ProductReview, Wishlist, Address, Color, Size, Cart, Order, OrderItem, Coupon

class ProductImagesAdmin(admin.TabularInline):
    model = ProductImages

class ProductAdmin(admin.ModelAdmin):
    inlines = [ProductImagesAdmin]
    list_display = ['title', 'product_image', 'price', 'category', 'featured']

class CategoryAdmin(admin.ModelAdmin):
    list_display = ['title', 'category_image']

class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'review', 'rating']

class WishlistAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'date']

class AddressAdmin(admin.ModelAdmin):
    list_display = ['user', 'city', 'status']

class CartAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'quantity', 'added_on']

# Inline admin for OrderItem to show within OrderAdmin
class OrderItemAdmin(admin.TabularInline):
    model = OrderItem
    extra = 1  # Number of empty order item forms
    readonly_fields = ['price_at_purchase', 'item_total']

# Admin for Order
class OrderAdmin(admin.ModelAdmin):
    inlines = [OrderItemAdmin]
    list_display = ['user', 'order_id', 'total_price', 'payment_method', 'order_status', 'order_date']
    list_filter = ['order_status', 'payment_method', 'order_date']
    search_fields = ['order_id', 'user__username']
    readonly_fields = ['order_id', 'order_date', 'updated']  # Prevent modification of auto-generated fields

admin.site.register(Product, ProductAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(ProductReview, ProductReviewAdmin)
admin.site.register(Wishlist, WishlistAdmin)
admin.site.register(Address, AddressAdmin)
admin.site.register(Cart, CartAdmin)
admin.site.register(Color)
admin.site.register(Size)
admin.site.register(Order, OrderAdmin)  # Registering the Order model
admin.site.register(Coupon)  # Registering the Order model

