from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.urls import reverse_lazy
from .forms import CustomAuthenticationForm  # TaskForm commented out

# Authentication Views
def login_home(request):
    if request.method == 'POST':
        form = CustomAuthenticationForm(data=request.POST)
        if form.is_valid():
            email = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=email, password=password)
            if user is not None:
                login(request, user)
                if user.role == "lawyer":
                    return redirect("lawyer_home")
            else:
                messages.error(request, "Wrong credentials")
        else:
            messages.error(request, form.errors)
    else:
        form = CustomAuthenticationForm()

    return render(request, 'main-login.html', {"form": form})

def logout_view(request):
    logout(request)
    return redirect('login_home')

def signup_home(request):
    if request.method == 'GET':
        return render(request, 'signup.html')
    else:
        email = request.POST['email']
        username = request.POST['username']
        password = request.POST['password']
        user = User.objects.filter(email=email).exists()
        if user:
            messages.error(request, "Email already exists")
            return render(request, 'signup.html')
        new_user = User.objects.create_user(username=username, email=email, password=password)
        new_user.save()
        return redirect('login_home')

@login_required(login_url=reverse_lazy('login_home'))
def index(request):
    if request.user.role == 'farmer':
        context = {"breadcrumb": {"parent": "Dashboard", "child": "Default"}, "jsFunction": 'startTime()'}
        return render(request, "general/dashboard/farmer/index.html", context)
    elif request.user.role == 'driver':
        context = {"breadcrumb": {"parent": "Dashboard", "child": "Default"}, "jsFunction": 'startTime()'}
        return render(request, "general/dashboard/driver/index.html", context)
    elif request.user.role == 'lawyer':
        context = {"breadcrumb": {"parent": "Dashboard", "child": "Default"}, "jsFunction": 'startTime()'}
        return render(request, "general/dashboard/lawyer/index.html", context)
