from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('adminlite.urls')),
    path('accounts/', include('django.contrib.auth.urls')),
    path('', include('examenes.urls')),
    path('', include('insumos.urls')),
    path('', include('pacientes.urls')),
    path('', include('proveedores.urls')),
]
