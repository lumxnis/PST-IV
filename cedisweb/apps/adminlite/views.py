from django.shortcuts import render

#Vistas 

def index(request):
    return render(request, 'adminlite/index.html')