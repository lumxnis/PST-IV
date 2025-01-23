from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import Profile
from django.contrib.auth.forms import AuthenticationForm

## Formulario Para crear Usuario
class CustomUserCreationForm(UserCreationForm):
	email = forms.EmailField(required=True)

	class Meta:
		model = Profile
		fields = ['username', 'first_name', 'last_name', 'email', 'password1', 'password2']
	def clean_email(self):
		email = self.cleaned_data['email']

		if Profile.objects.filter(email=email).exists():
			raise forms.ValidationError('Este correo electrónico ya está registrado')
		return email

## Formulario Para editar Perfil
class ProfileForm(forms.ModelForm):
	class Meta: 
		model = Profile 
		fields = ['username', 'email', 'first_name', 'last_name', 'picture','location', 'bio']

# Formulario para Autenticar
class CustomAuthenticationForm(AuthenticationForm):
    def confirm_login_allowed(self, user):
        try:
            profile = Profile.objects.get(user=user)
            if profile.usu_status == 'INACTIVO' or (profile.rol and profile.rol.rol_estatus == 'INACTIVO'):
                raise forms.ValidationError(
                    'Su usuario está desactivado. Comuníquese con el administrador.',
                    code='inactive'
                )
        except Profile.DoesNotExist:
            raise forms.ValidationError(
                'Usuario no encontrado.',
                code='not_found'
            )

