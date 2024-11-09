from django.shortcuts import render
from django.contrib.auth.decorators import login_required


##Proveedores
@login_required
def proveedores(request):
    return render(request, 'proveedores/proveedores.html')
