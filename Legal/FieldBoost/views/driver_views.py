from django.shortcuts import render,redirect
from django.contrib import messages  
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import login, logout,authenticate
from django.contrib.auth.models import User,auth

from django.views.generic.edit import CreateView, UpdateView
from django.views.generic.detail import DetailView
from django.views.generic.list import ListView
from django.views.generic import TemplateView
from django.contrib import messages
from django.http.response import HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from django.urls import reverse_lazy

# Create your views here.
# class based views
#-------------------------General(Dashboards,Widgets & Layout)---------------------------------------

#---------------Dashboards
@login_required(login_url=reverse_lazy('login_home'))
def index(request):
    context = { "jsFunction":'startTime()'}
    return render(request,"general/dashboard/driver/index.html",context)

@login_required(login_url=reverse_lazy('login_home'))
def notifications(request):
    context = {}
    return render(request,'forms-table/table/driver/notifications/notifications.html',context)
 
@login_required(login_url=reverse_lazy('login_home'))
def recent_activities(request):
    context = {}
    return render(request,"applications/recent_activities/recent_activities.html",context)
     