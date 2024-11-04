from django.db import models
from django.db.models.constraints import UniqueConstraint

class Paciente(models.Model):
    paciente_nombres = models.CharField(max_length=100, null=True, blank=True)
    paciente_apepaterno = models.CharField(max_length=100, null=True, blank=True)
    paciente_apematerno = models.CharField(max_length=100, null=True, blank=True)
    paciente_dni = models.CharField(max_length=8, null=True, blank=True)
    paciente_celular = models.CharField(max_length=12, null=True, blank=True)
    paciente_edad = models.IntegerField(null=True, blank=True)
    paciente_edadtipo = models.CharField(max_length=10, null=True, blank=True)
    paciente_sexo = models.CharField(max_length=12, null=True, blank=True)

    class Meta:
        db_table = 'paciente'

    def __str__(self):
        return f"{self.paciente_nombres} {self.paciente_apepaterno} {self.paciente_apematerno}"
class Meta:
    db_table = 'paciente'
    verbose_name = 'Paciente'
    verbose_name_plural = 'Pacientes'
    ordering = ['nombre']
    constraints = [
            UniqueConstraint(fields=['cedula'], name='cedula')
        ]