from django.db import models
from pacientes.models import Paciente
from adminlite.models import Rol, Profile

##Análisis 
class Analisis(models.Model):
    ANALISIS_ESTATUS_CHOICES = [
        ('ACTIVO', 'Activo'),
        ('INACTIVO', 'Inactivo'),
    ]

    analisis_nombre = models.CharField(max_length=100, null=True, blank=True)
    analisis_fregistro = models.DateField(null=True, blank=True)
    analisis_estatus = models.CharField(max_length=8, choices=ANALISIS_ESTATUS_CHOICES, null=True, blank=True)

    class Meta:
        db_table = 'analisis'

    def __str__(self):
        return self.analisis_nombre
    
## Exámenes
class Examen(models.Model):
    EXAMEN_ESTATUS_CHOICES = [
        ('ACTIVO', 'Activo'),
        ('INACTIVO', 'Inactivo'),
    ]

    examen_nombre = models.CharField(max_length=100, null=True, blank=True)
    examen_fregistro = models.DateField(null=True, blank=True)
    analisis_id = models.ForeignKey(Analisis, on_delete=models.RESTRICT, null=True, blank=True)
    examen_estatus = models.CharField(max_length=8, choices=EXAMEN_ESTATUS_CHOICES, null=True, blank=True)

    class Meta:
        db_table = 'examen'
        indexes = [
            models.Index(fields=['analisis_id']),
        ]

    def __str__(self):
        return self.examen_nombre
    
##Especialidad
class Especialidad(models.Model):
    ESPECIALIDAD_ESTATUS_CHOICES = [
        ('ACTIVO', 'Activo'),
        ('INACTIVO', 'Inactivo'),
    ]
    
    especialidad_id = models.AutoField(primary_key=True)
    especialidad_nombre = models.CharField(max_length=100, null=True, blank=True)
    especialidad_fregistro = models.DateField(null=True, blank=True)
    especialidad_estatus = models.CharField(max_length=8, choices=ESPECIALIDAD_ESTATUS_CHOICES, null=True, blank=True)

    class Meta:
        db_table = 'especialidad'
        verbose_name = 'Especialidad'
        verbose_name_plural = 'Especialidades'

    def __str__(self):
        return self.especialidad_nombre or 'Especialidad'
    
## Médico 
class Medico(models.Model):
    medico_id = models.AutoField(primary_key=True)
    medico_nombre = models.CharField(max_length=100, null=True, blank=True)
    medico_apepat = models.CharField(max_length=100, null=True, blank=True)
    medico_apemat = models.CharField(max_length=100, null=True, blank=True)
    medico_direccion = models.CharField(max_length=100, null=True, blank=True)
    medico_movil = models.CharField(max_length=100, null=True, blank=True)
    medico_fenac = models.DateField(null=True, blank=True)
    medico_nrodocumento = models.CharField(max_length=12, null=True, blank=True)
    especialidad = models.ForeignKey(Especialidad, on_delete=models.RESTRICT, null=True, blank=True)
    usuario = models.ForeignKey(Profile, on_delete=models.RESTRICT, null=True, blank=True)

    class Meta:
        db_table = 'medico'
        verbose_name = 'Médico'
        verbose_name_plural = 'Médicos'

    def __str__(self):
        return f'{self.medico_nombre} {self.medico_apepat} {self.medico_apemat}'

    
## Realizar Exámen
class RealizarExamen(models.Model):
    REALIZAREXAMEN_ESTATUS_CHOICES = [
        ('PENDIENTE', 'Pendiente'),
        ('FINALIZADO', 'Finalizado'),
    ]
    paciente_id = models.ForeignKey(Paciente, on_delete=models.RESTRICT, null=True, blank=True)
    usuario_id = models.ForeignKey(Profile, on_delete=models.RESTRICT, null=True, blank=True )
    realizarexamen_estatus = models.CharField(max_length=10, choices=REALIZAREXAMEN_ESTATUS_CHOICES, null=True, blank=True)
    medico_id = models.ForeignKey(Medico, on_delete=models.RESTRICT, null=True, blank=True)
    realizarexamen_fregistro = models.DateField(null=True, blank=True)

    class Meta:
        db_table = 'realizar_examen'
        indexes = [
            models.Index(fields=['paciente_id']),
        ]

    def __str__(self):
        return f"{self.realizarexamen_id} - {self.realizarexamen_estatus}"
    

## Realizar Examen Detalle
class RealizarExamenDetalle(models.Model):
    examen = models.ForeignKey(Examen, on_delete=models.RESTRICT, null=True, blank=True)
    analisis = models.ForeignKey(Analisis, on_delete=models.RESTRICT, null=True, blank=True)
    realizarexamen = models.ForeignKey(RealizarExamen, on_delete=models.RESTRICT, null=True, blank=True)

    class Meta:
        db_table = 'realizar_examen_detalle'
        indexes = [
            models.Index(fields=['examen']),
            models.Index(fields=['analisis']),
            models.Index(fields=['realizarexamen']),
        ]

    def __str__(self):
        return f"Detalle {self.rdetalle_id} - Examen {self.examen_id}"
    

## Resultado
class Resultado(models.Model):
    realizarexamen_id = models.ForeignKey(RealizarExamen, on_delete=models.RESTRICT, null=True, blank=True)
    usuario_id = models.ForeignKey(Profile, on_delete=models.RESTRICT, null=True, blank=True )
    resultado_fregistro = models.DateField(null=True, blank=True)
    resultado_estatus = models.CharField(max_length=1, null=True, blank=True)

    class Meta:
        db_table = 'resultado'

    def __str__(self):
        return f"Resultado {self.resultado_id}"

##Resultado Detalle
class ResultadoDetalle(models.Model):
    resultado = models.ForeignKey(Resultado, on_delete=models.RESTRICT, null=True, blank=True)
    resuldetalle_archivo = models.FileField(upload_to='uploads/', null=True, blank=True)
    rdetalle = models.ForeignKey(RealizarExamenDetalle, on_delete=models.RESTRICT, null=True, blank=True)

    class Meta:
        db_table = 'resultado_detalle'
        indexes = [
            models.Index(fields=['resultado']),
            models.Index(fields=['rdetalle']),
        ]

    def __str__(self):
        return f"Resultado Detalle {self.resuldetalle_id}"












