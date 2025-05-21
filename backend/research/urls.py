from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"", views.ResearchViewSet, basename="research")

urlpatterns = [
    path("", include(router.urls)),
    path("query-gemini/", views.ResearchViewSet.as_view({"post": "query_gemini"}), name="query-gemini"),
]
