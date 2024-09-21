from django.http import JsonResponse
from rest_framework.decorators import api_view
from core.models import Product
from core.serializers import ProductSerializer
from rest_framework import status

@api_view(['POST'])
def search(request):
    print("request.data", request.data)
    data = request.data
    query = data.get('query', '')  # Safely access 'query' from data

    if not query:
        return JsonResponse({
            'error': 'Query parameter is missing.'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Filter products based on the query
    products = Product.objects.filter(title__icontains=query)

    # Check if products exist for the query
    if not products.exists():
        return JsonResponse({
            'message': 'No products found matching the query.'
        }, status=status.HTTP_404_NOT_FOUND)

    # Serialize the filtered products
    serializer = ProductSerializer(products, many=True)

    return JsonResponse({
        'products': serializer.data,
    }, safe=False)
