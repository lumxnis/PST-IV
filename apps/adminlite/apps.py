from django.apps import AppConfig


class AdminliteConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'adminlite'

    def ready(self):
        import adminlite.signals
