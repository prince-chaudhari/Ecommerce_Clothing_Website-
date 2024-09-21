from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from core.models import Product
from core.serializers import SearchProductSerializer
from rest_framework import status
from rest_framework.response import Response

@api_view(['POST'])
@permission_classes([])  # No authentication for search
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
    # serializer = SearchProductSerializer(products, many=True)  # No need for 'data' here since it's read-only

    return Response({
        'products': 'serializer.data',  # Access `.data` directly for read-only operation
    }, safe=False)
