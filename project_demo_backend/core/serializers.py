from rest_framework import serializers
from .models import Product, Category, Vendor, ProductReview, CartOrder, CartOrderItems, ProductImages, Color, Size

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

    # def get_products(self, obj):
    #     # Filter products that have the current color (obj) in their colors field
    #     products_with_color = obj.products.filter(color=obj.name)
    #     return SimplifiedProductSerializer(products_with_color, many=True).data


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    colors = ColorSerializer(read_only=True, many=True)  # Can use full serializer for colors

    class Meta:
        model = Product
        fields = ['pid', 'category', 'title', 'product_image', 'price', 'old_price', 'get_percentage', 'description', 'colors', 'color']





class ProductImagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImages
        fields = ['product_images']  # Add other fields if needed

class ProductReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductReview
        fields = []

class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = []

class CartOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartOrder
        fields = []

class CartOrderItemsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartOrderItems
        fields = []