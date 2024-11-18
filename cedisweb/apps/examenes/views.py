from django.shortcuts import render
from django.contrib.auth.decorators import login_required


##Exámenes
@login_required
def examenes(request):
    return render(request, 'examenes/examenes.html')

#Análisis
@login_required
def analisis(request):
    return render(request, 'examenes/analisis.html')

#Medico
@login_required
def medico(request):
    return render(request, 'examenes/medico.html')

#Especialidad
@login_required
def especialidad(request):
    return render(request, 'examenes/especialidad.html')

#Realizar Examenes
@login_required
def realizar_examenes(request):
    return render(request, 'examenes/realizar_examenes.html')

#Resultados de Examenes
@login_required
def resultados_examenes(request):
    return render(request, 'examenes/resultados_examenes.html')