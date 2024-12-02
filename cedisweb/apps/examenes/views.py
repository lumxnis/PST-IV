from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator
from .models import Analisis, Examen, Especialidad, Medico, Profile, Rol, RealizarExamen, Resultado
from django.db.models import Q
import json
from django.utils import timezone
from django.db import connection
from datetime import datetime, date
import os
import re
from django.contrib.auth.hashers import make_password
from django.db import transaction
from django.db.models import F, Value, CharField, Func
from django.db.models.functions import Concat

##Examenes
@login_required
def examenes(request):
    return render(request, 'examenes/examenes.html')

##Listar Examenes
@login_required
@csrf_exempt
def listar_examenes(request):
    if request.method == 'POST':
        try:
            with connection.cursor() as cursor:
                cursor.callproc('sp_listar_examen')
                resultados = cursor.fetchall()
                columnas = [col[0] for col in cursor.description]

            data = [
                {
                    col: (fila[i].strftime('%Y-%m-%d') if isinstance(fila[i], (datetime.date, datetime.datetime)) else fila[i])
                    for i, col in enumerate(columnas)
                }
                for fila in resultados
            ]

            response = {
                "draw": int(request.POST.get('draw', 1)),
                "recordsTotal": len(data),
                "recordsFiltered": len(data),
                "data": data
            }

            return JsonResponse(response)

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)


##Obtener Análisis
@login_required
@csrf_exempt
def obtener_analisis(request):
    if request.method == 'GET':
        try:
            analisis_queryset = Analisis.objects.all()
            analisis_list = [
                {"value": analisis.id, "text": analisis.analisis_nombre}
                for analisis in analisis_queryset
            ]

            response = {
                "status": "success",
                "data": analisis_list
            }
            return JsonResponse(response)

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)


##Registrar Examen
@login_required
@csrf_exempt
def registrar_examen(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            examen_nombre = data.get('examen_nombre').strip().upper()
            analisis_id = data.get('analisis_id_id')

            if not examen_nombre:
                return JsonResponse({'status': 'error', 'message': 'El campo Examen no puede estar vacío.'})

            with connection.cursor() as cursor:
                cursor.callproc('sp_registrar_examen', [examen_nombre, analisis_id])
                resultado = cursor.fetchone()

            if resultado[0] == 1:
                return JsonResponse({'status': 'success', 'message': 'Examen registrado exitosamente.'})
            elif resultado[0] == 2:
                return JsonResponse({'status': 'error', 'message': 'El examen ya existe en el mismo análisis.'})

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)


##Obtener Estatus
@login_required
@csrf_exempt
def cargar_estatus_analisis(request):
    if request.method == 'GET':
        try:
            estatus_list = [{'value': choice[0], 'text': choice[1]} for choice in Examen.EXAMEN_ESTATUS_CHOICES]

            response = {
                "status": "success",
                "data": estatus_list
            }
            return JsonResponse(response)

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)

##Modificar Examen
@login_required
@csrf_exempt
def modificar_examen(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            examen_id = data.get('examen_id')
            examen_nombre = data.get('examen_nombre').strip().upper()
            analisis_id = data.get('analisis_id')
            examen_estatus = data.get('examen_estatus')

            if not examen_nombre:
                return JsonResponse({'status': 'error', 'message': 'El campo Examen no puede estar vacío.'})

            with connection.cursor() as cursor:
                cursor.callproc('sp_modificar_examen', [examen_id, examen_nombre, analisis_id, examen_estatus])
                resultado = cursor.fetchone()

            if resultado[0] == 1:
                return JsonResponse({'status': 'success', 'message': 'Examen modificado exitosamente.'})
            elif resultado[0] == 2:
                return JsonResponse({'status': 'error', 'message': 'El nombre del examen ya existe en el mismo análisis.'})
            else:
                return JsonResponse({'status': 'error', 'message': 'No se pudo modificar el Examen.'})

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)

##########################################################################################################################################################

##Análisis
@login_required
def analisis(request):
    return render(request, 'examenes/analisis.html')

