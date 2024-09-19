# Generated by Django 5.1 on 2024-09-17 02:48

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0027_order_orderitem_order_products'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='address',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_order_address', to='core.address'),
        ),
    ]
