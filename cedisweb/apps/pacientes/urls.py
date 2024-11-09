from django.urls import path
from . import views

urlpatterns = [
    ##Pacientes
    path('Pacientes/', views.pacientes, name='pacientes')
]