from django.urls import path
from . import views

urlpatterns = [
    ##Inicio
    path('', views.home, name='home'),
    
    ##Horarios
    path('horarios/', views.horarios, name="horarios"),

    ##Logout
    path('exit/', views.exit, name="exit"),

    ##Register
    path('register/', views.register, name='register'),

    ##Dashboard
    path('index/', views.index, name='index'),
]
