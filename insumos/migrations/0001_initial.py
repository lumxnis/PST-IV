# Generated by Django 5.0.6 on 2024-11-05 19:56

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('proveedores', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Productos',
            fields=[
                ('codigo', models.CharField(max_length=12, primary_key=True, serialize=False)),
                ('nombrep', models.CharField(max_length=20)),
                ('cantidad', models.CharField(max_length=20)),
                ('proveedor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='proveedores.proveedores')),
            ],
        ),
    ]