##Listar Análisis
@login_required
@csrf_exempt
def listar_analisis(request):
    if request.method == 'POST':
        draw = int(request.POST.get('draw', 1))
        start = int(request.POST.get('start', 0))
        length = int(request.POST.get('length', 10))
        search_value = request.POST.get('search[value]', '')

        order_column_index = int(request.POST.get('order[0][column]', 0))
        order_column = request.POST.get(f'columns[{order_column_index}][data]', 'analisis_nombre')
        order_direction = request.POST.get('order[0][dir]', 'asc')

        analisis_queryset = Analisis.objects.all()
        if search_value:
            analisis_queryset = analisis_queryset.filter(
                Q(analisis_nombre__icontains=search_value) |
                Q(analisis_fregistro__icontains=search_value)
            )

        if order_direction == 'asc':
            analisis_queryset = analisis_queryset.order_by(order_column)
        else:
            analisis_queryset = analisis_queryset.order_by(f'-{order_column}')

        paginator = Paginator(analisis_queryset, length)
        page_number = (start // length) + 1
        page_obj = paginator.get_page(page_number)

        data = [
            {
                "id": analisis.id,
                "analisis_nombre": analisis.analisis_nombre,
                "analisis_fregistro": analisis.analisis_fregistro,
                "analisis_estatus": analisis.analisis_estatus
            }
            for analisis in page_obj
        ]

        response = {
            "draw": draw,
            "recordsTotal": paginator.count,
            "recordsFiltered": paginator.count,
            "data": data
        }

        return JsonResponse(response)
    else:
        return JsonResponse({"error": "Método no permitido"}, status=405)
    
##Registrar Análisis
@login_required
@csrf_exempt
def registrar_analisis(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            analisis_nombre = data.get('analisis_nombre').strip().upper()

            if not analisis_nombre:
                return JsonResponse({'status': 'error', 'message': 'El campo Análisis no puede estar vacío.'})

            if Analisis.objects.filter(analisis_nombre__iexact=analisis_nombre).exists():
                return JsonResponse({'status': 'error', 'message': 'El análisis ya existe.'})
            
            nuevo_analisis = Analisis.objects.create(
                analisis_nombre=analisis_nombre,
                analisis_fregistro=timezone.now(),
                analisis_estatus='ACTIVO'
            )
            nuevo_analisis.save()

            return JsonResponse({'status': 'success', 'message': 'Análisis registrado exitosamente.'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Método no permitido.'}, status=405)

##Obtener Estatus
@login_required
@csrf_exempt
def obtener_estatus_analisis(request):
    if request.method == 'GET':
        try:
            estatus_choices = Analisis.ANALISIS_ESTATUS_CHOICES
            estatus_data = [{'value': choice[0], 'text': choice[1]} for choice in estatus_choices]

            return JsonResponse({'status': 'success', 'data': estatus_data})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    else:
        return JsonResponse({'status': 'error', 'message': 'Método de solicitud no permitido.'})


##Modificar Análisis
@login_required
@csrf_exempt
def modificar_analisis(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            analisis_id = data.get('analisis_id')
            analisis_nombre = data.get('analisis_nombre').strip().upper()
            analisis_estatus = data.get('analisis_estatus')

            if not analisis_id or not analisis_nombre or not analisis_estatus:
                return JsonResponse({'status': 'error', 'message': 'Todos los campos son obligatorios.'})

            if Analisis.objects.filter(analisis_nombre__iexact=analisis_nombre).exclude(id=analisis_id).exists():
                return JsonResponse({'status': 'error', 'message': 'El análisis ya existe.'})

            analisis = Analisis.objects.get(id=analisis_id)
            analisis.analisis_nombre = analisis_nombre
            analisis.analisis_estatus = analisis_estatus
            analisis.save()

            return JsonResponse({'status': 'success', 'message': 'Análisis modificado exitosamente.'})
        except Analisis.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'El análisis no existe.'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Método no permitido.'}, status=405)

##########################################################################################################################################################

##Medico
@login_required
def medico(request):
    return render(request, 'examenes/medico.html')

##Listar Medicos
@login_required
@csrf_exempt
def listar_medicos(request):
    if request.method == 'POST':
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM listar_medicos()")
            rows = cursor.fetchall()
            columns = [col[0] for col in cursor.description]
            medicos = [dict(zip(columns, row)) for row in rows]
        return JsonResponse({'data': medicos})

    return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)

##Cargar Especialidades
@login_required
@csrf_exempt
def obtener_especialidades(request):
    if request.method == 'GET':
        especialidades = Especialidad.objects.all().values('especialidad_id', 'especialidad_nombre')
        return JsonResponse({'status': 'success', 'data': list(especialidades)}, safe=False)

    return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)

##Cargar Roles
@login_required
@csrf_exempt
def cargar_roles_medico(request):
    if request.method == 'POST':
        roles = Rol.objects.filter(rol_id=3).values('rol_id', 'rol_nombre')
        return JsonResponse({'roles': list(roles)}, safe=False)
    return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)

##Registrar Medico
@login_required
@csrf_exempt
def registrar_medico(request):
    if request.method == 'POST':
        try:
            cedula = request.POST.get('cedula', '').strip()
            nombres = request.POST.get('nombres', '').strip()
            apepat = request.POST.get('apepat', '').strip()
            apemat = request.POST.get('apemat', '').strip()
            telefono = request.POST.get('telefono', '').strip()
            fecha_nacimiento = request.POST.get('fecha_nacimiento', '').strip()
            especialidad_id = request.POST.get('especialidad_id', '').strip()
            direccion = request.POST.get('direccion', '').strip()
            usuario = request.POST.get('usuario', '').strip()
            contrasena = request.POST.get('contrasena', '').strip()
            email = request.POST.get('email', '').strip()
            rol_id = request.POST.get('rol_id', '').strip()
            foto = request.FILES.get('foto')

            if not (cedula and nombres and apepat and apemat and telefono and fecha_nacimiento and especialidad_id and direccion and usuario and contrasena and email and rol_id):
                return JsonResponse({'status': 'error', 'message': 'Todos los campos son obligatorios.'})

            errores = []

            if not re.match(r'^\d{7,10}$', cedula):
                errores.append('La cédula debe contener entre 7 y 10 dígitos.')
            if not re.match(r'^\+58\d{10}$', telefono):
                errores.append('El formato del teléfono es incorrecto. Debe ser +58 seguido de 10 dígitos.')
            if not re.match(r'^[a-zA-Z áéíóúÁÉÍÓÚñÑ]+$', nombres):
                errores.append('El campo de nombres solo debe contener letras.')
            if not re.match(r'^[a-zA-Z áéíóúÁÉÍÓÚñÑ]+$', apepat):
                errores.append('El campo de apellido paterno solo debe contener letras.')
            if not re.match(r'^[a-zA-Z áéíóúÁÉÍÓÚñÑ]+$', apemat):
                errores.append('El campo de apellido materno solo debe contener letras.')
            if Medico.objects.filter(medico_nrodocumento=cedula).exists():
                errores.append('La cédula ya está registrada.')
            if Profile.objects.filter(email=email).exists():
                errores.append('El correo electrónico ya está registrado.')
            if Profile.objects.filter(username=usuario).exists():
                errores.append('El nombre de usuario ya está registrado.')

            if errores:
                return JsonResponse({'status': 'error', 'message': '<br>'.join(errores)})

            especialidad = Especialidad.objects.get(especialidad_id=especialidad_id)

            if not foto:
                nombrefoto = 'users/profile_default.png'
            else:
                nombrefoto = f'users/{usuario}.jpg'
                ruta_foto = os.path.join('media', nombrefoto)
                with open(ruta_foto, 'wb+') as destination:
                    for chunk in foto.chunks():
                        destination.write(chunk)

            with transaction.atomic():
                user = Profile.objects.create(
                    username=usuario,
                    password=make_password(contrasena),
                    email=email,
                    picture=nombrefoto  
                )
                user.rol_id = rol_id  
                user.save()

                medico = Medico.objects.create(
                    medico_nrodocumento=cedula,
                    medico_nombre=nombres,
                    medico_apepat=apepat,
                    medico_apemat=apemat,
                    medico_movil=telefono,
                    medico_fenac=fecha_nacimiento,
                    especialidad=especialidad,
                    medico_direccion=direccion,
                    usuario=user  
                )
            return JsonResponse({'status': 'success', 'message': 'Médico registrado exitosamente.'})
        except Especialidad.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'La especialidad seleccionada no existe.'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})

    return JsonResponse({'status': 'error', 'message': 'Método no permitido.'}, status=405)

