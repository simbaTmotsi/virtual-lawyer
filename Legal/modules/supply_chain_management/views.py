from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from .models import Product, Supplier, Warehouse, Logistics

class ProductListView(ListView):
    model = Product
    template_name = 'supply_chain_management/product_list.html'

class ProductDetailView(DetailView):
    model = Product
    template_name = 'supply_chain_management/product_detail.html'

class ProductCreateView(CreateView):
    model = Product
    fields = '__all__'
    template_name = 'supply_chain_management/product_form.html'
    success_url = '/products/'

class ProductUpdateView(UpdateView):
    model = Product
    fields = '__all__'
    template_name = 'supply_chain_management/product_form.html'
    success_url = '/products/'

class ProductDeleteView(DeleteView):
    model = Product
    template_name = 'supply_chain_management/product_confirm_delete.html'
    success_url = '/products/'

class SupplierListView(ListView):
    model = Supplier
    template_name = 'supply_chain_management/supplier_list.html'

# Define other views for SupplierDetailView, SupplierCreateView, SupplierUpdateView, and SupplierDeleteView similarly

class WarehouseListView(ListView):
    model = Warehouse
    template_name = 'supply_chain_management/warehouse_list.html'

# Define other views for WarehouseDetailView, WarehouseCreateView, WarehouseUpdateView, and WarehouseDeleteView similarly

class LogisticsListView(ListView):
    model = Logistics
    template_name = 'supply_chain_management/logistics_list.html'

# Define other views for LogisticsDetailView, LogisticsCreateView, LogisticsUpdateView, and LogisticsDeleteView similarly
