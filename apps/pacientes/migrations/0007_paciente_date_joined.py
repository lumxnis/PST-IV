# Generated by Django 5.0.6 on 2024-11-20 15:57

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pacientes', '0006_alter_paciente_paciente_celular_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='paciente',
            name='date_joined',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
