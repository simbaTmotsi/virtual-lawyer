from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User
from django.http import HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from django.urls import reverse_lazy
from .forms import CustomAuthenticationForm  # TaskForm commented out
from FieldBoost.models import Task, CustomUser  # Ensure Task and CustomUser are imported

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
                if user.role == "farmer":
                    return redirect("farmer_home")
                elif user.role == "driver":
                    return redirect("driver_home")
                elif user.role == "lawyer":
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

# Task Management Views
@login_required(login_url=reverse_lazy('login_home'))
def to_do(request):
    context = {"breadcrumb": {"parent": "Apps", "child": "To-Do"}}
    return render(request, "applications/to-do/main-todo.html", context)

@login_required(login_url=reverse_lazy('login_home'))
def to_do_database(request):
    tasks = Task.objects.all()

    # TaskForm commented out since it's not a key issue at the moment
    # form = TaskForm()
    form = None  # Placeholder

    if request.method == 'POST':
        form = TaskForm(request.POST)
        if form.is_valid():
            form.save()
        return redirect('/to_do_database')

    completedTasks = all(task.complete for task in tasks)

    context = {'tasks': tasks, 'form': form, 'completedTasks': completedTasks, "breadcrumb": {"parent": "Todo", "child": "Todo with database"}}
    return render(request, 'applications/to-do/to-do.html', context)

@login_required(login_url=reverse_lazy('login_home'))
def markAllComplete(request):
    Task.objects.all().update(complete=True)
    return HttpResponseRedirect("/to_do_database")

@login_required(login_url=reverse_lazy('login_home'))
def markAllIncomplete(request):
    Task.objects.all().update(complete=False)
    return HttpResponseRedirect("/to_do_database")

@login_required(login_url=reverse_lazy('login_home'))
def deleteTask(request, pk):
    task = get_object_or_404(Task, id=pk)
    task.delete()
    return HttpResponseRedirect("/to_do_database")

@login_required(login_url=reverse_lazy('login_home'))
def updateTask(request, pk):
    task = get_object_or_404(Task, id=pk)
    task.complete = not task.complete
    task.save()
    return HttpResponseRedirect("/to_do_database")
