from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

urlpatterns = [
    ##Inicio
    path('', views.home, name='home'),
    
    ##Horarios
    path('horarios/', views.horarios, name="horarios"),

    ##Login
    path('login/', auth_views.LoginView.as_view(template_name='login.html'), name='login'),

    ##Logout
    path('exit/', views.exit, name="exit"),

    ##Dashboard
    path('index/', views.index, name='index'),

    ##Profile
    path('profile/', views.profile, name="profile"),

    ## Usuarios
    path('usuarios/', views.usuarios, name='usuarios'),
    path('listar_usuarios/', views.listar_usuarios, name='listar_usuarios'),
    path('cargar_roles/', views.cargar_roles, name='listar_usuarios'),
    path('registrar_usuario/', views.registrar_usuario, name='registrar_usuario'),
    path('modificar_usuario/',views.modificar_usuario, name='modificar_usuario'),
    path('modificar_usuario_estatus/', views.modificar_usuario_estatus, name='modificar_usuario_estatus'),
    path('cambiar_contraseña/', views.cambiar_contraseña, name='cambiar_contraseña'),
    path('actualizar_foto/', views.actualizar_foto, name='actualizar_foto'),

    ## Roles
    path('roles/', views.roles, name='roles'),
    path('listar_roles/', views.listar_roles, name='listar_roles'),
    path('registrar_rol/', views.registrar_rol, name='registrar_rol'),
    path('obtener_estatus/', views.obtener_estatus, name='obtener_estatus'),
    path('modificar_rol/', views.modificar_rol, name='modificar_rol'),

    ## Notificaciones
    path('listar_notificaciones/', views.listar_notificaciones, name='listar_notificaciones'),
]
