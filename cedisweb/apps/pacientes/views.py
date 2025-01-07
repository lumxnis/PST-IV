from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
import json
import re
from .models import Paciente
from datetime import date, datetime


##Pacientes
@login_required
def pacientes(request):
    return render(request, 'pacientes/pacientes.html')

##Calcular Edad
def calcular_edad(fecha_nacimiento):
    hoy = datetime.today()
    edad_anios = hoy.year - fecha_nacimiento.year - ((hoy.month, hoy.day) < (fecha_nacimiento.month, fecha_nacimiento.day))
    if edad_anios > 0:
        return f"{edad_anios} años"
    
    edad_meses = hoy.month - fecha_nacimiento.month - ((hoy.day) < (fecha_nacimiento.day))
    if edad_meses > 0:
        return f"{edad_meses} meses"
    
    edad_dias = (hoy - fecha_nacimiento).days
    return f"{edad_dias} días"

#Listar Pacientes
@login_required
@csrf_exempt
def listar_pacientes(request):
    if request.method == 'POST':
        draw = int(request.POST.get('draw', 1))
        start = int(request.POST.get('start', 0))
        length = int(request.POST.get('length', 10))
        search_value = request.POST.get('search[value]', '')
        order_column_index = int(request.POST.get('order[0][column]', 0))
        order_column_name = request.POST.get(f'columns[{order_column_index}][data]', 'date_joined')
        order_direction = request.POST.get('order[0][dir]', 'desc')  # Cambiar a 'desc' para ordenar descendente por defecto

        valid_columns = {
            'paciente_dni': 'paciente_dni',
            'paciente': 'paciente',
            'paciente_celular': 'paciente_celular',
            'fecha_nacimiento': 'fecha_nacimiento',
            'paciente_sexo': 'paciente_sexo',
            'date_joined': 'date_joined'
        }
        
        order_column = valid_columns.get(order_column_name, 'date_joined')  # Ordenar por 'date_joined'

        try:
            with connection.cursor() as cursor:
                query = f"""
                SELECT 
                    id,
                    paciente_dni,
                    CONCAT(paciente_apepaterno, ' ', paciente_apematerno, ' ', paciente_nombres) AS paciente,
                    paciente_celular,
                    fecha_nacimiento,
                    paciente_sexo,
                    date_joined
                FROM public.paciente
                WHERE 
                    paciente_dni ILIKE %s OR
                    CONCAT(paciente_apepaterno, ' ', paciente_apematerno, ' ', paciente_nombres) ILIKE %s OR
                    paciente_celular ILIKE %s OR
                    paciente_sexo ILIKE %s
                ORDER BY {order_column} {order_direction}
                OFFSET %s LIMIT %s;
                """
                cursor.execute(query, [f'%{search_value}%', f'%{search_value}%', f'%{search_value}%', f'%{search_value}%', start, length])
                resultados = cursor.fetchall()
                columnas = [col[0] for col in cursor.description]

            data = [
                {col: fila[i] for i, col in enumerate(columnas)}
                for fila in resultados
            ]

            for d in data:
                fecha_nacimiento_str = d['fecha_nacimiento'].strftime('%Y-%m-%d')
                fecha_nacimiento = datetime.strptime(fecha_nacimiento_str, '%Y-%m-%d')
                d['edad'] = calcular_edad(fecha_nacimiento)
                del d['fecha_nacimiento']

            with connection.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) FROM public.paciente;")
                total_count = cursor.fetchone()[0]
                cursor.execute("SELECT COUNT(*) FROM public.paciente WHERE paciente_dni ILIKE %s OR CONCAT(paciente_apepaterno, ' ', paciente_apematerno, ' ', paciente_nombres) ILIKE %s OR paciente_celular ILIKE %s OR paciente_sexo ILIKE %s;", [f'%{search_value}%', f'%{search_value}%', f'%{search_value}%', f'%{search_value}%'])
                filtered_count = cursor.fetchone()[0]

            response = {
                "draw": draw,
                "recordsTotal": total_count,
                "recordsFiltered": filtered_count,
                "data": data
            }

            return JsonResponse(response)

        except Exception as e:
            print(f"Error al listar pacientes: {e}")
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    else:
        return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)

##Cargar Sexo
@login_required
def obtener_sexo(request):
    if request.method == 'GET':
        try:
            sexo_choices = Paciente.SEXO_CHOICES
            estatus_data = [{'value': choice[0], 'text': choice[1]} for choice in sexo_choices]

            return JsonResponse({'status': 'success', 'data': estatus_data})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    else:
        return JsonResponse({'status': 'error', 'message': 'Método de solicitud no permitido.'})

