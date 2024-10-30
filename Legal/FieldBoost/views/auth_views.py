from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.urls import reverse_lazy
from .forms import CustomAuthenticationForm  # TaskForm commented out

from django.views.generic.edit import CreateView
from FieldBoost.models import CustomUser
from FieldBoost.forms import UserSignupForm

from django.views.generic.edit import CreateView
from django.urls import reverse_lazy
from django.contrib.auth import login
from django.contrib.auth import get_backends
from FieldBoost.models import CustomUser
from FieldBoost.forms import UserSignupForm
from django.shortcuts import redirect

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



class UserSignupView(CreateView):
    model = CustomUser
    form_class = UserSignupForm
    template_name = 'signup.html'
    success_url = reverse_lazy('login_home')  # You can update this as needed

    def form_valid(self, form):
        user = form.save(commit=False)
        user.set_password(form.cleaned_data['password'])
        user.save()
        
        # Get the backend for the user and login
        backend = get_backends()[0]  # Use the first configured backend (or specify if needed)
        user.backend = f"{backend.__module__}.{backend.__class__.__name__}"
        
        login(self.request, user)
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
