from django.shortcuts import render, redirect
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from .forms import CustomUserCreationForm 
from django.contrib.auth import authenticate, login
from django.contrib import messages 
from .forms import ProfileForm
from django.http import JsonResponse
from django.core.paginator import Paginator
from .models import Profile, Rol
from django.db.models import Q, F
from django.db import connection
import os
from django.contrib.auth.hashers import make_password
from django.views.decorators.csrf import csrf_exempt


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

        usuarios = Profile.objects.select_related('rol').order_by('-date_joined')
        if search_value:
            usuarios = usuarios.filter(
                Q(username__icontains=search_value) | Q(email__icontains=search_value)
            )
        
        usuarios = usuarios.annotate(rol_nombre=F('rol__rol_nombre'))

        paginator = Paginator(usuarios, length)
        page = paginator.get_page(start // length + 1)
        data = list(page.object_list.values('id', 'username', 'email', 'usu_status', 'rol_nombre', 'picture'))

        response = {
            'draw': draw,
            'recordsTotal': usuarios.count(),
            'recordsFiltered': usuarios.count(),
            'data': data,
        }
        return JsonResponse(response)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=400)
    

## Cargar Roles
@login_required
def cargar_roles(request):
    if request.method == 'POST':
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM sp_listar_select_rol()")
            roles = cursor.fetchall()

        roles_list = [{'rol_id': rol[0], 'rol_nombre': rol[1]} for rol in roles]

        return JsonResponse({'roles': roles_list})
    else:
        return JsonResponse({'error': 'Método no permitido'}, status=400)
    

## Registrar Usuario
@login_required
def registrar_usuario(request):
    if request.method == 'POST':
        try:
            usuario = request.POST.get('u')
            contra = request.POST.get('c')
            email = request.POST.get('e')
            rol = request.POST.get('r')
            nombrefoto = request.POST.get('nombrefoto')
            foto = request.FILES.get('foto')

            contra_encriptada = make_password(contra)

            if not foto:
                nombrefoto = 'profile_default.png'
            else:
                with open(os.path.join('media/users', nombrefoto), 'wb+') as destination:
                    for chunk in foto.chunks():
                        destination.write(chunk)

            with connection.cursor() as cursor:
                cursor.callproc('sp_registrar_usuario', [usuario, contra_encriptada, email, rol, nombrefoto])
                result = cursor.fetchone()

            if result and result[0] == 1:
                return JsonResponse({'success': True, 'message': 'Usuario registrado correctamente.'})
            elif result and result[0] == 2:
                return JsonResponse({'success': False, 'message': 'El usuario ya existe.'})
            else:
                return JsonResponse({'success': False, 'message': 'Error al registrar el usuario.'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)})
    else:
        return JsonResponse({'success': False, 'message': 'Método de solicitud no permitido.'})
    

## Modificar Usuario
@login_required
@csrf_exempt
def modificar_usuario(request):
    if request.method == 'POST':
        id = request.POST.get('id')
        email = request.POST.get('email')
        rol = request.POST.get('rol')
        
        try:
            print(f"Received data: id={id}, email={email}, rol={rol}")

            with connection.cursor() as cursor:
                cursor.callproc('modificar_usuario', [id, email, rol])
            
            return JsonResponse({'status': 'success', 'message': 'Datos actualizados!'})
        
        except Exception as e:

            print(f"Error during procedure call: {str(e)}")
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)

## Modificar Estatus Usuario
@login_required
@csrf_exempt
def modificar_usuario_estatus(request):
    if request.method == 'POST':
        id = request.POST.get('id')
        estatus = request.POST.get('estatus')
        
        try:
            print(f"Received data: id={id}, estatus={estatus}")
            
            with connection.cursor() as cursor:
                cursor.callproc('sp_modificar_usuario_estatus', [id, estatus])
            
            return JsonResponse({'status': 'success', 'message': 'Estatus actualizado exitosamente'})
        
        except Exception as e:
            print(f"Error during procedure call: {str(e)}")
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)