##Obtener Medico
@login_required
@csrf_exempt
def obtener_medico(request):
    medico_id = request.GET.get('id', None)
    if medico_id is not None:
        try:
            medico = Medico.objects.get(medico_id=medico_id)
            data = {
                'medico_nrodocumento': medico.medico_nrodocumento,
                'medico_nombre': medico.medico_nombre,
                'medico_apepat': medico.medico_apepat,
                'medico_apemat': medico.medico_apemat,
                'medico_movil': medico.medico_movil,
                'medico_fenac': medico.medico_fenac,
                'medico_direccion': medico.medico_direccion,
                'especialidad_id': medico.especialidad.especialidad_id
            }
            return JsonResponse(data)
        except Medico.DoesNotExist:
            return JsonResponse({'error': 'Médico no encontrado.'}, status=404)
    return JsonResponse({'error': 'Solicitud inválida.'}, status=400)

##Modificar Medico
@login_required
@csrf_exempt
def modificar_medico(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            medico_id = data.get('medico_id')
            medico_nrodocumento = data.get('medico_nrodocumento')
            medico_nombre = data.get('medico_nombre')
            medico_apepat = data.get('medico_apepat')
            medico_apemat = data.get('medico_apemat')
            medico_movil = data.get('medico_movil')
            medico_fenac = data.get('medico_fenac')
            medico_direccion = data.get('medico_direccion')
            especialidad_id = data.get('especialidad_id')

            if not (medico_nrodocumento and medico_nombre and medico_apepat and medico_apemat and medico_movil and medico_fenac and medico_direccion and especialidad_id):
                return JsonResponse({'status': 'error', 'message': 'Todos los campos son obligatorios.'})

            errores = []

            if not re.match(r'^\d{7,10}$', medico_nrodocumento):
                errores.append('La cédula debe contener entre 7 y 10 dígitos.')
            if not re.match(r'^\+58\d{10}$', medico_movil):
                errores.append('El formato del teléfono es incorrecto. Debe ser +58 seguido de 10 dígitos.')
            if not re.match(r'^[a-zA-Z áéíóúÁÉÍÓÚñÑ]+$', medico_nombre):
                errores.append('El campo de nombres solo debe contener letras.')
            if not re.match(r'^[a-zA-Z áéíóúÁÉÍÓÚñÑ]+$', medico_apepat):
                errores.append('El campo de apellido paterno solo debe contener letras.')
            if not re.match(r'^[a-zA-Z áéíóúÁÉÍÓÚñÑ]+$', medico_apemat):
                errores.append('El campo de apellido materno solo debe contener letras.')

            if Medico.objects.filter(medico_nrodocumento=medico_nrodocumento).exclude(medico_id=medico_id).exists():
                errores.append('La cédula ya está registrada.')

            if errores:
                return JsonResponse({'status': 'error', 'message': '<br>'.join(errores)})

            especialidad = Especialidad.objects.get(especialidad_id=especialidad_id)

            medico = Medico.objects.get(medico_id=medico_id)
            medico.medico_nrodocumento = medico_nrodocumento
            medico.medico_nombre = medico_nombre
            medico.medico_apepat = medico_apepat
            medico.medico_apemat = medico_apemat
            medico.medico_movil = medico_movil
            medico.medico_fenac = medico_fenac
            medico.medico_direccion = medico_direccion
            medico.especialidad = especialidad
            medico.save()

            return JsonResponse({'status': 'success', 'message': 'Médico modificado exitosamente.'})
        except Medico.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Médico no encontrado.'}, status=404)
        except Especialidad.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'La especialidad seleccionada no existe.'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})

    return JsonResponse({'status': 'error', 'message': 'Método no permitido.'}, status=405)

