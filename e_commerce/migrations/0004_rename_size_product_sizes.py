# Generated by Django 4.2.1 on 2023-05-16 19:44

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('e_commerce', '0003_outerwear_size_product_outerwears_product_size'),
    ]

    operations = [
        migrations.RenameField(
            model_name='product',
            old_name='size',
            new_name='sizes',
        ),
    ]
