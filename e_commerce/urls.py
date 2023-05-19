# urls.py
from django.urls import path
from e_commerce.views import (
        ProductView,
        OrderView, 
        AddProductAPIView, 
        RemoveOrderItemAPIView, 
        CompleteOrderAPIView, 
        ProductListPIView,
        LoginView,
        SizesListApiView,
        OuterwearListApiView
    )

urlpatterns = [
    path("login", LoginView.as_view()),
    path("", ProductView.as_view(),name="products"),
    path("order", OrderView.as_view(),name="order"),
    path("add_product", AddProductAPIView.as_view(),name="add_product"),
    path("remove_order_item/<pk>", RemoveOrderItemAPIView.as_view(),name="remove_order_item"),
    path("complete_order/<pk>", CompleteOrderAPIView.as_view(),name="complete_order"),
    path("product/", ProductListPIView.as_view(),name="product"),
    
    # get filter data section
    path("sizes", SizesListApiView.as_view(),name="sizes"),
    path("outerwears/", OuterwearListApiView.as_view(),name="outerwears"),
]