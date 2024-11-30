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
import os, re
from django.contrib.auth.hashers import make_password
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from datetime import datetime
import json

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
from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect
from .forms import CustomUserCreationForm
from django.conf import settings
import os


##Dashboard
@login_required
def index(request):
    user_id = request.session.get('S_IDUSUARIO')
    return render(request, 'adminlite/index.html', {'user_id': user_id})

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
            usuario = form.save(commit=False)
            
            if 'picture' in request.FILES:
                if usuario.picture and usuario.picture.name != 'users/profile_default.png':
                    old_picture_path = os.path.join(settings.MEDIA_ROOT, usuario.picture.name)
                    if os.path.exists(old_picture_path):
                        os.remove(old_picture_path)
                
                usuario.picture = request.FILES['picture']
            
            usuario.save()
            messages.success(request, 'Tu perfil ha sido actualizado con éxito.')
            return redirect('index')
    else:
        form = ProfileForm(instance=request.user)
    
    return render(request, 'adminlite/edit_profile.html', {'form': form})

## Usuarios
@login_required
def usuarios(request):
    return render (request, 'adminlite/usuarios.html')

## Listar Usuarios
@login_required
@csrf_exempt
def listar_usuarios(request):
    if request.method == 'POST':
        try:
            draw = request.POST.get('draw')
            start = int(request.POST.get('start', 0))
            length = int(request.POST.get('length', 10))
            search_value = request.POST.get('search[value]')

            column_map = {
                0: 'username',
                1: 'email',
                2: 'usu_status',
                3: 'rol__rol_nombre',
                4: 'picture'
            }

            order_column_index = int(request.POST.get('order[0][column]', 0))
            order_column = column_map.get(order_column_index, 'username')
            order_direction = request.POST.get('order[0][dir]', 'asc')

            usuarios = Profile.objects.select_related('rol')
            if search_value:
                usuarios = usuarios.filter(
                    Q(username__icontains=search_value) | Q(email__icontains=search_value)
                )

            if order_direction == 'asc':
                usuarios = usuarios.order_by(order_column)
            else:
                usuarios = usuarios.order_by(f'-{order_column}')

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
        except Exception as e:
            print("Error: ", str(e))
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=400)

## Cargar Roles
@login_required
def cargar_roles(request):
    if request.method == 'POST':
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM sp_listar_select_rol()")
            roles = cursor.fetchall()

        roles_list = [{'rol_id': rol[0], 'rol_nombre': rol[1]} for rol in roles if rol[0] != 3]

        return JsonResponse({'roles': roles_list})
    else:
        return JsonResponse({'error': 'Método no permitido'}, status=400)

## Registrar Usuario
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.db import connection
from django.contrib.auth.hashers import make_password
import os
import re

@login_required
@csrf_exempt
def registrar_usuario(request):
    if request.method == 'POST':
        try:
            usuario = request.POST.get('u')
            contra = request.POST.get('c')
            email = request.POST.get('e')
            rol = request.POST.get('r')
            nombrefoto = request.POST.get('nombrefoto')
            foto = request.FILES.get('foto')

            # Validaciones
            errores = []

            if not usuario or not contra or not email or not rol:
                return JsonResponse({'success': False, 'message': 'Todos los campos son obligatorios.'})

            if not re.match(r'^[a-zA-Z0-9_@.-]+$', usuario):
                errores.append('El nombre de usuario solo debe contener letras, números, y los caracteres especiales _ @ . -')

            if not re.match(r'^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$', contra):
                errores.append('La contraseña debe tener al menos 8 caracteres, incluyendo una letra y un número.')

            if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
                errores.append('El formato del email es incorrecto.')

            if errores:
                return JsonResponse({'success': False, 'message': '<br>'.join(errores)})

            contra_encriptada = make_password(contra)

            if not foto:
                nombrefoto = 'users/profile_default.png'
            else:
                file_path = os.path.join('media/users', nombrefoto)
                with open(file_path, 'wb+') as destination:
                    for chunk in foto.chunks():
                        destination.write(chunk)
                nombrefoto = os.path.join('users', nombrefoto)

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
        usuario = request.POST.get('usuario')
        
        try:

            # Validaciones
            errores = []
            
            if not id or not email or not rol or not usuario:
                return JsonResponse({'status': 'error', 'message': 'Todos los campos son obligatorios.'})
            
            if not re.match(r'^[a-zA-Z0-9_@.-]+$', usuario):
                errores.append('El nombre de usuario solo debe contener letras, números, y los caracteres especiales _ @ . -')
            
            if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
                errores.append('El formato del email es incorrecto.')

            if errores:
                return JsonResponse({'status': 'error', 'message': '<br>'.join(errores)})
            
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


