from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Proveedores
from django.db.models import Q
from django.core.paginator import Paginator
import re
import json
from django.db.models.deletion import RestrictedError

##Proveedores
@login_required
def proveedores(request):
    return render(request, 'proveedores/proveedores.html')

##Listar Proveedores
@login_required
@csrf_exempt
def listar_proveedores(request):
    if request.method == 'POST':
        try:
            draw = int(request.POST.get('draw', 1))
            start = int(request.POST.get('start', 0))
            length = int(request.POST.get('length', 10))
            search_value = request.POST.get('search[value]', '')


            column_map = {
                0: 'cedula_prov',
                1: 'rif',
                2: 'nombre_prov',
                3: 'apellido_prov',
                4: 'direccion_prov',
                5: 'telefono_prov',
                6: 'email_prov'
            }

            order_column_index = int(request.POST.get('order[0][column]', 0))
            order_column = column_map.get(order_column_index, 'cedula_prov')
            order_direction = request.POST.get('order[0][dir]', 'asc')


            proveedores = Proveedores.objects.all()
            if search_value:
                proveedores = proveedores.filter(
                    Q(cedula_prov__icontains=search_value) |
                    Q(rif__icontains=search_value) |
                    Q(nombre_prov__icontains=search_value) |
                    Q(apellido_prov__icontains=search_value) |
                    Q(direccion_prov__icontains=search_value) |
                    Q(telefono_prov__icontains=search_value) |
                    Q(email_prov__icontains=search_value)
                )

            if order_direction == 'asc':
                proveedores = proveedores.order_by(order_column)
            else:
                proveedores = proveedores.order_by(f'-{order_column}')

            paginator = Paginator(proveedores, length)
            page_number = (start // length) + 1
            page_obj = paginator.get_page(page_number)

            data = [
                {
                    "cedula_prov": proveedor.cedula_prov,
                    "rif": proveedor.rif,
                    "nombre_prov": proveedor.nombre_prov,
                    "apellido_prov": proveedor.apellido_prov,
                    "direccion_prov": proveedor.direccion_prov,
                    "telefono_prov": proveedor.telefono_prov,
                    "email_prov": proveedor.email_prov,
                }
                for proveedor in page_obj
            ]

            response = {
                "draw": draw,
                "recordsTotal": paginator.count,
                "recordsFiltered": paginator.count,
                "data": data
            }

            return JsonResponse(response)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({"error": "Método no permitido"}, status=405)

##Registrar Proveedores
@login_required
@csrf_exempt
def registrar_prov(request):
    if request.method == 'POST':
        try:
            ci = request.POST.get('c', '').strip()
            rif = request.POST.get('r', '').strip()
            nombre = request.POST.get('n', '').strip()
            apellido = request.POST.get('a', '').strip()
            direccion = request.POST.get('d', '').strip()
            telefono = request.POST.get('t', '').strip()
            email = request.POST.get('e', '').strip()

            if not (ci and rif and nombre and apellido and direccion and telefono and email):
                return JsonResponse({'success': False, 'message': 'Todos los campos son obligatorios.'})

            errores = []

            if not re.match(r'^\d{7,10}$', ci):
                errores.append('La cédula debe contener entre 7 y 10 dígitos.')
            if not re.match(r'^\+58\d{10}$', telefono):
                errores.append('El formato del teléfono es incorrecto. Debe ser +58 seguido de 10 dígitos.')
            if not re.match(r'^[a-zA-Z áéíóúÁÉÍÓÚñÑ]+$', nombre):
                errores.append('El campo de nombre solo debe contener letras.')
            if not re.match(r'^[a-zA-Z áéíóúÁÉÍÓÚñÑ]+$', apellido):
                errores.append('El campo de apellido solo debe contener letras.')
            if Proveedores.objects.filter(cedula_prov=ci).exists():
                errores.append('El proveedor con esta cédula ya existe.')
            if Proveedores.objects.filter(email_prov=email).exists():
                errores.append('El proveedor con este email ya existe.')
            if Proveedores.objects.filter(rif__iexact=rif).exists():
                errores.append('El proveedor con este rif ya existe.')

            if errores:
                return JsonResponse({'success': False, 'message': '<br>'.join(errores)})

            proveedor = Proveedores(
                cedula_prov=ci,
                rif=rif,
                nombre_prov=nombre,
                apellido_prov=apellido,
                direccion_prov=direccion,
                telefono_prov=telefono,
                email_prov=email
            )
            proveedor.save()
            return JsonResponse({'success': True, 'message': 'Proveedor registrado exitosamente.'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)})

    return JsonResponse({'success': False, 'message': 'Método no permitido'}, status=405)

