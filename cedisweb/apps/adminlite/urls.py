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

    ##Profile
    path('profile/', views.profile, name="profile"),

    ##Edit Profile
    path('edit_profile/', views.edit_profile, name='edit_profile'),

    ## Usuarios
    path('usuarios/', views.usuarios, name='usuarios'),
    path('listar_usuarios/', views.listar_usuarios, name='listar_usuarios')
]