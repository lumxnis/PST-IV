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
    path('listar_usuarios/', views.listar_usuarios, name='listar_usuarios'),
    path('cargar_roles/', views.cargar_roles, name='listar_usuarios'),
    path('registrar_usuario/', views.registrar_usuario, name='registrar_usuario'),
    path('modificar_usuario/',views.modificar_usuario, name='modificar_usuario'),
    path('modificar_usuario_estatus/', views.modificar_usuario_estatus, name='modificar_usuario_estatus'),
    path('cambiar_contraseña/', views.cambiar_contraseña, name='cambiar_contraseña'),

    ## Roles
    path('roles/', views.roles, name='roles'),
    path('listar_roles/', views.listar_roles, name='listar_roles'),
    path('registrar_rol/', views.registrar_rol, name='registrar_rol'),
    path('obtener_estatus/', views.obtener_estatus, name='obtener_estatus'),
    path('modificar_rol/', views.modificar_rol, name='modificar_rol'),

]
