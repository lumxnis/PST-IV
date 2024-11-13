from django.urls import path
from . import views

urlpatterns = [
    ##Proveedores
    path('Proveedores/', views.proveedores, name='proveedores'),
    path('listar_proveedores/', views.listar_proveedores, name='listar_proveedores'),
    path('registrar_prov/', views.registrar_prov, name='registrar_prov'),
    path('modificar_prov/', views.modificar_prov, name='modificar_prov'),
    path('eliminar_prov/', views.eliminar_prov, name='eliminar_prov')
]