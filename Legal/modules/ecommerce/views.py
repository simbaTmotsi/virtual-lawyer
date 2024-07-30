from django.shortcuts import render
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from .models import Product, Order

class ProductListView(ListView):
    model = Product
    template_name = 'product_list.html'
    context_object_name = 'products'

class ProductDetailView(DetailView):
    model = Product
    template_name = 'product_detail.html'
    context_object_name = 'product'

class ProductCreateView(CreateView):
    model = Product
    template_name = 'product_create.html'
    fields = ['name', 'description', 'price', 'image', 'available_quantity']
    success_url = '/products/'

class ProductUpdateView(UpdateView):
    model = Product
    template_name = 'product_update.html'
    fields = ['name', 'description', 'price', 'image', 'available_quantity']
    success_url = '/products/'

class ProductDeleteView(DeleteView):
    model = Product
    template_name = 'product_delete.html'
    success_url = '/products/'

class OrderCreateView(CreateView):
    model = Order
    template_name = 'order_create.html'
    fields = ['customer_name', 'email', 'phone_number', 'shipping_address', 'total_amount']
    success_url = '/orders/'
