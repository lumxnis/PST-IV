from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator
from .models import Productos
from django.db.models import Q
from .models import Proveedores

##Insumos
@login_required
def insumos(request):
    return render(request, 'insumos/insumos.html')

##Listar Insumos 
@login_required
@csrf_exempt
def listar_insumos(request):
    if request.method == 'POST':
        try:
            draw = int(request.POST.get('draw', 1))
            start = int(request.POST.get('start', 0))
            length = int(request.POST.get('length', 10))
            search_value = request.POST.get('search[value]', '')

            column_map = {
                0: 'codigo',
                1: 'nombrep',
                2: 'cantidad',
                3: 'proveedor__nombre_prov',
                4: 'descripcion'
            }

            order_column_index = int(request.POST.get('order[0][column]', 0))
            order_column = column_map.get(order_column_index, 'codigo')
            order_direction = request.POST.get('order[0][dir]', 'asc')

            insumos = Productos.objects.all()
            if search_value:
                query = Q()
                for column in column_map.values():
                    query |= Q(**{f"{column}__icontains": search_value})
                insumos = insumos.filter(query)

            # Ordenar los datos
            if order_direction == 'asc':
                insumos = insumos.order_by(order_column)
            else:
                insumos = insumos.order_by(f'-{order_column}')

            paginator = Paginator(insumos, length)
            page_number = (start // length) + 1
            page_obj = paginator.get_page(page_number)

            data = [
                {
                    "codigo": insumo.codigo,
                    "nombrep": insumo.nombrep,
                    "cantidad": insumo.cantidad,
                    "nombre_prov": f"{insumo.proveedor.nombre_prov} {insumo.proveedor.apellido_prov}",
                    "descripcion": insumo.descripcion
                }
                for insumo in page_obj
            ]

            response = {
                "draw": draw,
                "recordsTotal": paginator.count,
                "recordsFiltered": paginator.count,
                "data": data
            }

            return JsonResponse(response)
        except Exception as e:
            print("Error: ", str(e))
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({"error": "Método no permitido"}, status=405)


## Cargar Proveedores
@login_required
@csrf_exempt
def cargar_provs(request):
    if request.method == 'POST':
        proveedores = Proveedores.objects.all().values('cedula_prov', 'nombre_prov', 'apellido_prov')
        return JsonResponse({"proveedores": list(proveedores)})

    return JsonResponse({"error": "Método no permitido"}, status=405)

##Registrar Insumos
@login_required
@csrf_exempt
def registrar_insumo(request):
    if request.method == 'POST':
        codigo = request.POST.get('c').strip().lower()
        nombrep = request.POST.get('n').strip()
        stock = request.POST.get('s').strip()
        proveedor_cedula = request.POST.get('p').strip()
        descripcion = request.POST.get('d').strip()

        if not all([codigo, nombrep, stock, proveedor_cedula, descripcion]):
            return JsonResponse({'success': False, 'message': 'Todos los campos son obligatorios.'})

        errores = []

        if Productos.objects.filter(codigo__iexact=codigo).exists():
            errores.append('El código ya existe.')

        if not stock.isdigit() or int(stock) <= 0:
            errores.append('El stock debe ser un número entero positivo.')

        if errores:
            return JsonResponse({'success': False, 'message': '<br>'.join(errores)})

        try:
            proveedor = Proveedores.objects.get(cedula_prov=proveedor_cedula)
            Productos.objects.create(
                codigo=codigo,
                nombrep=nombrep,
                cantidad=int(stock),
                proveedor=proveedor,
                descripcion=descripcion
            )
            return JsonResponse({'success': True, 'message': 'Insumo registrado exitosamente.'})
        except Proveedores.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Proveedor no encontrado.'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)})

    return JsonResponse({'success': False, 'message': 'Método no permitido.'}, status=405)

##Modificar Insumos
@login_required
@csrf_exempt
def modificar_insumo(request):
    if request.method == 'POST':
        codigo = request.POST.get('codigo').strip().lower()
        nombrep = request.POST.get('nombrep').strip()
        stock = request.POST.get('stock').strip()
        proveedor_cedula = request.POST.get('proveedor').strip()
        descripcion = request.POST.get('descripcion').strip()

        if not all([codigo, nombrep, stock, proveedor_cedula, descripcion]):
            return JsonResponse({'status': 'error', 'message': 'Todos los campos son obligatorios.'})

        # Validaciones adicionales
        errores = []

        if Productos.objects.filter(codigo__iexact=codigo).exists() and Productos.objects.get(codigo=codigo).codigo != codigo:
            errores.append('El código ya existe.')

        # Validar el stock (debe ser un número entero positivo)
        if not stock.isdigit() or int(stock) <= 0:
            errores.append('El stock debe ser un número entero positivo.')

        if errores:
            return JsonResponse({'status': 'error', 'message': '<br>'.join(errores)})

        try:
            insumo = Productos.objects.get(codigo=codigo)
            proveedor = Proveedores.objects.get(cedula_prov=proveedor_cedula)
            insumo.nombrep = nombrep
            insumo.cantidad = int(stock)
            insumo.proveedor = proveedor
            insumo.descripcion = descripcion
            insumo.save()

            return JsonResponse({'status': 'success', 'message': 'Insumo actualizado exitosamente.'})
        except Productos.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Insumo no encontrado.'})
        except Proveedores.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Proveedor no encontrado.'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})

    return JsonResponse({'status': 'error', 'message': 'Método no permitido.'}, status=405)

##ELIMINAR INSUMOS
@login_required
@csrf_exempt
def eliminar_insumo(request):
    if request.method == 'POST':
        codigo = request.POST.get('codigo')

        if not codigo:
            return JsonResponse({'status': 'error', 'message': 'El código es obligatorio.'})

        try:
            insumo = Productos.objects.get(codigo=codigo)
            insumo.delete()
            return JsonResponse({'status': 'success', 'message': 'Insumo eliminado exitosamente.'})
        except Productos.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'El insumo no existe.'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})

    return JsonResponse({'status': 'error', 'message': 'Método no permitido.'}, status=405)






