from django.shortcuts import render
from django.contrib.auth.decorators import login_required


##Insumos
@login_required
def insumos(request):
    return render(request, 'insumos/insumos.html')
