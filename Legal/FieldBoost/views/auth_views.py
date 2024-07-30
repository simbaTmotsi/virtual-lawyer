from django.shortcuts import render,redirect
from django.contrib import messages  
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import login, logout,authenticate
from django.contrib.auth.models import User,auth

#from .forms import *
from .forms import CustomAuthenticationForm  # Import your custom form
from django.http.response import HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from django.urls import reverse_lazy

#---------------------------------------------------------------------------------------

def to_do(request):
      context = { "breadcrumb":{"parent":"Apps", "child":"To-Do"}}
      return render(request,"applications/to-do/main-todo.html",context)

def to_do_database(request):
    tasks = Task.objects.all()
    
    form = TaskForm()
    if request.method == 'POST':
        form = TaskForm(request.POST)
        if form.is_valid():
            form.save()
        return redirect('/to_do_database')

    completedTasks = True
    for t in tasks:
        if t.complete == False:
            completedTasks = False

    context = {'tasks': tasks, 'form': form,'completedTasks': completedTasks, "breadcrumb":{"parent":"Todo", "child":"Todo with database"}}
    context = {'tasks': tasks, 'form': form,'completedTasks': completedTasks, "breadcrumb":{"parent":"Todo", "child":"Todo with database"}}

    return render(request,'applications/to-do/to-do.html',context)
    

def markAllComplete(request):
    allTasks = Task.objects.all()
    for oneTask in allTasks:
        oneTask.complete = True
        oneTask.save()
    return HttpResponseRedirect("/to_do_database")


def markAllIncomplete(request):
    allTasks = Task.objects.all()
    for oneTask in allTasks:
        oneTask.complete = False
        oneTask.save()
    return HttpResponseRedirect("/to_do_database")


def deleteTask(request, pk):
    item = Task.objects.get(id=pk)
    item.delete()
    return HttpResponseRedirect("/to_do_database")


def updateTask(request, pk):
    task = Task.objects.get(id=pk)
    if task.complete == False:
        task.complete = True
        task.save()
    else:
        task.complete = False
        task.save()
    return HttpResponseRedirect("/to_do_database")


@login_required(login_url=reverse_lazy('login_home'))
def index(request):
    print(request.user.role)
    if request.user.role == 'farmer':
        context = { "breadcrumb":{"parent":"Dashboard","child":"Default"},"jsFunction":'startTime()'}
        return render(request,"general/dashboard/farmer/index.html",context)
    elif request.user.role == 'driver':
        context = { "breadcrumb":{"parent":"Dashboard","child":"Default"},"jsFunction":'startTime()'}
        return render(request,"general/dashboard/driver/index.html",context)
    elif request.user.role == 'lawyer':
        context = { "breadcrumb":{"parent":"Dashboard","child":"Default"},"jsFunction":'startTime()'}
        return render(request,"general/dashboard/lawyer/index.html",context)

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
            ##print(form.errors)  # Print form errors to debug
            messages.error(request, form.errors)
    else:
        form = CustomAuthenticationForm()
    
    return render(request, 'main-login.html', {"form": form})



def logout_view(request):
    logout(request)
    return redirect('login_home')


def signup_home(request):
    if request.method=='GET':
        return render(request,'signup.html') 
    else:
        email=request.POST['email']
        username=request.POST['username']
        password=request.POST['password']
        user=User.objects.filter(email=email).exists()
        if user:  
            raise Exception('Something went wrong')
        new_user=User.objects.create_user(username=username,email=email,password=password)
        new_user.save()
        return redirect('index')
        