##########################################################################################################################################################

##Especialidad
@login_required
def especialidad(request):
    return render(request, 'examenes/especialidad.html')

##Listar Especialidad
@login_required
@csrf_exempt
def listar_especialidades(request):
    if request.method == 'POST':
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM listar_especialidades()")
            rows = cursor.fetchall()

            data = []
            for row in rows:
                data.append({
                    "especialidad_id": row[0],
                    "especialidad_nombre": row[1],
                    "especialidad_fregistro": row[2],
                    "especialidad_estatus": row[3],
                })

            return JsonResponse({"data": data})

    return JsonResponse({'status': 'error', 'message': 'Método no permitido.'}, status=405)

## Registrar Especialidad
@login_required
@csrf_exempt
def registrar_especialidad(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        especialidad_nombre = data.get('especialidad_nombre').strip().upper()

        if not especialidad_nombre:
            return JsonResponse({'status': 'error', 'message': 'El nombre de la especialidad es obligatorio.'})

        try:
            Especialidad.objects.create(
                especialidad_nombre=especialidad_nombre,
                especialidad_fregistro=timezone.now(),  
                especialidad_estatus='ACTIVO'
            )
            return JsonResponse({'status': 'success', 'message': 'Especialidad registrada exitosamente.'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})

    return JsonResponse({'status': 'error', 'message': 'Método no permitido.'}, status=405)


## Modificar Especialidad
@login_required
@csrf_exempt
def modificar_especialidad(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        especialidad_id = data.get('especialidad_id')
        especialidad_nombre = data.get('especialidad_nombre').strip().upper()
        especialidad_estatus = data.get('especialidad_estatus')

        if not especialidad_id or not especialidad_nombre or not especialidad_estatus:
            return JsonResponse({'status': 'error', 'message': 'Todos los campos son obligatorios.'})

        try:
            especialidad = Especialidad.objects.get(especialidad_id=especialidad_id)
            especialidad.especialidad_nombre = especialidad_nombre
            especialidad.especialidad_estatus = especialidad_estatus
            especialidad.save()
            return JsonResponse({'status': 'success', 'message': 'Especialidad modificada exitosamente.'})
        except Especialidad.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'La especialidad no existe.'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})

    return JsonResponse({'status': 'error', 'message': 'Método no permitido.'}, status=405)

