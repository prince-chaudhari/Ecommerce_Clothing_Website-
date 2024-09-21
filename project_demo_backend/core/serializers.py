from rest_framework import serializers
from .models import Product, Category, ProductReview, ProductImages, Color, Size, Cart, Wishlist, Address, Order, OrderItem, Coupon
from account.serializers import UserProfileSerializer

class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True)  # Include product_count in the serializer

    class Meta:
        model = Category
        fields = ['cid', 'title', 'product_count']  # Ensure 'product_count' is included in fields

class SimplifiedProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['pid', 'title']  # Only include necessary fields

class ColorSerializer(serializers.ModelSerializer):
    products = serializers.SerializerMethodField()  # Use SerializerMethodField to customize the product list

    class Meta:
        model = Color
        fields = ['id', 'name', 'code', 'products']

    def get_products(self, obj):
        # Filter products that have the current color (obj) in their colors field
        print(obj)
        products_with_color = obj.products.filter(color=obj.name)
        return SimplifiedProductSerializer(products_with_color, many=True).data

class SizeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Size
        fields = ['id', 'name']

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    colors = ColorSerializer(read_only=True, many=True)  # Can use full serializer for colors
    sizes = SizeSerializer(read_only=True, many=True)  # Can use full serializer for colors

    class Meta:
        model = Product
        fields = ['pid', 'category', 'title', 'product_image', 'price', 'old_price', 'get_percentage', 'description', 'colors', 'color', 'sizes']

class SearchProductSerializer(serializers.ModelSerializer):

    class Meta:
        model = Product
        fields = ['pid', 'title', 'product_image',]

class ProductImagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImages
        fields = ['id', 'product_images']  # Add other fields if needed

class CartProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = ['pid', 'category', 'title', 'product_image', 'price', 'old_price', 'get_percentage',  'color']
class WishlistProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    sizes = SizeSerializer(read_only=True, many=True)  # Can use full serializer for colors

    class Meta:
        model = Product
        fields = ['pid', 'category', 'title', 'product_image', 'price', 'old_price', 'get_percentage',  'color', 'sizes']

class CartSerializer(serializers.ModelSerializer):
    # Use ProductSerializer to return full product details
    product = CartProductSerializer(read_only=True)
    
    # Explicitly declare size field if it's not automatically included
    size = serializers.CharField(read_only=True)

    class Meta:
        model = Cart
        fields = ['cart_id', 'user', 'product', 'quantity', 'added_on', 'size']

    def validate(self, data):
        product = data.get('product')
        if not Product.objects.filter(pk=product.pk).exists():
            raise serializers.ValidationError("Product does not exist")
        return data
class WishlistSerializer(serializers.ModelSerializer):
    # Use ProductSerializer to return full product details
    product = WishlistProductSerializer(read_only=True)
    
    class Meta:
        model = Wishlist
        fields = ['wishlist_id', 'user', 'product', 'date']

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            'address_id', 'user', 'first_name', 'last_name', 'country', 'company_name', 
            'street_address', 'apartment', 'city', 'state', 'phone', 
            'postal_code', 'delivery_instruction', 'default_shipping', 
            'default_billing', 'status'
        ]

class ProductReviewSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)  # Nest the UserProfileSerializer
    class Meta:
        model = ProductReview
        fields = ['id', 'user', 'review', 'rating', 'created_at_formatted']
        read_only_fields = ['user', 'created_at_formatted']

class OrderItemProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = ['pid', 'category', 'title', 'product_image', 'price', 'old_price', 'get_percentage',  'color']


class OrderItemSerializer(serializers.ModelSerializer):
    """
    Serializer for the OrderItem model, to display details of each product in the order.
    """
    product = OrderItemProductSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['product', 'quantity', 'price_at_purchase', 'item_total', 'size']

class OrderSerializer(serializers.ModelSerializer):
    """
    Serializer for the Order model, including nested OrderItem data.
    """
    order_items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['order_id', 'user', 'total_price', 'payment_method', 'address', 'order_status', 'order_date_formatted', 'updated', 'order_items']

class CheckCouponSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=50)

    def validate_code(self, code):
        request = self.context['request']
        user = request.user

        try:
            # Fetch the coupon object
            coupon = Coupon.objects.get(code=code, user=user)
        except Coupon.DoesNotExist:
            raise serializers.ValidationError("Invalid coupon code.")

        # Check if the coupon is valid
        if not coupon.is_valid():
            raise serializers.ValidationError("Coupon is expired, inactive, or has already been used.")
        
        return coupon
    
class ApplyCouponSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=50)

    def validate_name(self, name):  # Updated to validate_name
        request = self.context['request']
        user = request.user

        try:
            # Fetch the coupon object
            coupon = Coupon.objects.get(name=name, user=user)
        except Coupon.DoesNotExist:
            raise serializers.ValidationError("Invalid coupon code.")

        # Check if the coupon is valid
        if not coupon.is_valid():
            raise serializers.ValidationError("Coupon is expired, inactive, or has already been used.")
        
        return coupon  # Return the coupon object

