from django.urls import path
from . import views

urlpatterns = [
    ##Insumos
    path('insumos/', views.insumos, name='insumos'),
    path('listar_insumos/', views.listar_insumos, name='listar_insumos'),
    path('cargar_provs/', views.cargar_provs, name='cargar_provs'),
    path('registrar_insumo/', views.registrar_insumo, name='registrar_insumo'),
    path('modificar_insumo/', views.modificar_insumo, name='modificar_insumo'),
    path('eliminar_insumo/', views.eliminar_insumo, name='eliminar_insumo')
]