from django.urls import path
from . import views

urlpatterns = [
    ##Insumos
    path('insumos/', views.insumos, name='insumos')
]