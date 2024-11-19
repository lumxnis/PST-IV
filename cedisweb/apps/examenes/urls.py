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

    ##Especialidad
    path('especialidad/', views.especialidad, name='especialidad'),

    ##Realizar_Examenes
    path('realizar_examenes/', views.realizar_examenes, name='realizar_examenes'),

    ##Resultados_Examenes
    path('resultados_examenes/', views.resultados_examenes, name='resultados_examenes'),
    
]