from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from .serializers import ProductSerializer, CategorySerializer, VendorSerializer, ProductReviewSerializer, CartOrderSerializer, CartOrderItemsSerializer, ProductImagesSerializer, ColorSerializer, SizeSerializer
from .models import Product, Category, Vendor, ProductReview, CartOrder, CartOrderItems, ProductImages, Color, Size
from taggit.models import Tag
from django.shortcuts import get_object_or_404
from django.db.models import Avg
from .forms import ProductReviewForm
from django.db.models import Count

class IndexView(APIView):
    permission_classes = []
    def get(self, request, format=None):
        products = Product.objects.filter(product_status = 'published', featured = True)
        serializer = ProductSerializer(products, many=True)
        print("/"*20, serializer.data)
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
            print(i.title)
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

        # Product Review Form
        review_form = ProductReviewForm()

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


class AddToCart(APIView):
    def post(self, request, format=None):
        p_id = request.data.get('id')
        cart_product = {}
        
        cart_product[p_id] = {
            'title' : request.data.get('title'),
            'qty' : request.data.get('qty'),
            'price' : request.data.get('price'),
            'image' : request.data.get('image'),
            'pid' : request.data.get('pid'),
        }

        if 'cart_data_obj' in request.session:
            if p_id in request.session['cart_data_obj']:
                cart_data = request.session['cart_data_obj']
                cart_data[p_id]['qty'] = int(cart_product[p_id]['qty'])
                cart_data.update(cart_data)
                request.session['cart_data_obj'] = cart_data
            
            else:
                cart_data = request.session['cart_data_obj']
                cart_data.update(cart_product)
                request.session['cart_data_obj'] = cart_data

        else:
            request.session['cart_data_obj'] = cart_product
        
        return Response({
            "data" : request.session['cart_data_obj'],
            "total_cart_items" : len(request.session['cart_data_obj'])
        }, status=status.HTTP_200_OK)

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

class DeleteCartItem(APIView): # Check before delete
    def post(self, request, format=None):
        product_id = request.data.get('id')
        if 'cart_data_obj' in request.session:
            if product_id in request.session['cart_data_obj']: 
                cart_data = request.session['cart_data_obj'] # <<<------------
                del request.session['cart_data_obj'][product_id]
                request.session['cart_data_obj'] = cart_data
        cart_total_amount = 0
        if 'cart_data_obj' in request.session:
            for p_id, item in request.session['cart_data_obj'].items():
                cart_total_amount += (int(item['qty']) * float(item['price']))
        
        return Response({
            "cart_data" : request.session['cart_data_obj'],
            "total_cart_items" : len(request.session['cart_data_obj']),
            "cart_total_amount" : cart_total_amount
        }, status=status.HTTP_200_OK)

class UpdateCartItem(APIView):
    def post(self, request, format=None):
        product_id = request.data.get('id')
        product_qty = request.data.get('qty')
        if 'cart_data_obj' in request.session:
            if product_id in request.session['cart_data_obj']: 
                cart_data = request.session['cart_data_obj'] 
                cart_data[product_id]['qty'] = product_qty
                request.session['cart_data_obj'] = cart_data
        cart_total_amount = 0
        for p_id, item in request.session['cart_data_obj'].items():
            cart_total_amount += (int(item['qty']) * float(item['price']))
        
        return Response({
            "cart_data" : request.session['cart_data_obj'],
            "total_cart_items" : len(request.session['cart_data_obj']),
            "cart_total_amount" : cart_total_amount
        }, status=status.HTTP_200_OK)

class CheckoutView(APIView):
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

class CustomerDashboardView(APIView):
    def get(self, request, format=None):
        orders = CartOrder.objects.filter(user = request.user).order_by('-id')
        serializer = CartOrderSerializer(data = orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class OrderDetailView(APIView):
    def get(self, request, id, format=None):
        order = CartOrder.objects.get(user = request.user, id = id)
        order_items = CartOrderItems.objects.filter(order = order)

        serializer = CartOrderItemsSerializer(data = order_items, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)
        