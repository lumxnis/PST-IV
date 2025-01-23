from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from .forms import CustomUserCreationForm 
from django.contrib.auth import authenticate, login
from django.contrib import messages 
from .forms import ProfileForm
from django.http import JsonResponse
from django.core.paginator import Paginator
from .models import Profile, Rol, Profile
from django.db.models import Q, F
from django.db import connection
import os, re
from django.contrib.auth.hashers import make_password
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from datetime import datetime
import json
from django.contrib.auth import views as auth_views
from .forms import CustomAuthenticationForm

#Inicio
def home(request):
    return render(request, 'inicio/home.html')

#Horarios
def horarios(request):
    return render(request, 'inicio/horarios.html')

##Login
@csrf_exempt
def custom_login_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')

            user = authenticate(request, username=username, password=password)

            if user is not None:
                try:
                    profile = Profile.objects.get(username=username)
                    if profile.usu_status == 'INACTIVO' or (profile.rol and profile.rol.rol_estatus == 'INACTIVO'):
                        return JsonResponse({'error': 'Su usuario está desactivado. Comuníquese con el administrador.'}, status=403)
                    else:
                        login(request, user)
                        if profile.rol:  # Verificar si profile.rol no es None
                            request.session['ROL_ID'] = profile.rol.rol_id
                        else:
                            request.session['ROL_ID'] = None  # O manejar de acuerdo a tus necesidades
                        return JsonResponse({'success': 'Inicio de sesión exitoso.'}, status=200)
                except Profile.DoesNotExist:
                    return JsonResponse({'error': 'Usuario no encontrado.'}, status=404)
            else:
                return JsonResponse({'error': 'Credenciales incorrectas, intente de nuevo.'}, status=401)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Formato JSON inválido.'}, status=400)
    return JsonResponse({'error': 'Método no permitido.'}, status=405)

##Logout
def exit(request):
    logout(request)
    return redirect('home')

##Dashboard
@login_required
def index(request):
    user_id = request.session.get('S_IDUSUARIO')
    return render(request, 'adminlite/index.html', {'user_id': user_id})

## Profile
@login_required 
def profile(request):
    user = request.user 
    context = {'user': user}
    return render(request, 'adminlite/profile.html')

def mostrar_usuario(request, user_id):
    user = Profile.objects.get(id=user_id)
    context = {'user': user}
    return render(request, 'adminlite/profile.html', context)

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
                query = Q()
                for column in column_map.values():
                    query |= Q(**{f"{column}__icontains": search_value})
                usuarios = usuarios.filter(query)

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
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT rol_id, rol_nombre, rol_estatus FROM sp_listar_select_rol()")
                roles = cursor.fetchall()

            roles_list = [{'rol_id': rol[0], 'rol_nombre': rol[1]} for rol in roles]

            return JsonResponse({'roles': roles_list})
        except Exception as e:
            return JsonResponse({'error': 'Error al cargar los roles: ' + str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Método no permitido'}, status=400)


## Registrar Usuario
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
            estatus_data = [{'value': choice[0], 'text': choice[1].upper()} for choice in estatus_choices]

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

##Modificar Foto
@login_required
@csrf_exempt
def actualizar_foto(request):
    if request.method == 'POST':
        user_id = request.POST.get('id')
        foto = request.FILES.get('foto')

        if not foto:
            return JsonResponse({'success': False, 'message': 'No se ha proporcionado ninguna foto.'}, status=400)

        # Validación del tipo de archivo
        valid_image_types = ['image/jpeg', 'image/png', 'image/gif']
        if foto.content_type not in valid_image_types:
            return JsonResponse({'success': False, 'message': 'El archivo seleccionado no es una foto válida. Solo se permiten archivos JPEG, PNG y GIF.'}, status=400)

        user = get_object_or_404(Profile, pk=user_id)
        
        # Eliminar la foto anterior si existe
        if user.picture and user.picture.name != 'profile_default.png':
            old_picture_path = os.path.join(settings.MEDIA_ROOT, user.picture.name)
            if os.path.exists(old_picture_path):
                os.remove(old_picture_path)

        user.picture.save(f'{foto.name}', foto)
        user.save()

        new_picture_url = os.path.join(settings.MEDIA_URL, 'users', foto.name)

        return JsonResponse({'success': True, 'message': 'Foto actualizada correctamente', 'new_picture_url': new_picture_url})

    return JsonResponse({'success': False, 'message': 'Método no permitido'}, status=405)

##Notificaiones
@login_required
def listar_notificaciones(request):
    with connection.cursor() as cursor:
        # Consulta para notificaciones
        cursor.execute("SELECT * FROM sp_listar_notificaciones()")
        notificaciones = cursor.fetchall()
        notificaciones_results = [
            {"paciente_nombre": row[0], "realizar_examen_fregistro": str(row[1]), "medico_nombre": row[2]}
            for row in notificaciones
        ]

        # Consulta para stock bajo
        cursor.execute("""
            SELECT producto.nombrep, producto.cantidad
            FROM insumos_productos producto
            WHERE CAST(producto.cantidad AS INTEGER) < 5
        """)
        stock_bajo = cursor.fetchall()
        stock_bajo_results = [
            {"producto_nombre": row[0], "cantidad": row[1]}
            for row in stock_bajo
        ]

    return JsonResponse({"notificaciones": notificaciones_results, "stock_bajo": stock_bajo_results}, safe=False)







