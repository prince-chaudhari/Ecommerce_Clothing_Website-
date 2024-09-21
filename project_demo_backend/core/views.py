from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.views import APIView
from .serializers import ProductSerializer, CategorySerializer, ProductReviewSerializer, ProductImagesSerializer, ColorSerializer, SizeSerializer, CartSerializer, WishlistSerializer, AddressSerializer, OrderSerializer, CheckCouponSerializer, ApplyCouponSerializer
from .models import Product, Category, Vendor, ProductReview,  ProductImages, Color, Size, Cart, Wishlist, Address, Order, OrderItem
from taggit.models import Tag
from django.shortcuts import get_object_or_404
from django.db.models import Avg
from .forms import ProductReviewForm
from django.db.models import Count
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound
from .invoice_template import generate_invoice
from django.core.mail import EmailMessage
from django.conf import settings
import os

class IndexView(APIView):
    permission_classes = []
    def get(self, request, format=None):
        products = Product.objects.filter(product_status = 'published', featured = True)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class ProductListView(APIView):
    permission_classes = []
    def get(self, request, format=None):
        products = Product.objects.filter(product_status = 'published')
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ColorListView(APIView):
    permission_classes = []
    def get(self, request, format=None):
        colors = Color.objects.all()
        serializer = ColorSerializer(colors, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class SizeListView(APIView):
    permission_classes = []
    def get(self, request, format=None):
        sizes = Size.objects.all()
        serializer = SizeSerializer(sizes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CategoryListView(APIView):
    permission_classes = []

    def get(self, request, format=None):
        # Annotate the categories with the count of related products
        categories = Category.objects.annotate(product_count=Count('products'))
        men_cnt = 0
        women_cnt = 0
        for i in categories:
            if i.title.startswith("Men"):
                men_cnt += 1
            elif i.title.startswith("Women"):
                women_cnt += 1
        # Modify the serializer to include the product count
        serializer = CategorySerializer(categories, many=True)
        
        return Response({'categories' : serializer.data,
                         'men_cnt' : men_cnt,
                         'women_cnt' : women_cnt}, status=status.HTTP_200_OK)

class CategoryProductListView(APIView):
    permission_classes = []
    def get(self, request, cid, format=None):
        category = Category.objects.get(cid = cid)
        categorySerializer = CategorySerializer(data = category)

        products = Product.objects.filter(product_status = 'published', category = category)
        productsSerializer = ProductSerializer(data = products, many=True)

        combined_data = {
            'category': categorySerializer.data,
            'products': productsSerializer.data
        }

        return Response(combined_data, status=status.HTTP_200_OK)
    
class VendorListView(APIView):
    def get(self, request, format=None):
        vendor = Vendor.objects.all()
        serializer = VendorSerializer(data = vendor, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class VendorDetailView(APIView):
    def get(self, request, vid, format=None):
        vendor = Vendor.objects.get(vid = vid)
        vendorSerializer = VendorSerializer(data = vendor)

        products = Product.objects.filter(product_status = 'published', vendor = vendor)
        productsSerializer = ProductSerializer(data = products, many=True)
    
        combined_data = {
            'vendor': vendorSerializer.data,
            'products': productsSerializer.data
        }

        return Response(combined_data, status=status.HTTP_200_OK)

class ProductDetailView(APIView):
    permission_classes = []
    def get(self, request, pid, format=None):
        product = Product.objects.get(pid = pid)
        serializer = ProductSerializer(product)

        relatedProducts = Product.objects.filter(category = product.category).exclude(pid = pid)
        relatedProductSerializer = ProductSerializer(relatedProducts, many = True)

        # Getting all reviews related to a product
        reviews = ProductReview.objects.filter(product = product).order_by('-date')
        reviewSerializer = ProductReviewSerializer(reviews, many = True)

        # Getting average review
        average_rating = ProductReview.objects.filter(product = product).aggregate(rating = Avg('rating'))

        # colors = product.colors.all()
        # colorSerializer = ColorSerializer(colors, many = True)

        make_review = True

        if request.user.is_authenticated:
            user_review_count = ProductReview.objects.filter(user = request.user, product = product).count()

            if user_review_count > 0:
                make_review = False

        p_images = ProductImages.objects.filter(product=product)
        p_image_serializer = ProductImagesSerializer(p_images, many=True)

        combined_data = {
            'product': serializer.data,
            'p_image': p_image_serializer.data,
            'make_review': make_review,
            'average_rating': average_rating,
            # 'review_form': review_form,
            'related_products': relatedProductSerializer.data,
            'product_reviews': reviewSerializer.data,
        }

        return Response(combined_data, status=status.HTTP_200_OK)

class ProductPriceRangeAPIView(APIView):
    permission_classes = []
    def get(self, request, *args, **kwargs):
        try:
            # Get the min and max prices from the Product model
            min_price = Product.objects.all().order_by('price').first().price
            max_price = Product.objects.all().order_by('-price').first().price

            # Return the response with min and max price
            return Response(
                {
                    "min_price": min_price,
                    "max_price": max_price,
                }, 
                status=status.HTTP_200_OK
            )
        except Product.DoesNotExist:
            return Response(
                {"error": "No products found."}, 
                status=status.HTTP_404_NOT_FOUND
            )

class TagListView(APIView):
    permission_classes = []
    def get(self, request, tag_slug = None, format=None):
        products = Product.objects.filter(product_status = 'published').order_by('-id')

        tag = None
        if tag_slug:
            tag = get_object_or_404(Tag, slug = tag_slug)
            products = products.filter(tags__in = [tag])

        serializer = ProductSerializer(data = products, many=True)

        combined_data = {
            'products': serializer.data,
            'tag': tag
        }

        return Response(combined_data, status=status.HTTP_200_OK)

class SearchView(APIView):
    permission_classes = []
    def post(self, request, format=None):
        data = request.data
        query = data['query']

        products = Product.objects.filter(title__icontains = query).order_by('-date')

        serializer = ProductSerializer(data = products, many=True)

        combined_data = {
            'products': serializer.data,
            'query': query
        }

        return Response(combined_data, status=status.HTTP_200_OK)

class FilterProduct(APIView):
    permission_classes = []

    def post(self, request, format=None):
        products = Product.objects.filter(product_status='published').order_by('-pid').distinct()
        
        categories = request.data.get('category', [])
        colors = request.data.get('colors', [])
        sizes = request.data.get('sizes', [])
        price = request.data.get('price')

        # Filter by price range
        if price:
            products = products.filter(price__gte=price['min_price'], price__lte=price['max_price'])

        # Filter by categories
        if categories:
            products = products.filter(category__cid__in=categories).distinct()

        # Filter by sizes
        if sizes:
            # Assuming sizes are passed as a list of size IDs
            products = products.filter(sizes__id__in=sizes).distinct()

        # Filter by colors
        if colors:
            products = products.filter(color__in=colors).distinct()

        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AddToCartView(generics.CreateAPIView):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]  # Restrict to authenticated users

    def post(self, request, *args, **kwargs):
        data = request.data
        product_id = data.get('product')
        size = data.get('size')
        quantity = data.get('quantity', 1)


        user = request.user

        try:
            product = Product.objects.get(pid=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check if the product is already in the cart
        cart_item, created = Cart.objects.get_or_create(
            user=user,
            product=product,
            size = size,
            defaults={'quantity': quantity}
        )

        if not created:
            # If already exists, update the quantity
            cart_item.quantity += quantity
            cart_item.save()

        serializer = self.get_serializer(cart_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
class CartListView(generics.ListAPIView):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return Cart.objects.filter(user=user)
        return Cart.objects.none()

class CartView(APIView):
    def get(self, request, format=None):
        cart_total_amount = 0
        if 'cart_data_obj' in request.session:
            for p_id, item in request.session['cart_data_obj'].items():
                cart_total_amount += (int(item['qty']) * float(item['price']))
            return Response({
                "cart_data" : request.session['cart_data_obj'],
                "total_cart_items" : len(request.session['cart_data_obj']),
                "cart_total_amount" : cart_total_amount
            }, status=status.HTTP_200_OK) 
        else:
            return Response({
                "cart_data" : '',
                "total_cart_items" : 0,
                "cart_total_amount" : cart_total_amount
            }, status=status.HTTP_200_OK)

class CartRetrieveUpdateDestroyAPIView(APIView):
    def patch(self, request, *args, **kwargs):
        cart_id = request.data.get('cart_id')
        quantity = request.data.get('quantity')

        if not cart_id:
            return Response({"error": "Cart ID not provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            cart_item = Cart.objects.get(cart_id=cart_id)
        except Cart.DoesNotExist:
            return Response({"error": "Cart item not found"}, status=status.HTTP_404_NOT_FOUND)

        if quantity is not None:
            try:
                quantity = int(quantity)
                if quantity < 1:
                    return Response({"error": "Quantity must be a positive integer"}, status=status.HTTP_400_BAD_REQUEST)
            except ValueError:
                return Response({"error": "Invalid quantity value"}, status=status.HTTP_400_BAD_REQUEST)

            cart_item.quantity = quantity
            cart_item.save()
            serializer = CartSerializer(cart_item)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response({"error": "Quantity not provided"}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        cart_id = request.data.get('cart_id')

        if not cart_id:
            return Response({"error": "Cart ID not provided"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            cart_item = Cart.objects.get(cart_id=cart_id)
        except Cart.DoesNotExist:
            return Response({"error": "Cart item not found"}, status=status.HTTP_404_NOT_FOUND)

        cart_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ClearCartAPIView(APIView):
    """
    API View to delete all items in the cart for a specific user.
    """
    
    def delete(self, request, *args, **kwargs):
        user = request.user
        if user.is_authenticated:
            # Get all cart items for the user and delete them
            Cart.objects.filter(user=user).delete()
            return Response({"message": "All cart items deleted successfully."}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "User not authenticated."}, status=status.HTTP_401_UNAUTHORIZED)

class WishlistCreateView(generics.CreateAPIView):
    queryset = Wishlist.objects.all()
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        user = request.user
        product_id = request.data.get('product')

        if not product_id:
            return Response({"error": "Product ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(pid=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        wishlist = Wishlist(user=user, product=product)
        wishlist.save()

        serializer = self.get_serializer(wishlist)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class WishlistListView(generics.ListAPIView):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)

class WishlistDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        wishlist_id = request.data.get('wishlist_id')
        if not wishlist_id:
            return Response({"error": "Wishlist ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            wishlist = Wishlist.objects.get(wishlist_id=wishlist_id, user=request.user)
            wishlist.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Wishlist.DoesNotExist:
            return Response({"error": "Wishlist not found"}, status=status.HTTP_404_NOT_FOUND)

class AddressCreateView(generics.CreateAPIView):
    serializer_class = AddressSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        data['user'] = request.user.id
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class AddressListView(generics.ListAPIView):
    serializer_class = AddressSerializer

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

class DeleteAddressView(APIView):
    def delete(self, request, address_id):
        try:
            address = Address.objects.get(address_id=address_id)
        except Address.DoesNotExist:
            raise NotFound("Address not found")

        address.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class UpdateAddressView(APIView):
    def put(self, request, address_id):
        try:
            address = Address.objects.get(address_id=address_id)
        except Address.DoesNotExist:
            raise NotFound("Address not found")

        serializer = AddressSerializer(address, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProductReviewListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, product_id):
        """
        List all reviews for a product.
        """
        reviews = ProductReview.objects.filter(product_id=product_id)
        serializer = ProductReviewSerializer(reviews, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, product_id):
        """
        Create a new review for a product.
        """
        product = get_object_or_404(Product, pid=product_id)
        serializer = ProductReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, product=product)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductReviewDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, product_id, review_id):
        """
        Helper method to get the review instance.
        """
        return get_object_or_404(ProductReview, product_id=product_id, id=review_id)

    def get(self, request, product_id, review_id):
        """
        Retrieve a specific review for a product.
        """
        review = self.get_object(product_id, review_id)
        serializer = ProductReviewSerializer(review)
        return Response(serializer.data)

    def put(self, request, product_id, review_id):
        """
        Update a review.
        """
        review = self.get_object(product_id, review_id)
        if review.user != request.user:
            return Response({"error": "You can only update your own reviews."}, status=status.HTTP_403_FORBIDDEN)

        serializer = ProductReviewSerializer(review, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, product_id, review_id):
        """
        Delete a review.
        """
        review = self.get_object(product_id, review_id)
        if review.user != request.user:
            return Response({"error": "You can only delete your own reviews."}, status=status.HTTP_403_FORBIDDEN)
        
        review.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

def send_invoice_email(request, user_email, order_details):
    # Generate invoice PDF
    invoice_data = {
        'customer_name': order_details['customer_name'],
        'customer_email': user_email,
        'invoice_number': order_details['invoice_number'],
        'invoice_date': order_details['invoice_date'],
        'items': order_details['items'],
        'total_amount': order_details['total_amount'],
        'savings': order_details['savings']
    }
    pdf_file_path = os.path.join(settings.MEDIA_ROOT, f"invoice_{invoice_data['invoice_number']}.pdf")
    generate_invoice(invoice_data, pdf_file_path)

    # Create email
    subject = 'Your Purchase Invoice'
    body = f"Dear {invoice_data['customer_name']},\n\nThank you for your purchase. Please find attached your invoice."
    email = EmailMessage(subject, body, settings.EMAIL_HOST_USER, [user_email])

    # Attach PDF
    email.attach_file(pdf_file_path)
    
    # Send email
    email.send()

    # Optional: Remove PDF file after sending email
    if os.path.exists(pdf_file_path):
        os.remove(pdf_file_path)
    
class CreateOrderView(APIView):
    """
    API view for creating an order with multiple products.
    """

    def post(self, request, *args, **kwargs):
        user = request.user
        products = request.data.get('product')  # Expecting a list of products with quantities
        payment_method = request.data.get('payment_method')
        address_data = request.data.get('address')  # Address data as a dictionary
        total_price = request.data.get('total_price')  # Address data as a dictionary
        savings = request.data.get('savings')  # Address data as a dictionary

        # Validate required fields
        if not products or not payment_method or not address_data:
            return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

        # Initialize the total price for the order
        # total_price = 0
        order_items = []

        # Loop through the products and add each to the order
        for item in products:
            product_id = item.get('pid')
            quantity = item.get('quantity', 1)
            size = item.get('size')

            # Validate product
            product = get_object_or_404(Product, pid=product_id)

            # Calculate total price for the current product
            price_at_purchase = product.price
            item_total = price_at_purchase * int(quantity)

            # Add product details to order items list
            order_items.append({
                'product': product,
                'quantity': quantity,
                'price_at_purchase': price_at_purchase,
                'item_total': item_total,
                'size': size,
            })

        # Convert address_data (a dictionary) to an Address instance
        try:
            address, created = Address.objects.get_or_create(
                user=user,
                first_name=address_data['first_name'],
                last_name=address_data['last_name'],
                country=address_data['country'],
                company_name=address_data.get('company_name'),
                street_address=address_data['street_address'],
                apartment=address_data.get('apartment'),
                city=address_data['city'],
                state=address_data['state'],
                phone=address_data['phone'],
                postal_code=address_data['postal_code'],
                status=address_data.get('status', False)
            )
        except KeyError as e:
            return Response({"error": f"Missing address field: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        # Create the order
        order = Order.objects.create(
            user=user,
            total_price=total_price,
            payment_method=payment_method,
            address=address,  # Assign the Address instance
            order_status="pending"
        )

        # Explicitly create OrderItem for each product
        for item in order_items:
            OrderItem.objects.create(
                order=order,
                product=item['product'],
                quantity=item['quantity'],
                size=item['size'],
                price_at_purchase=item['price_at_purchase'],
                item_total=item['item_total']
            )

        # Send invoice email to the user
        try:
            order_details = {
                'customer_name': f"{user.username}",
                'invoice_number': order.order_id,  # Assuming order ID as invoice number
                'invoice_date': order.order_date.strftime("%Y-%m-%d"),
                'items': [
                    {
                        'product': item['product'].title,
                        'quantity': item['quantity'],
                        'price': item['price_at_purchase'],
                        'total': item['item_total']
                    } for item in order_items
                ],
                'total_amount': total_price,
                'savings': savings
            }
            send_invoice_email(request, user.email, order_details)
        except Exception as e:
            return Response({"error": f"Failed to send invoice email: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Serialize the created order
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)



class OrderListView(APIView):
    """
    API view to retrieve all orders of the authenticated user
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        # Get all orders placed by the user
        orders = Order.objects.filter(user=user).order_by('-order_date')
        # Serialize the orders
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class RetrieveOrderView(APIView):
    """
    API view to retrieve a specific order by its order_id
    """
    def get(self, request, order_id, *args, **kwargs):
        # Fetch the order based on order_id (UUID)
        order = get_object_or_404(Order, order_id=order_id)

        # Serialize the order and return the response
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ApplyCouponAPIView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = ApplyCouponSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            coupon = serializer.validated_data['name']
            # Store the coupon ID in the session (optional)
            request.session['coupon_id'] = coupon.id

            # Deactivate the coupon after use
            coupon.used = True
            coupon.active = False
            coupon.save()

            # Calculate discount amount or return success response
            return Response(status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CheckCouponAPIView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = CheckCouponSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            coupon = serializer.validated_data['code']
            # Return success response indicating the coupon is valid
            return Response({
                'message': 'Coupon applied successfully!',
                'discount_percentage': coupon.discount_percentage,
                'coupon_name': coupon.name
            }, status=status.HTTP_200_OK)
        
        # Return error response if coupon is not valid
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