#Modificar Contra
@csrf_exempt
@login_required
def cambiar_contraseña(request):
    if request.method == 'POST':
        try:
            user_id = request.POST.get('id')
            nueva_contraseña = request.POST.get('nueva_contraseña')

            contra_encriptada = make_password(nueva_contraseña)

            usuario = Profile.objects.get(id=user_id)
            usuario.password = contra_encriptada
            usuario.save()

            if request.user.id == usuario.id:
                user = authenticate(username=usuario.username, password=nueva_contraseña)
                if user is not None:
                    login(request, user)
                    return JsonResponse({'status': 'success', 'message': 'Contraseña actualizada correctamente. Redirigiendo...'}, status=200)
                else:
                    return JsonResponse({'status': 'error', 'message': 'No se pudo re-autenticar al usuario.'})
            else:
                return JsonResponse({'status': 'success', 'message': 'Contraseña actualizada correctamente.'})
        except Profile.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Usuario no encontrado.'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    else:
        return JsonResponse({'status': 'error', 'message': 'Método de solicitud no permitido.'})
    

## Roles
@login_required
def roles(request):
    return render (request, 'adminlite/rol.html')

## Listar Roles
@login_required
@csrf_exempt
def listar_roles(request):
    if request.method == 'POST':
        try:
            roles = Rol.objects.all()
            roles_data = []
            for rol in roles:
                roles_data.append({
                    'rol_id': rol.rol_id,
                    'rol': rol.rol_nombre,
                    'fecha_registro': rol.rol_fregistro.strftime('%Y-%m-%d') if rol.rol_fregistro else '',
                    'estatus': rol.rol_estatus
                })
            return JsonResponse({'data': roles_data}, safe=False)
        except Exception as e:
            return JsonResponse({'error': str(e)})
    else:
        return JsonResponse({'error': 'Método de solicitud no permitido.'})
    

## Registrar Rol
@login_required
@csrf_exempt
def registrar_rol(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            rol_nombre = data.get('rol_nombre').strip().upper()

            if not rol_nombre:
                return JsonResponse({'status': 'error', 'message': 'El nombre del rol es obligatorio.'})

            
            if Rol.objects.filter(rol_nombre__iexact=rol_nombre).exists():
                return JsonResponse({'status': 'error', 'message': 'El rol ya existe.'})

            nuevo_rol = Rol(
                rol_nombre=rol_nombre,
                rol_fregistro=datetime.now(),
                rol_estatus='ACTIVO'  
            )
            nuevo_rol.save()

            return JsonResponse({'status': 'success', 'message': 'Rol registrado correctamente.'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    else:
        return JsonResponse({'status': 'error', 'message': 'Método de solicitud no permitido.'})


## Obtener Estatus
@login_required
@csrf_exempt
def obtener_estatus(request):
    if request.method == 'GET':
        try:
            estatus_choices = Rol.ROL_ESTATUS_CHOICES
            estatus_data = [{'value': choice[0], 'text': choice[1]} for choice in estatus_choices]

            return JsonResponse({'status': 'success', 'data': estatus_data})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    else:
        return JsonResponse({'status': 'error', 'message': 'Método de solicitud no permitido.'})
    

## Modificar ROl
@login_required
@csrf_exempt
def modificar_rol(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            rol_id = data.get('rol_id')
            rol_nombre = data.get('rol_nombre').strip().upper()
            rol_estatus = data.get('rol_estatus')

            if not rol_id or not rol_nombre or not rol_estatus:
                return JsonResponse({'status': 'error', 'message': 'Todos los campos son obligatorios.'})

            if Rol.objects.filter(rol_nombre__iexact=rol_nombre).exclude(rol_id=rol_id).exists():
                return JsonResponse({'status': 'error', 'message': 'El rol ya existe.'})

            rol = Rol.objects.get(rol_id=rol_id)
            rol.rol_nombre = rol_nombre
            rol.rol_estatus = rol_estatus
            rol.save()

            return JsonResponse({'status': 'success', 'message': 'Rol modificado correctamente.'})
        except Rol.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'El rol no existe.'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    else:
        return JsonResponse({'status': 'error', 'message': 'Método de solicitud no permitido.'})






