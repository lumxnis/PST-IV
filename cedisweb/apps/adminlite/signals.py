from django.contrib.auth.models import Group
from django.dispatch import receiver
from django.db.models.signals import post_save
from .models import Profile

#Señal para añadir usuario a un grupo
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import Group
from .models import Profile

@receiver(post_save, sender=Profile)
def add_user_to_group(sender, instance, created, **kwargs):
    if created:
        try:
            cliente_group = Group.objects.get(name='Cliente')
        except Group.DoesNotExist:
            cliente_group = Group.objects.create(name='Cliente')
        instance.groups.add(cliente_group) 
