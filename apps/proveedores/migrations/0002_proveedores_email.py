# Generated by Django 5.0.6 on 2024-11-13 10:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('proveedores', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='proveedores',
            name='email',
            field=models.CharField(default=20, max_length=35),
            preserve_default=False,
        ),
    ]
