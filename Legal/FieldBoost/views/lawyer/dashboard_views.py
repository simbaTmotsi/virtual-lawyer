from django.views.generic.edit import CreateView
from django.urls import reverse_lazy
from django.contrib.auth import login
from FieldBoost.models import CustomUser
from FieldBoost.forms import UserSignupForm

from django.views.generic.edit import CreateView
from django.views.generic import TemplateView
from django.urls import reverse_lazy

from django.contrib.auth.mixins import LoginRequiredMixin

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