##Modificar Proveedores
@login_required
@csrf_exempt
def modificar_prov(request):
    if request.method == 'POST':
        try:
            cedula = request.POST.get('cedula', '').strip()
            rif = request.POST.get('rif', '').strip()
            nombre = request.POST.get('nombre', '').strip()
            apellido = request.POST.get('apellido', '').strip()
            direccion = request.POST.get('direccion', '').strip()
            telefono = request.POST.get('telefono', '').strip()
            email = request.POST.get('email', '').strip()

            if not (cedula and rif and nombre and apellido and direccion and telefono and email):
                return JsonResponse({'status': 'error', 'message': 'Todos los campos son obligatorios.'})

            errores = []

            if not re.match(r'^\d{8,10}$', cedula):
                errores.append('La cédula debe contener entre 8 y 10 dígitos.')
            if not re.match(r'^\+58\d{10}$', telefono):
                errores.append('El formato del teléfono es incorrecto. Debe ser +58 seguido de 10 dígitos.')
            if not re.match(r'^[a-zA-Z áéíóúÁÉÍÓÚñÑ]+$', nombre):
                errores.append('El campo de nombre solo debe contener letras.')
            if not re.match(r'^[a-zA-Z áéíóúÁÉÍÓÚñÑ]+$', apellido):
                errores.append('El campo de apellido solo debe contener letras.')
            if Proveedores.objects.filter(email_prov=email).exclude(cedula_prov=cedula).exists():
                errores.append('El proveedor con este email ya existe.')
            if Proveedores.objects.filter(rif__iexact=rif).exclude(cedula_prov=cedula).exists():
                errores.append('El proveedor con este rif ya existe.')

            if errores:
                return JsonResponse({'status': 'error', 'message': '<br>'.join(errores)})

            try:
                proveedor = Proveedores.objects.get(cedula_prov=cedula)
                proveedor.rif = rif
                proveedor.nombre_prov = nombre
                proveedor.apellido_prov = apellido
                proveedor.direccion_prov = direccion
                proveedor.telefono_prov = telefono
                proveedor.email_prov = email
                proveedor.save()
                return JsonResponse({'status': 'success', 'message': 'Proveedor actualizado exitosamente.'})
            except Proveedores.DoesNotExist:
                return JsonResponse({'status': 'error', 'message': 'El proveedor no existe.'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})

    return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)


##Eliminar Proveedor
@login_required
@csrf_exempt
def eliminar_prov(request):
    if request.method == 'POST':
        cedula = request.POST.get('cedula')

        if not cedula:
            return JsonResponse({'status': 'error', 'message': 'La cédula es obligatoria.'})

        try:
            proveedor = Proveedores.objects.get(cedula_prov=cedula)

            try:
                proveedor.delete()
                return JsonResponse({'status': 'success', 'message': 'Proveedor eliminado exitosamente.'})
            except RestrictedError:
                return JsonResponse({'status': 'error', 'message': 'El proveedor se encuentra asociado a insumos en stock.'})
            except Exception as e:
                return JsonResponse({'status': 'error', 'message': str(e)})
        except Proveedores.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'El proveedor no existe.'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})

    return JsonResponse({'status': 'error', 'message': 'Método no permitido.'}, status=405)







