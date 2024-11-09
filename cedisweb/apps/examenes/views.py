from django.shortcuts import render
from django.contrib.auth.decorators import login_required


##Exámenes
@login_required
def examenes(request):
    return render(request, 'examenes/examenes.html')


