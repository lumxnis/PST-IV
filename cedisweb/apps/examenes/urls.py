from django.urls import path
from . import views

urlpatterns = [

    ##Examenes
    path('examenes/', views.examenes, name='examenes'),
    path('listar_examenes/', views.listar_examenes, name='listar_examenes'),
    path('obtener_analisis/', views.obtener_analisis, name='obtener_analisis'),
    path('registrar_examen/', views.registrar_examen, name='registrar_examen'),
    path('cargar_estatus_analisis/', views.cargar_estatus_analisis, name='cargar_estatus_analisis'),
    path('modificar_examen/', views.modificar_examen, name='modificar_examen'),

    ##Análisis
    path('analisis/', views.analisis, name='analisis'),
    path('listar_analisis/', views.listar_analisis, name='listar_analisis'),
    path('registrar_analisis/', views.registrar_analisis, name='registrar_analisis'),
    path('obtener_estatus_analisis/', views.obtener_estatus_analisis, name='obtener_estatus_analisis'),
    path('modificar_analisis/', views.modificar_analisis, name='modificar_analisis'),

    ##Medico
    path('medico/', views.medico, name='medico'),
    path('listar_medicos/', views.listar_medicos, name='listar_medicos'),
    path('obtener_especialidades/', views.obtener_especialidades, name='obtener_especialidades'),
    path('registrar_medico/', views.registrar_medico, name='registrar_medico'),
    path('obtener_medico/', views.obtener_medico, name='obtener-medico'),
    path('modificar_medico/', views.modificar_medico, name='modificar-medico'),

    ##Especialidad
    path('especialidad/', views.especialidad, name='especialidad'),
    path('listar_especialidades/', views.listar_especialidades, name='listar_especialidades'),
    path('registrar_especialidad/', views.registrar_especialidad, name='registrar_especialidad'),
    path('modificar_especialidad/', views.modificar_especialidad, name='modificar_especialidad'),

    ##Realizar_Examenes
    path('realizar_examenes/', views.realizar_examenes, name='realizar_examenes'),

    ##Resultados_Examenes
    path('resultados_examenes/', views.resultados_examenes, name='resultados_examenes'),
    
]