##Registrar Paciente
@login_required
@csrf_exempt
def registrar_paciente(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            ci = data.get('ci', '').strip()
            nombres = data.get('nombres', '').strip()
            apepat = data.get('apepat', '').strip()
            apemat = data.get('apemat', '').strip()
            tlf = data.get('tlf', '').strip()
            fecha_nacimiento = data.get('fecha_nacimiento', '').strip()
            sexo = data.get('sexo', '').strip().upper()

            if not (ci and nombres and apepat and apemat and tlf and fecha_nacimiento and sexo):
                return JsonResponse({'status': 'error', 'message': 'Todos los campos son obligatorios.'})

            errores = []

            if not re.match(r'^\d{7,10}$', ci):
                errores.append('La cédula debe contener entre 7 y 10 dígitos.')
            if not re.match(r'^\+58\d{10}$', tlf):
                errores.append('El formato del teléfono es incorrecto. Debe ser +58 seguido de 10 dígitos.')
            if not re.match(r'^[a-zA-Z áéíóúÁÉÍÓÚñÑ]+$', nombres):
                errores.append('El campo de nombres solo debe contener letras.')
            if not re.match(r'^[a-zA-Z áéíóúÁÉÍÓÚñÑ]+$', apepat):
                errores.append('El campo de apellido paterno solo debe contener letras.')
            if not re.match(r'^[a-zA-Z áéíóúÁÉÍÓÚñÑ]+$', apemat):
                errores.append('El campo de apellido materno solo debe contener letras.')
            if Paciente.objects.filter(paciente_dni=ci).exists():
                errores.append('Ya existe un paciente registrado con esa cédula de identidad.')

            if errores:
                return JsonResponse({'status': 'error', 'message': '<br>'.join(errores)})

            nuevo_paciente = Paciente(
                paciente_nombres=nombres,
                paciente_apepaterno=apepat,
                paciente_apematerno=apemat,
                paciente_dni=ci,
                paciente_celular=tlf,
                fecha_nacimiento=fecha_nacimiento,
                paciente_sexo=sexo
            )
            nuevo_paciente.save()
            return JsonResponse({'status': 'success', 'message': 'Paciente registrado correctamente.'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})

    return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)

##Obtener Paciente
@login_required
def obtener_paciente(request):
    paciente_id = request.GET.get('id')
    try:
        paciente = Paciente.objects.get(id=paciente_id)
        data = {
            'paciente_dni': paciente.paciente_dni,
            'paciente_nombres': paciente.paciente_nombres,
            'paciente_apepaterno': paciente.paciente_apepaterno,
            'paciente_apematerno': paciente.paciente_apematerno,
            'paciente_celular': paciente.paciente_celular,
            'fecha_nacimiento': paciente.fecha_nacimiento,
            'paciente_sexo': paciente.paciente_sexo,
        }
        return JsonResponse(data)
    except Paciente.DoesNotExist:
        return JsonResponse({'error': 'Paciente no encontrado'}, status=404)

## Modificar Paciente
@login_required
@csrf_exempt
def modificar_paciente(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            paciente_id = data.get('id', '').strip()
            ci = data.get('ci', '').strip()
            nombres = data.get('nombres', '').strip()
            apepat = data.get('apepat', '').strip()
            apemat = data.get('apemat', '').strip()
            celular = data.get('celular', '').strip()
            fecha_nacimiento = data.get('fecha_nacimiento', '').strip()
            sexo = data.get('sexo', '').strip().upper()


            if not (paciente_id and ci and nombres and apepat and apemat and celular and fecha_nacimiento and sexo):
                return JsonResponse({'status': 'error', 'message': 'Todos los campos son obligatorios.'})
            
            errores = []

            if not re.match(r'^\d{7,10}$', ci):
                errores.append('La cédula debe contener entre 7 y 10 dígitos.')
            if not re.match(r'^\+58\d{10}$', celular):
                errores.append('El formato del teléfono es incorrecto. Debe ser +58 seguido de 10 dígitos.')
            if not re.match(r'^[a-zA-Z áéíóúÁÉÍÓÚñÑ]+$', nombres):
                errores.append('El campo de nombres solo debe contener letras.')
            if not re.match(r'^[a-zA-Z áéíóúÁÉÍÓÚñÑ]+$', apepat):
                errores.append('El campo de apellido paterno solo debe contener letras.')
            if not re.match(r'^[a-zA-Z áéíóúÁÉÍÓÚñÑ]+$', apemat):
                errores.append('El campo de apellido materno solo debe contener letras.')

            if errores:
                return JsonResponse({'status': 'error', 'message': '<br>'.join(errores)})

            try:
                paciente = Paciente.objects.get(id=paciente_id)
                paciente.paciente_dni = ci
                paciente.paciente_nombres = nombres
                paciente.paciente_apepaterno = apepat
                paciente.paciente_apematerno = apemat
                paciente.paciente_celular = celular
                paciente.fecha_nacimiento = fecha_nacimiento
                paciente.paciente_sexo = sexo
                paciente.save()
                return JsonResponse({'status': 'success', 'message': 'Paciente modificado exitosamente.'})
            except Paciente.DoesNotExist:
                return JsonResponse({'status': 'error', 'message': 'Paciente no encontrado.'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})

    return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)