##########################################################################################################################################################

##Realizar Examenes
@login_required
def realizar_examenes(request):
    return render(request, 'examenes/realizar_examenes.html')

##Registro Realizar Examenes
@login_required
def registro_realizar_examenes(request):
    return render(request, 'examenes/realizar_examenes_registro.html')

##Listar Realizar Examenes
@login_required
@csrf_exempt
def listar_realizar_examen(request):
    if request.method == 'POST':
        draw = int(request.POST.get('draw', 1))
        start = int(request.POST.get('start', 0))
        length = int(request.POST.get('length', 10))
        search_value = request.POST.get('search[value]', '')
        order_column_index = int(request.POST.get('order[0][column]', 0))
        order_column_name = request.POST.get(f'columns[{order_column_index}][data]', 'id')
        order_direction = request.POST.get('order[0][dir]', 'asc')

        valid_columns = {
            'id': 'id',
            'paciente': 'paciente',
            'medico': 'medico',
            'realizarexamen_estatus': 'realizarexamen_estatus',
            'realizarexamen_fregistro': 'realizarexamen_fregistro',
            'username': 'username',
            'paciente_id' : 'paciente_id'
        }

        order_column = valid_columns.get(order_column_name, 'id')
        if order_direction == 'desc':
            order_column = '-' + order_column

        queryset = RealizarExamen.objects.select_related('paciente_id', 'medico_id').annotate(
            paciente=Concat('paciente_id__paciente_apepaterno', Value(' '), 'paciente_id__paciente_nombres', output_field=CharField()),
            medico=Concat('medico_id__medico_apepat', Value(' '), 'medico_id__medico_nombre', output_field=CharField()),
            username=F('usuario_id__username'),
            paciente_dni=F('paciente_id__paciente_dni')
        )

        total_records = queryset.count()

        if search_value:
            queryset = queryset.filter(
                Q(paciente__icontains=search_value) |
                Q(medico__icontains=search_value) |
                Q(realizarexamen_estatus__icontains=search_value) |
                Q(realizarexamen_fregistro__icontains=search_value) |
                Q(username__icontains=search_value) |
                Q(paciente_dni__icontains=search_value)
            )

        total_filtered = queryset.count()
        queryset = queryset.order_by(order_column)[start:start + length]

        data = list(queryset.values('id', 'realizarexamen_estatus', 'realizarexamen_fregistro', 'paciente', 'medico', 'username', 'paciente_dni'))

        response = {
            "draw": draw,
            "recordsTotal": total_records,
            "recordsFiltered": total_filtered,
            "data": data,
        }
        return JsonResponse(response)
    else:
        response = {'status': 'error', 'message': 'Método no permitido'}
        return JsonResponse(response, status=405)

