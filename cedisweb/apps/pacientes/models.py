from django.db import models
from datetime import date
from django.db.models.constraints import UniqueConstraint
from django.utils import timezone

class Paciente(models.Model):
    TIPO_EDAD_CHOICES = [
        ('años', 'Años'),
        ('meses', 'Meses'),
    ]

    SEXO_CHOICES = [
        ('masculino', 'MASCULINO'),
        ('femenino', 'FEMENINO'),
    ]

    paciente_nombres = models.CharField(max_length=100, null=True, blank=True)
    paciente_apepaterno = models.CharField(max_length=100, null=True, blank=True)
    paciente_apematerno = models.CharField(max_length=100, null=True, blank=True)
    paciente_dni = models.CharField(max_length=35, unique=True, null=True, blank=True)
    paciente_celular = models.CharField(max_length=35, null=True, blank=True)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    paciente_sexo = models.CharField(max_length=12, choices=SEXO_CHOICES, null=True, blank=True)
    date_joined = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'paciente'
        verbose_name = 'Paciente'
        verbose_name_plural = 'Pacientes'
        ordering = ['paciente_nombres']
        constraints = [
            UniqueConstraint(fields=['paciente_dni'], name='paciente_dni')
        ]

    @property
    def calcular_edad(self):
        if self.fecha_nacimiento:
            today = date.today()
            age = today.year - self.fecha_nacimiento.year - ((today.month, today.day) < (self.fecha_nacimiento.month, self.fecha_nacimiento.day))
            return age
        return None

    @property
    def calcular_tipo_edad(self):
        edad = self.calcular_edad
        if edad is not None:
            return 'MESES' if edad == 0 else 'AÑOS'
        return None

    def __str__(self):
        return f"{self.paciente_nombres} {self.paciente_apepaterno} {self.paciente_apematerno}"
