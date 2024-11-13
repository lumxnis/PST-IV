from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Proveedores
from django.db.models import Q

##Proveedores
@login_required
def proveedores(request):
    return render(request, 'proveedores/proveedores.html')


##Listar Proveedores
@login_required
@csrf_exempt
def listar_proveedores(request):
    if request.method == 'POST':
        start = int(request.POST.get('start', 0))
        length = int(request.POST.get('length', 10))
        search_value = request.POST.get('search[value]', '')

        proveedores = Proveedores.objects.all().order_by('-date_joined')

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

        total_proveedores = proveedores.count()
        proveedores = proveedores[start:start + length]

        data = [
            {
                "cedula_prov": proveedor.cedula_prov,
                "rif": proveedor.rif,
                "nombre_prov": proveedor.nombre_prov,
                "apellido_prov": proveedor.apellido_prov,
                "direccion_prov": proveedor.direccion_prov,
                "telefono_prov": proveedor.telefono_prov,
                "email_prov": proveedor.email_prov,
            } for proveedor in proveedores
        ]

        return JsonResponse({
            "draw": int(request.POST.get('draw', 1)),
            "recordsTotal": total_proveedores,
            "recordsFiltered": total_proveedores,
            "data": data
        })
    return JsonResponse({"error": "Método no permitido"}, status=405)


##Registrar Proveedores
@login_required
@csrf_exempt
def registrar_prov(request):
    if request.method == 'POST':
        ci = request.POST.get('c')
        rif = request.POST.get('r')
        nombre = request.POST.get('n')
        apellido = request.POST.get('a')
        direccion = request.POST.get('d')
        telefono = request.POST.get('t')
        email = request.POST.get('e')

        if not all([ci, rif, nombre, apellido, direccion, telefono, email]):
            return JsonResponse({'success': False, 'message': 'Todos los campos son obligatorios.'})

        if Proveedores.objects.filter(cedula_prov=ci).exists():
            return JsonResponse({'success': False, 'message': 'El proveedor con esta cédula ya existe.'})

        if Proveedores.objects.filter(email_prov=email).exists():
            return JsonResponse({'success': False, 'message': 'El proveedor con este email ya existe.'})

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
    return JsonResponse({'success': False, 'message': 'Método no permitido.'}, status=405)


##Modificar Proveedores
@login_required
@csrf_exempt
def modificar_prov(request):
    if request.method == 'POST':
        cedula = request.POST.get('cedula')
        rif = request.POST.get('rif')
        nombre = request.POST.get('nombre')
        apellido = request.POST.get('apellido')
        direccion = request.POST.get('direccion')
        telefono = request.POST.get('telefono')
        email = request.POST.get('email')

        if not all([cedula, rif, nombre, apellido, direccion, telefono, email]):
            return JsonResponse({'status': 'error', 'message': 'Todos los campos son obligatorios.'})

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

    return JsonResponse({'status': 'error', 'message': 'Método no permitido.'}, status=405)

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
            proveedor.delete()
            return JsonResponse({'status': 'success', 'message': 'Proveedor eliminado exitosamente.'})
        except Proveedores.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'El proveedor no existe.'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})

    return JsonResponse({'status': 'error', 'message': 'Método no permitido.'}, status=405)



