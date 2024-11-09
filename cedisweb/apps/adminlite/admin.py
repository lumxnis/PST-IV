from django.contrib import admin
from .models import Profile

class ProfileAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff')  # Campos disponibles en AbstractUser
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups')

    def user_groups(self, obj):
        return " - ".join([group.name for group in obj.groups.all().order_by('name')])

    user_groups.short_description = 'Grupos'

admin.site.register(Profile, ProfileAdmin)



