from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from django.views.generic import TemplateView, ListView
from rest_framework.generics import DestroyAPIView, UpdateAPIView, ListAPIView
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import filters
from django_filters import rest_framework as filter
from rest_framework import filters as rest_filters

from e_commerce.filters import ProductFilter

from luviantech.pagination import CustomPagination
from .models import Outerwear, Product, Order, OrderItem, Size
from .serializers import OuterwearSerializer, ProductSerializer, AddProductSerializer, OrderItemSerializer, OrderSerializer, SizeSerializer


class LoginView(TemplateView):
    template_name = "account/login.html"
    print('salam account', template_name)


class ProductView(TemplateView):
    template_name = "e_commerce/product_list.html"


class OrderView(ListView):
    permission_classes = [IsAuthenticated]
    template_name = "e_commerce/order.html"
    context_object_name = "order"
    queryset = Order.objects.all()

    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.filter(
            user=self.request.user, complete=False).first()
        return queryset


# API Views
class ProductListPIView(ListAPIView):
    authentication_classes = [JWTAuthentication]
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    pagination_class = CustomPagination
    filterset_class = ProductFilter
    filter_backends = [filter.DjangoFilterBackend, filters.OrderingFilter,rest_filters.SearchFilter]
    ordering_fields = ['name', 'price']
    search_fields = ['name']


    def get_queryset(self):
        print(self.request.GET, 'salam')
        return super().get_queryset()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class AddProductAPIView(APIView):
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        serializer = AddProductSerializer(
            data=request.data, context={'request': request})
        if serializer.is_valid():
            data = serializer.create(serializer.validated_data)
            return Response(data, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'error': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class SizesListApiView(ListAPIView):
    # authentication_classes = [JWTAuthentication]
    queryset = Size.objects.all()
    serializer_class = SizeSerializer


class OuterwearListApiView(ListAPIView):
    # authentication_classes = [JWTAuthentication]
    queryset = Outerwear.objects.all()
    serializer_class = OuterwearSerializer


class RemoveOrderItemAPIView(DestroyAPIView):
    authentication_classes = [JWTAuthentication]
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            'success': True,
            'message': "Order Item deleted"
        }, status=status.HTTP_200_OK)


class CompleteOrderAPIView(UpdateAPIView):
    authentication_classes = [JWTAuthentication]
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def put(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        serializer = self.get_serializer(
            instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # Retrieve the serialized data
        serialized_data = serializer.data

        # Return the serialized data as the API response
        return Response({
            "success": True,
            "message": "Checkout. Order completed",
            "order_id": instance.id
        }, status=status.HTTP_201_CREATED)
