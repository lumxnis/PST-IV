from django.urls import path
from . import views
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [

    ##Examenes
    path('examenes/', views.examenes, name='examenes'),
    path('listar_examenes/', views.listar_examenes, name='listar_examenes'),
    path('obtener_analisis/', views.obtener_analisis, name='obtener_analisis'),
    path('registrar_examen/', views.registrar_examen, name='registrar_examen'),
    path('cargar_estatus_analisis/', views.cargar_estatus_analisis, name='cargar_estatus_analisis'),
    path('modificar_examen/', views.modificar_examen, name='modificar_examen'),

    ##Análisis
    path('analisis/', views.analisis, name='analisis'),
    path('listar_analisis/', views.listar_analisis, name='listar_analisis'),
    path('registrar_analisis/', views.registrar_analisis, name='registrar_analisis'),
    path('obtener_estatus_analisis/', views.obtener_estatus_analisis, name='obtener_estatus_analisis'),
    path('modificar_analisis/', views.modificar_analisis, name='modificar_analisis'),

    ##Medico
    path('medico/', views.medico, name='medico'),
    path('listar_medicos/', views.listar_medicos, name='listar_medicos'),
    path('cargar_roles_medico/', views.cargar_roles_medico , name='cargar_roles_medico'),
    path('obtener_especialidades/', views.obtener_especialidades, name='obtener_especialidades'),
    path('registrar_medico/', views.registrar_medico, name='registrar_medico'),
    path('obtener_medico/', views.obtener_medico, name='obtener-medico'),
    path('modificar_medico/', views.modificar_medico, name='modificar-medico'),

    ##Especialidad
    path('especialidad/', views.especialidad, name='especialidad'),
    path('listar_especialidades/', views.listar_especialidades, name='listar_especialidades'),
    path('registrar_especialidad/', views.registrar_especialidad, name='registrar_especialidad'),
    path('modificar_especialidad/', views.modificar_especialidad, name='modificar_especialidad'),

    ##Realizar_Examenes
    path('realizar_examenes/', views.realizar_examenes, name='realizar_examenes'),
    path('listar_realizar_examen/', views.listar_realizar_examen, name='listar_realizar_examen'),
    path('registro_realizar_examenes/', views.registro_realizar_examenes, name='registro_realizar_examenes'),
    path('obtener_examenes_por_analisis/', views.obtener_examenes_por_analisis, name='obtener_examenes_por_analisis'),
    path('realizar_examen_registro/', views.realizar_examen_registro, name='realizar_examen_registro'),
    path('realizar_examen_detalle/', views.realizar_examen_detalle, name='realizar_examen_detalle'),
    path('listar_detalle/', views.listar_detalle, name='listar_detalle'),
    path('realizar_examen_eliminar/', views.realizar_examen_eliminar, name='realizar_examen_eliminar'),
    path('realizar_editar_detalle/', views.realizar_editar_detalle, name='realizar_editar_detalle'),

    ##Resultados_Examenes
    path('resultados_examenes/', views.resultados_examenes, name='resultados_examenes'),
    path('listar_resultado_examen/', views.listar_resultado_examen, name='listar_resultado_examen'),
    path('registro_resultado/', views.registro_resultado, name="registro_resultado"),
    path('listar_pacientes_examenes/', views.listar_pacientes_examenes, name='listar_pacientes_examenes'),
    path('realizarexamen_detalle/', views.realizarexamen_detalle, name='realizarexamen_detalle'),
    path('realizar_resultado_registro/', views.realizar_resultado_registro, name='realizar_resultado_registro'),
    path('guardar_detalle_analisis/', views.guardar_detalle_analisis, name='guardar_detalle_analisis'),
    path('listar_resultados_editar/', views.listar_resultados_editar, name='listar_resultados_editar'),
    path('serve-file/<path:filename>/', views.serve_exam_file, name='serve_exam_file'),
    path('actualizar_examen/', views.actualizar_examen, name='actualizar_examen'),
    path('contar_examenes_y_resultados_view/', views.contar_examenes_y_resultados_view, name='contar_examenes_y_resultados_view'),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)