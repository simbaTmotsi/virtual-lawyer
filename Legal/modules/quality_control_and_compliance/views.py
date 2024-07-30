from django.shortcuts import render
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from .models import Product, QualityCheck
from django.urls import reverse_lazy

class ProductListView(ListView):
    model = Product
    template_name = 'product_list.html'
    context_object_name = 'products'

class ProductCreateView(CreateView):
    model = Product
    template_name = 'product_create.html'
    fields = ['name', 'description']
    success_url = reverse_lazy('product_list')

class ProductUpdateView(UpdateView):
    model = Product
    template_name = 'product_update.html'
    fields = ['name', 'description']
    success_url = reverse_lazy('product_list')

class ProductDeleteView(DeleteView):
    model = Product
    template_name = 'product_delete.html'
    success_url = reverse_lazy('product_list')

class QualityCheckListView(ListView):
    model = QualityCheck
    template_name = 'qualitycheck_list.html'
    context_object_name = 'qualitychecks'

class QualityCheckCreateView(CreateView):
    model = QualityCheck
    template_name = 'qualitycheck_create.html'
    fields = ['product', 'passed', 'remarks']
    success_url = reverse_lazy('qualitycheck_list')

class QualityCheckUpdateView(UpdateView):
    model = QualityCheck
    template_name = 'qualitycheck_update.html'
    fields = ['product', 'passed', 'remarks']
    success_url = reverse_lazy('qualitycheck_list')

class QualityCheckDeleteView(DeleteView):
    model = QualityCheck
    template_name = 'qualitycheck_delete.html'
    success_url = reverse_lazy('qualitycheck_list')
