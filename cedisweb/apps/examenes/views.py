from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator
from .models import Analisis, Examen
from django.db.models import Q
import json
from django.utils import timezone
from django.db import connection
import datetime


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
                analisis_fregistro=timezone.now()  
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


##Medico
@login_required
def medico(request):
    return render(request, 'examenes/medico.html')

##Especialidad
@login_required
def especialidad(request):
    return render(request, 'examenes/especialidad.html')

##Realizar Examenes
@login_required
def realizar_examenes(request):
    return render(request, 'examenes/realizar_examenes.html')

##Resultados de Examenes
@login_required
def resultados_examenes(request):
    return render(request, 'examenes/resultados_examenes.html')