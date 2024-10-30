from django.urls import path
from FieldBoost.views import auth_views

urlpatterns = [
    path('login/', auth_views.login_home, name='login_home'),
    path('logout/', auth_views.logout_view, name='logout_view'),
    path('signup/', auth_views.UserSignupView.as_view(), name='signup_home'),
    path('', auth_views.index, name='index'),  # Assuming you want to redirect to index
]
