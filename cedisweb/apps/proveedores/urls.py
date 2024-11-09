from django.urls import path
from . import views

urlpatterns = [
    ##Proveedores
    path('Proveedores/', views.proveedores, name='proveedores')
]