from django.urls import path
from .views import analyze_real_estate

urlpatterns = [
    path('analyze/', analyze_real_estate, name='analyze'),
]