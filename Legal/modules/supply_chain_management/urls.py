from django.urls import path
from .views import (
    ProductListView, ProductDetailView, ProductCreateView, ProductUpdateView, ProductDeleteView,
    SupplierListView, SupplierDetailView, SupplierCreateView, SupplierUpdateView, SupplierDeleteView,
    WarehouseListView, WarehouseDetailView, WarehouseCreateView, WarehouseUpdateView, WarehouseDeleteView,
    LogisticsListView, LogisticsDetailView, LogisticsCreateView, LogisticsUpdateView, LogisticsDeleteView,
)

app_name = 'supply_chain_management'

urlpatterns = [
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('products/create/', ProductCreateView.as_view(), name='product-create'),
    path('products/<int:pk>/update/', ProductUpdateView.as_view(), name='product-update'),
    path('products/<int:pk>/delete/', ProductDeleteView.as_view(), name='product-delete'),

    path('suppliers/', SupplierListView.as_view(), name='supplier-list'),
    path('suppliers/<int:pk>/', SupplierDetailView.as_view(), name='supplier-detail'),
    path('suppliers/create/', SupplierCreateView.as_view(), name='supplier-create'),
    path('suppliers/<int:pk>/update/', SupplierUpdateView.as_view(), name='supplier-update'),
    path('suppliers/<int:pk>/delete/', SupplierDeleteView.as_view(), name='supplier-delete'),

    path('warehouses/', WarehouseListView.as_view(), name='warehouse-list'),
    path('warehouses/<int:pk>/', WarehouseDetailView.as_view(), name='warehouse-detail'),
    path('warehouses/create/', WarehouseCreateView.as_view(), name='warehouse-create'),
    path('warehouses/<int:pk>/update/', WarehouseUpdateView.as_view(), name='warehouse-update'),
    path('warehouses/<int:pk>/delete/', WarehouseDeleteView.as_view(), name='warehouse-delete'),

    path('logistics/', LogisticsListView.as_view(), name='logistics-list'),
    path('logistics/<int:pk>/', LogisticsDetailView.as_view(), name='logistics-detail'),
    path('logistics/create/', LogisticsCreateView.as_view(), name='logistics-create'),
    path('logistics/<int:pk>/update/', LogisticsUpdateView.as_view(), name='logistics-update'),
    path('logistics/<int:pk>/delete/', LogisticsDeleteView.as_view(), name='logistics-delete'),
]
