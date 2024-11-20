from django.urls import path
from . import views

urlpatterns = [
    ##Pacientes
    path('Pacientes/', views.pacientes, name='pacientes'),
    path('listar_pacientes/', views.listar_pacientes, name='listar_pacientes'),
    path('registrar_paciente/', views.registrar_paciente, name='registrar_paciente'),
    path('obtener_opciones/', views.obtener_opciones, name='obtener_opciones'),
]