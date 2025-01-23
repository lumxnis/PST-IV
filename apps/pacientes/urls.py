from django.urls import path
from . import views

urlpatterns = [
    ##Pacientes
    path('Pacientes/', views.pacientes, name='pacientes'),
    path('listar_pacientes/', views.listar_pacientes, name='listar_pacientes'),
    path('registrar_paciente/', views.registrar_paciente, name='registrar_paciente'),
    path('obtener_sexo/', views.obtener_sexo, name='obtener_sexo'),
    path('obtener_paciente/', views.obtener_paciente, name='obtener_paciente'),
    path('modificar_paciente/', views.modificar_paciente, name='modificar_paciente'),
]