## Cargar_Select_Examen
@csrf_exempt
def obtener_examenes_por_analisis(request):
    if request.method == 'POST':
        analisis_id = request.POST.get('id')
        try:
            analisis = Analisis.objects.get(id=analisis_id)
            examenes = Examen.objects.filter(analisis_id=analisis.id)
            examenes_options = [[examen.id, examen.examen_nombre] for examen in examenes]
            return JsonResponse({'status': 'success', 'data': examenes_options})
        except Analisis.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Análisis no encontrado'})
    print("Método no permitido")  
    return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)


##Registro Realizar Examen
@login_required
@csrf_exempt
def realizar_examen_registro(request):
    if request.method == 'POST':
        try:
            print("Solicitud recibida con método POST")
            print("Cuerpo de la solicitud:", request.body)

            if request.body:
                data = json.loads(request.body)
                print("Datos recibidos:", data)

                idpaciente = data.get('idpaciente')
                idusuario = data.get('idusuario')
                idmedico = data.get('idmedico')

                if not idpaciente or not idmedico or not idusuario:
                    return JsonResponse({'status': 'error', 'message': 'Debe seleccionar a un paciente, un médico y un usuario.'}, status=400)

                with connection.cursor() as cursor:
                    cursor.execute("SELECT sp_registrar_realizar_examen(%s, %s, %s)", [idpaciente, idusuario, idmedico])
                    new_id = cursor.fetchone()[0]

                return JsonResponse({'id': new_id, 'status': 'success', 'message': 'Examen registrado exitosamente.'}, content_type="application/json")
            else:
                return JsonResponse({'status': 'error', 'message': 'El cuerpo de la solicitud está vacío.'}, status=400)

        except json.JSONDecodeError as e:
            return JsonResponse({'status': 'error', 'message': 'Error de formato JSON.'}, status=400)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    else:
        print("Método no permitido: Se esperaba POST, pero se recibió", request.method)

    return JsonResponse({'status': 'error', 'message': 'Método no permitido.'}, status=405)

