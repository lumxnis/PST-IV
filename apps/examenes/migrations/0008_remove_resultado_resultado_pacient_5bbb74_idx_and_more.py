# Generated by Django 5.0.6 on 2024-12-01 13:32

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('examenes', '0007_remove_realizarexamen_realizarexamen_nomindica'),
        ('pacientes', '0008_alter_paciente_paciente_sexo'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RemoveIndex(
            model_name='resultado',
            name='resultado_pacient_5bbb74_idx',
        ),
        migrations.RenameField(
            model_name='resultado',
            old_name='paciente',
            new_name='paciente_id',
        ),
        migrations.AddField(
            model_name='resultado',
            name='usuario_id',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.RESTRICT, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddIndex(
            model_name='resultado',
            index=models.Index(fields=['paciente_id'], name='resultado_pacient_895da5_idx'),
        ),
    ]