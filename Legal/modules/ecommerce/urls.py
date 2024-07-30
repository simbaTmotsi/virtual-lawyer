from django.urls import path
from .views import ProductListView, ProductDetailView, CartView, CheckoutView, OrderDetailView

app_name = 'ecommerce'

urlpatterns = [
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('cart/', CartView.as_view(), name='cart'),
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
]