###Registro Realizar Examen Detalle
@login_required
@csrf_exempt
def realizar_examen_detalle(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            idexamen = data.get('id')
            examenes = data.get('examen', '').split(',')
            analisis = data.get('analisis', '').split(',')

            if not idexamen or not examenes or not analisis:
                return JsonResponse({'status': 'error', 'message': 'Todos los campos son obligatorios.'}, status=400)
            
            if len(examenes) != len(analisis):
                return JsonResponse({'status': 'error', 'message': 'La cantidad de exámenes y análisis debe ser igual.'}, status=400)
            
            with connection.cursor() as cursor:
                for i in range(len(examenes)):
                    cursor.execute("SELECT sp_registrar_detalle_realizar_examen(%s, %s, %s)", [idexamen, examenes[i], analisis[i]])

            return JsonResponse({'status': 'success', 'message': 'Examen registrado exitosamente.'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Método no permitido.'}, status=405)

##Editar Realizar Examen


##########################################################################################################################################################

##Resultados de Examenes
@login_required
def resultados_examenes(request):
    return render(request, 'examenes/resultados_examenes.html')

##Vista Registro Resultados
@login_required
def registro_resultado(request):
    return render(request, 'examenes/resultados_examenes_registro.html')

##Listar Resultados
@login_required
@csrf_exempt
def listar_resultado_examen(request):
    if request.method == 'POST':
        draw = int(request.POST.get('draw', 1))
        start = int(request.POST.get('start', 0))
        length = int(request.POST.get('length', 10))

        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) FROM resultado")
                total_count = cursor.fetchone()[0]

                cursor.execute("SELECT * FROM sp_listar_resultado_examen() LIMIT %s OFFSET %s", [length, start])
                resultados = cursor.fetchall()
                columnas = [col[0] for col in cursor.description]

            data = [
                {col: fila[i] for i, col in enumerate(columnas)}
                for fila in resultados
            ]

            response = {
                "draw": draw,
                "recordsTotal": total_count,
                "recordsFiltered": total_count,  
                "data": data
            }

            return JsonResponse(response)

        except Exception as e:
            print(f"Error al listar resultados de examen: {e}")
            return JsonResponse({'error': str(e)}, status=500)

    else:
        return JsonResponse({'error': 'Método no permitido'}, status=405)


##LISTADO EXAMENES PENDIENTES
@login_required
@csrf_exempt
def listar_pacientes_examenes(request):
    if request.method == 'POST':
        draw = int(request.POST.get('draw', 1))
        start = int(request.POST.get('start', 0))
        length = int(request.POST.get('length', 10))
        search_value = request.POST.get('search[value]', '')
        order_column_index = int(request.POST.get('order[0][column]', 0))
        order_column_name = request.POST.get(f'columns[{order_column_index}][data]', 'id')
        order_direction = request.POST.get('order[0][dir]', 'asc')

        valid_columns = {
            'paciente_dni': 'paciente_dni',
            'paciente': 'paciente',
            'edad': 'edad'
        }
        
        order_column = valid_columns.get(order_column_name, 'id')

        try:
            with connection.cursor() as cursor:
                query = f"""
                SELECT 
                    realizar_examen.id,
                    realizar_examen.paciente_id_id,
                    paciente.paciente_nombres,
                    paciente.paciente_apepaterno,
                    paciente.paciente_dni,
                    paciente.fecha_nacimiento,
                    realizar_examen.realizarexamen_estatus,
                    realizar_examen.medico_id_id,
                    medico.medico_nombre,
                    medico.medico_apepat,
                    medico.medico_nrodocumento,
                    realizar_examen.realizarexamen_fregistro
                FROM 
                    realizar_examen
                INNER JOIN
                    paciente
                ON 
                    realizar_examen.paciente_id_id = paciente.id
                INNER JOIN
                    medico
                ON 
                    realizar_examen.medico_id_id = medico.medico_id
                WHERE 
                    realizar_examen.realizarexamen_estatus = 'PENDIENTE' AND
                    (paciente.paciente_dni ILIKE %s OR
                    CONCAT(paciente.paciente_apepaterno, ' ', paciente.paciente_nombres) ILIKE %s)
                ORDER BY {order_column} {order_direction}
                OFFSET %s LIMIT %s;
                """
                cursor.execute(query, [f'%{search_value}%', f'%{search_value}%', start, length])
                resultados = cursor.fetchall()
                columnas = [col[0] for col in cursor.description]

            data = [
                {col: fila[i] for i, col in enumerate(columnas)}
                for fila in resultados
            ]

            for d in data:
                fecha_nacimiento = d['fecha_nacimiento']
                if isinstance(fecha_nacimiento, datetime):
                    fecha_nacimiento = fecha_nacimiento.date()
                d['edad'] = calcular_edad(fecha_nacimiento)
                d['paciente'] = f"{d['paciente_apepaterno']} {d['paciente_nombres']}"
                d['medico'] = f"{d['medico_apepat']} {d['medico_nombre']}"
                del d['fecha_nacimiento']
                del d['medico_apepat']
                del d['medico_nombre']

            with connection.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) FROM realizar_examen WHERE realizarexamen_estatus = 'PENDIENTE';")
                total_count = cursor.fetchone()[0]
                cursor.execute("""
                    SELECT COUNT(*) 
                    FROM realizar_examen
                    INNER JOIN paciente ON realizar_examen.paciente_id_id = paciente.id
                    INNER JOIN medico ON realizar_examen.medico_id_id = medico.medico_id
                    WHERE realizar_examen.realizarexamen_estatus = 'PENDIENTE' AND
                    (paciente.paciente_dni ILIKE %s OR
                    CONCAT(paciente.paciente_apepaterno, ' ', paciente.paciente_nombres) ILIKE %s);
                """, [f'%{search_value}%', f'%{search_value}%'])
                filtered_count = cursor.fetchone()[0]

            response = {
                "draw": draw,
                "recordsTotal": total_count,
                "recordsFiltered": filtered_count,
                "data": data
            }

            return JsonResponse(response)

        except Exception as e:
            print(f"Error al listar exámenes: {e}")
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    else:
        return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)

