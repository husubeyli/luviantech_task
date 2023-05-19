from rest_framework.serializers import ValidationError, ModelSerializer, SerializerMethodField
from rest_framework import serializers
from .models import Outerwear, Product, Order, OrderItem, Size
from datetime import datetime


class SizeSerializer(ModelSerializer):
    class Meta:
        model = Size
        fields = ['id', 'size']
        
class OuterwearSerializer(ModelSerializer):
    class Meta:
        model = Outerwear
        fields = ['id', 'name']


class ProductSerializer(ModelSerializer):
    order_items = SerializerMethodField()
    sizes = serializers.PrimaryKeyRelatedField(read_only=True)
    # sizes = serializers.StringRelatedField(read_only=True)
    # outerwears = serializers.StringRelatedField(read_only=True)
    outerwears = serializers.PrimaryKeyRelatedField(read_only=True)
    depth=2

    class Meta:
        model = Product
        fields = ['id', 'name', 'sizes', 'price', 'image','outerwears', 'status', 'order_items']

    def get_order_items(self, obj):
        request = self.context.get('request')
        if request.user.is_anonymous:
            return []
        return list(OrderItem.objects.filter(order__complete=False, order__user=request.user).values_list('product_id', flat=True))

class AddProductSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    quantity = serializers.IntegerField()

    def validate(self, attr):
        product = Product.objects.filter(id=attr["id"]).first()
        if product is None:
            raise ValidationError({
                'success': False,
                'success': 'Product does not exist'
            })

        if attr["quantity"] <= 0:
            raise ValidationError({
                'success': False,
                'success': 'Quantity should be more than 0'
            })
        return attr

    def create(self, validated_data):
        user = self.context['request'].user
        product = Product.objects.filter(id=validated_data["id"]).first()
        order = Order.objects.filter(user=user).order_by("-id").first()
        found_order = None
        if order is None:
            found_order = Order.objects.create(
                user=user,
                date_ordered=datetime.now(),
                complete=False
            )
        else:
            if order.complete == True:
                found_order = Order.objects.create(
                    user=user,
                    date_ordered=datetime.now(),
                    complete=False
                )
            else:
                found_order = order

        order_item = OrderItem.objects.filter(
            order=found_order, product=product).first()
        found_order_item = None
        if order_item is None:
            found_order_item = OrderItem()
        else:
            found_order_item = order_item
        found_order_item.product = product
        found_order_item.quantity = validated_data["quantity"]
        found_order_item.date_added = datetime.now()
        found_order_item.order = found_order
        found_order_item.save()

        return {
            "success": True,
            "message": "Product added",
            "product_id": product.id
        }


class OrderItemSerializer(ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'order', 'product', 'quantity', 'date_added']


class OrderSerializer(ModelSerializer):
    class Meta:
        model = Order
        fields = ['id', 'user', 'date_ordered', 'complete']

    def update(self, instance, validated_data):
        instance.complete = True
        instance.save()
        return {
            "success": True,
            "message": "Checkout. Order completed",
            "order_id": instance.id
        }
