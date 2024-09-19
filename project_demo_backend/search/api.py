from django.http import JsonResponse
from rest_framework.decorators import api_view
from core.models import Product
from core.serializers import ProductSerializer


@api_view(['POST'])
def search(request):
    print("request.data", request.data)
    data = request.data
    query = data.get('query', '')  # Use .get() to safely access 'query' from data
    
    products = Product.objects.filter(title__icontains=query)
    serializer = ProductSerializer(products, many=True)  # No 'data' keyword argument here
    
    return JsonResponse({
        'products': serializer.data,
    }, safe=False)
