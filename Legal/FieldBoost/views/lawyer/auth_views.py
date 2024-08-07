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

from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy

# Create your views here.
# class based views
#-------------------------General(Dashboards,Widgets & Layout)---------------------------------------

#---------------Dashboard  
class DashboardView(LoginRequiredMixin, TemplateView):
    template_name = "general/dashboard/lawyer/index.html"
    login_url = reverse_lazy('login_home')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['breadcrumb'] = {"parent":"Dashboard","child":"Default"}
        context['jsFunction'] = 'startTime()'
        return context
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


