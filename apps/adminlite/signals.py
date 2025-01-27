from django.contrib.auth.models import Group
from django.dispatch import receiver
from django.db.models.signals import post_save
from .models import Profile
from django.contrib.auth.signals import user_logged_in
import logging

#Señal para añadir usuario a un grupo
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import Group
from .models import Profile

# 
logger = logging.getLogger(__name__)
@receiver(user_logged_in)
def store_user_info_in_session(sender, request, user, **kwargs):
    request.session['S_IDUSUARIO'] = user.id
    request.session['ROL_ID'] = user.rol.rol_id 
    logger.debug(f"ID del usuario {user.id} y ROL_ID {user.rol.rol_id} almacenados en la sesión.")


