# Generated by Django 5.0.6 on 2024-11-27 15:46

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('examenes', '0006_realizarexamen_usuario_id'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='realizarexamen',
            name='realizarexamen_nomindica',
        ),
    ]