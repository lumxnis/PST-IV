from django.contrib.auth.models import Group
from django.dispatch import receiver
from django.db.models.signals import post_save
from .models import Profile

#Señal para añadir usuario a un grupo
@receiver(post_save, sender=Profile)

def add_user_to_group(sender, instance, created, **kwargs):
    if created:
        try:
            Cliente = Group.objects.get(name='Cliente')
        except Group.DoesNotExist:
            Cliente = Group.objects.create(name='Cliente')
        instance.user.groups.add(Cliente)
