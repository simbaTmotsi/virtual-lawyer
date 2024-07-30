from django.shortcuts import render
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from .models import Crop, CropHealth, Weather, FarmActivity

class CropListView(ListView):
    model = Crop
    template_name = 'crop_list.html'
    context_object_name = 'crops'

class CropDetailView(DetailView):
    model = Crop
    template_name = 'crop_detail.html'
    context_object_name = 'crop'

class CropHealthListView(ListView):
    model = CropHealth
    template_name = 'crophealth_list.html'
    context_object_name = 'crophealths'

class CropHealthDetailView(DetailView):
    model = CropHealth
    template_name = 'crophealth_detail.html'
    context_object_name = 'crophealth'

class WeatherListView(ListView):
    model = Weather
    template_name = 'weather_list.html'
    context_object_name = 'weathers'

class WeatherDetailView(DetailView):
    model = Weather
    template_name = 'weather_detail.html'
    context_object_name = 'weather'

class FarmActivityListView(ListView):
    model = FarmActivity
    template_name = 'farmactivity_list.html'
    context_object_name = 'farmactivities'

class FarmActivityDetailView(DetailView):
    model = FarmActivity
    template_name = 'farmactivity_detail.html'
    context_object_name = 'farmactivity'
