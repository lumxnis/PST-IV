from django.shortcuts import render, redirect
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from .forms import CustomUserCreationForm 
from django.contrib.auth import authenticate, login
from django.contrib import messages 
from .forms import ProfileForm
from django.http import JsonResponse
from django.core.paginator import Paginator
from .models import Profile
from django.db.models import Q, F
from django.db import connection

#Inicio
def home(request):
    return render(request, 'inicio/home.html')

#Horarios
def horarios(request):
    return render(request, 'inicio/horarios.html')

##Logout
def exit(request):
    logout(request)
    return redirect('home')

#Register
def register(request):
    data = {
        'form': CustomUserCreationForm()
    }

    if request.method == 'POST':
        user_creation_form = CustomUserCreationForm(data=request.POST)

        if user_creation_form.is_valid():
            user_creation_form.save()

            user = authenticate(username=user_creation_form.cleaned_data['username'], password=user_creation_form.cleaned_data['password1'])
            login(request, user)
            return redirect('home')
        else:
            data['form'] = user_creation_form

    return render(request, 'registration/register.html', data)


##Dashboard
@login_required
def index(request):
    return render(request, 'adminlite/index.html')

## Profile
@login_required 
def profile(request):
    return render(request, 'adminlite/profile.html')

#Edit Profile
@login_required
def edit_profile(request):
    if request.method == 'POST':
        form = ProfileForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Tu perfil ha sido actualizado con éxito.')
            return redirect('profile')
    else:
        form = ProfileForm(instance=request.user)

    return render(request, 'adminlite/edit_profile.html', {'form': form})

## Usuarios
@login_required
def usuarios(request):
    return render (request, 'adminlite/usuarios.html')

## Listar Usuarios
@login_required
def listar_usuarios(request):
    if request.method == 'POST':
        draw = request.POST.get('draw')
        start = int(request.POST.get('start', 0))
        length = int(request.POST.get('length', 10))
        search_value = request.POST.get('search[value]')

        usuarios = Profile.objects.select_related('rol').all()
        if search_value:
            usuarios = usuarios.filter(
                Q(username__icontains=search_value) | Q(email__icontains=search_value)
            )
        
        usuarios = usuarios.annotate(rol_nombre=F('rol__rol_nombre'))

        paginator = Paginator(usuarios, length)
        page = paginator.get_page(start // length + 1)
        data = list(page.object_list.values('id', 'username', 'email', 'usu_status', 'rol_nombre'))

        response = {
            'draw': draw,
            'recordsTotal': usuarios.count(),
            'recordsFiltered': usuarios.count(),
            'data': data,
        }
        return JsonResponse(response)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=400)