# Función para calcular la edad
def calcular_edad(fecha_nacimiento):
    hoy = date.today()
    edad_anios = hoy.year - fecha_nacimiento.year - ((hoy.month, hoy.day) < (fecha_nacimiento.month, fecha_nacimiento.day))
    if edad_anios > 0:
        return f"{edad_anios} años"
    
    edad_meses = hoy.month - fecha_nacimiento.month - ((hoy.day) < (fecha_nacimiento.day))
    if edad_meses > 0:
        return f"{edad_meses} meses"
    
    edad_dias = (hoy - fecha_nacimiento).days
    return f"{edad_dias} días"

##LISTAR DETALLE ANALISIS 
@login_required
@csrf_exempt
def realizarexamen_detalle(request):
    if request.method == 'POST':
        idexamen = request.POST.get('idexamen')
        draw = int(request.POST.get('draw', 1))  
        
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM SP_LISTAR_DETALLE_ANALISIS_RESULTADO(%s)", [idexamen])
                resultados = cursor.fetchall()
                columnas = [col[0] for col in cursor.description]

            data = [
                {col: fila[i] for i, col in enumerate(columnas)}
                for fila in resultados
            ]

            response = {
                "draw": draw,
                "recordsTotal": len(data),
                "recordsFiltered": len(data),
                "data": data
            }

            return JsonResponse(response)

        except Exception as e:
            print(f"Error al listar detalles del análisis: {e}")
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    else:
        return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)

##REGISTRAR RESULTADO EXAMEN
@login_required
@csrf_exempt
def realizar_resultado_registro(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        idrealizarexamen = data.get('idrealizarexamen')
        idusuario = data.get('idusuario')

        print(f"idrealizarexamen: {idrealizarexamen}, idusuario: {idusuario}")

        try:
            with connection.cursor() as cursor:
                cursor.callproc('SP_REGISTRAR_RESULTADO_EXAMEN', [idrealizarexamen, idusuario])
                
                cursor.execute("SELECT * FROM resultado WHERE realizarexamen_id_id = %s AND usuario_id_id = %s", [idrealizarexamen, idusuario])
                resultado = cursor.fetchone()
                if not resultado:
                    raise Exception("No se pudo registrar el resultado")

            return JsonResponse({'status': 'success', 'message': 'Resultado registrado correctamente.'})

        except Exception as e:
            print(f"Error al registrar resultado: {e}")
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    else:
        return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)
    
##REGISTRAR RESULTADO DETALLE






