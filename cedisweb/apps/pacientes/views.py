from django.shortcuts import render
from django.contrib.auth.decorators import login_required


##Pacientes
@login_required
def pacientes(request):
    return render(request, 'pacientes/pacientes.html')
