from django.db import models
from django.db.models.constraints import UniqueConstraint
from proveedores.models import Proveedores

class Productos(models.Model):
    codigo = models.CharField(primary_key=True, max_length=12)
    proveedor = models.ForeignKey(Proveedores, on_delete=models.RESTRICT)
    nombrep = models.CharField(max_length=20)
    cantidad = models.CharField(max_length=20)
    descripcion = models.CharField(max_length=55)
    def __str__(self):
        texto = "{0} ({1})"
        return texto.format(self.nombrep, self.codigo)
class Meta:
    db_table = 'producto'
    verbose_name = 'Producto'
    verbose_name_plural = 'Productos'
    ordering = ['nombrep']
    constraints = [
            UniqueConstraint(fields=['codigo'], name='codigo')
        ]
