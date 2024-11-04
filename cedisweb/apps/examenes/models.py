from django.db import models
from pacientes.models import Paciente
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
    
## Realizar Exámen
class RealizarExamen(models.Model):
    REALIZAREXAMEN_ESTATUS_CHOICES = [
        ('PENDIENTE', 'Pendiente'),
        ('FINALIZADO', 'Finalizado'),
    ]

    paciente = models.ForeignKey(Paciente, on_delete=models.RESTRICT, null=True, blank=True)
    realizarexamen_estatus = models.CharField(max_length=10, choices=REALIZAREXAMEN_ESTATUS_CHOICES, null=True, blank=True)
    realizarexamen_indica = models.CharField(max_length=255, null=True, blank=True)
    realizarexamen_nomindica = models.CharField(max_length=255, null=True, blank=True)
    realizarexamen_fregistro = models.DateField(null=True, blank=True)

    class Meta:
        db_table = 'realizar_examen'
        indexes = [
            models.Index(fields=['paciente']),
        ]

    def __str__(self):
        return f"{self.realizarexamen_id} - {self.realizarexamen_estatus}"
    

## Realizar Examen Detalle
class RealizarExamenDetalle(models.Model):
    examen = models.ForeignKey(Examen, on_delete=models.RESTRICT, null=True, blank=True)
    analisis = models.ForeignKey(Analisis, on_delete=models.RESTRICT, null=True, blank=True)
    realizarexamen = models.ForeignKey('RealizarExamen', on_delete=models.RESTRICT, null=True, blank=True)

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
    paciente = models.ForeignKey(Paciente, on_delete=models.RESTRICT, null=True, blank=True)
    resultado_fregistro = models.DateField(null=True, blank=True)
    resultado_estatus = models.CharField(max_length=1, null=True, blank=True)

    class Meta:
        db_table = 'resultado'
        indexes = [
            models.Index(fields=['paciente']),
        ]

    def __str__(self):
        return f"Resultado {self.resultado_id}"


##Resultado Detalle
class ResultadoDetalle(models.Model):
    resultado = models.ForeignKey(Resultado, on_delete=models.RESTRICT, null=True, blank=True)
    resuldetalle_archivo = models.CharField(max_length=255, null=True, blank=True)
    rdetalle = models.ForeignKey(RealizarExamenDetalle, on_delete=models.RESTRICT, null=True, blank=True)

    class Meta:
        db_table = 'resultado_detalle'
        indexes = [
            models.Index(fields=['resultado']),
            models.Index(fields=['rdetalle']),
        ]

    def __str__(self):
        return f"Resultado Detalle {self.resuldetalle_id}"








