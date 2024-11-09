from django.urls import path
from . import views

urlpatterns = [

    ##Exámenes
    path('examenes/', views.examenes, name='examenes')
    
]