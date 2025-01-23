from django.contrib.auth.models import AbstractUser
from django.db import models

## Rol User
class Rol(models.Model):
    ROL_ESTATUS_CHOICES = [
        ('ACTIVO', 'Activo'),
        ('INACTIVO', 'Inactivo'),
    ]
    
    rol_id = models.AutoField(primary_key=True)
    rol_nombre = models.CharField(max_length=30, null=True, blank=True)
    rol_fregistro = models.DateField(null=True, blank=True)
    rol_estatus = models.CharField(max_length=8, choices=ROL_ESTATUS_CHOICES, null=True, blank=True)

    class Meta:
        db_table = 'rol'
        verbose_name = 'Rol'
        verbose_name_plural = 'Roles'

    def __str__(self):
        return self.rol_nombre or 'Rol'

## Usuarios
class Profile(AbstractUser):
    USUARIO_ESTATUS_CHOICES = [ ('ACTIVO', 'Activo'), ('INACTIVO', 'Inactivo'), ]
    picture = models.ImageField(default='profile_default.png', upload_to='users/')
    location = models.CharField(max_length=60, null=True, blank=True)
    bio = models.TextField(max_length=400, null=True, blank=True)
    rol = models.ForeignKey(Rol, on_delete=models.RESTRICT, null=True, blank=True)
    usu_status = models.CharField(max_length=8, choices=USUARIO_ESTATUS_CHOICES, null=True, blank=True)

    class Meta: 
        db_table = 'usuario' 
        verbose_name = 'Usuario' 
        verbose_name_plural = 'Usuarios'

    def __str__(self):
        return self.username
    



    
    





    