from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import Profile

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