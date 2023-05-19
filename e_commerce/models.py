from django.db import models
from account.models import CustomUser


STATUS_CHOICES = (
	(1, 'New'),
	(2, 'Sale')
)
class Product(models.Model):
	outerwears = models.ForeignKey("e_commerce.Outerwear", on_delete=models.CASCADE, related_name='products', null=True, blank=True)
	sizes = models.ForeignKey("e_commerce.Size", on_delete=models.CASCADE, related_name='products', null=True, blank=True)

	name = models.CharField(max_length=200)
	image = models.ImageField(upload_to='products/', null=True, blank=True)
	price = models.FloatField()
	status = models.IntegerField(choices=STATUS_CHOICES, default=1)  

	
	def __str__(self):
		return self.name


class Order(models.Model):
	user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
	date_ordered = models.DateTimeField(auto_now_add=True)
	complete = models.BooleanField(default=False)
	
	def __str__(self):
		return str(self.id)
		
	@property
	def get_cart_total(self):
		orderitems = self.orderitem_set.all()
		total = sum([item.get_total for item in orderitems])
		return total 

	@property
	def get_cart_items(self):
		orderitems = self.orderitem_set.all()
		total = sum([item.quantity for item in orderitems])
		return total 
	
		
class OrderItem(models.Model):
	order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True)
	product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
	quantity = models.IntegerField(default=0, null=True, blank=True)
	date_added = models.DateTimeField(auto_now_add=True)
	
	@property
	def get_total(self):
		total = self.product.price * self.quantity
		return total



class Outerwear(models.Model):
	name = models.CharField(max_length=200)
    
	def __str__(self):
		return self.name
	
class Size(models.Model):
	size = models.CharField(max_length=200)

	def __str__(self):
		return self.size

