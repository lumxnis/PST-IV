from django.urls import path
from . import views

urlpatterns = [

    ##Examenes
    path('examenes/', views.examenes, name='examenes'),
    ##Análisis
    path('analisis/', views.analisis, name='analisis'),
    ##Medico
    path('medico/', views.medico, name='medico'),
    ##Especialidad
    path('especialidad/', views.especialidad, name='especialidad'),
    ##Realizar_Examenes
    path('realizar_examenes/', views.realizar_examenes, name='realizar_examenes'),
    ##Resultados_Examenes
    path('resultados_examenes/', views.resultados_examenes, name='resultados_examenes'),
    
]