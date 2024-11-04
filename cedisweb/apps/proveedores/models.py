from django.db import models
from django.db.models.constraints import UniqueConstraint

class Proveedores(models.Model):
    cedula_prov = models.CharField(primary_key=True, max_length=10)
    rif = models.CharField(max_length=15)
    nombre_prov = models.CharField(max_length=20)
    apellido_prov = models.CharField(max_length=20)
    direccion_prov = models.CharField(max_length=35)
    telefono_prov = models.CharField(max_length=20)
    def __str__(self):
        texto = "{0} {1} ({2})"
        return texto.format(self.nombre_prov, self.apellido_prov, self.cedula_prov)
class Meta:
    db_table = 'proveedor'
    verbose_name = 'Proveedor'
    verbose_name_plural = 'Proveedores'
    ordering = ['nombre_prov']
    constraints = [
            UniqueConstraint(fields=['cedula_prov'], name='cedula_prov')
        ]
