from django.db import models
import uuid
from django.utils.html import mark_safe
from account.models import User
from taggit.managers import TaggableManager
from django.conf import settings
from django.utils.timesince import timesince
import pytz
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator

STATUS_CHOICE = (
    ("processing", "Processing"),
    ("shipped", "Shipped"),
    ("delivered", "Delivered"), 
)

STATUS = (
    ("draft", "Draft"),
    ("disabled", "Disabled"),
    ("rejected", "Rejected"),
    ("in_review", "In Review"),
    ("published", "Published"),
)

RATING = (
    (1, "★☆☆☆☆"),
    (2, "★★☆☆☆"),
    (3, "★★★☆☆"),
    (4, "★★★★☆"),
    (5, "★★★★★"),
)

def user_directory_path(instance, filename):
    return 'user_{0}/{1}'.format(instance.user.id, filename)

class Category(models.Model):
    cid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=100, default="Food")
    image = models.ImageField(upload_to="category", default="category.jpg")

    class Meta:
        verbose_name_plural = "Categories"

    def category_image(self):
        return mark_safe('<img src="%s" width="50" height="50" />' % (self.image.url))
    
    def __str__(self):
        return self.title

class Tags(models.Model):
    pass
    
class Vendor(models.Model):
    vid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    title = models.CharField(max_length=100, default="Nestify")
    image = models.ImageField(upload_to=user_directory_path, default="vendor.jpg") 
    cover_image = models.ImageField(upload_to=user_directory_path, default="vendor.jpg") 
    description = models.TextField(null=True, blank=True, default="I am an amazing vendor") 

    address = models.CharField(max_length=100, default="123 Main Street.")
    contact = models.CharField(max_length=100, default="+123 (456) 789")
    chat_resp_time = models.CharField(max_length=100, default="100")
    shipping_on_time = models.CharField(max_length=100, default="100")
    authentic_rating = models.CharField(max_length=100, default="100")
    days_return = models.CharField(max_length=100, default="100")
    warranty_period = models.CharField(max_length=100, default="100")

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    date = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    class Meta:
        verbose_name_plural = "Vendors"

    def vendor_image(self):
        return mark_safe('<img src="%s" width="50" height="50" />' % (self.image.url))
    
    def __str__(self):
        return self.title

class Color(models.Model):
    name = models.CharField(max_length=30)
    code = models.CharField(max_length=30)


    def __str__(self):
        return self.name    

class Size(models.Model):
    name = models.CharField(max_length=10)

    def __str__(self):
        return self.name   

class Product(models.Model):
    pid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)
    # vendor = models.ForeignKey(Vendor, on_delete=models.SET_NULL, null=True, related_name='vendor')
    
    title = models.CharField(max_length=100, default="Fresh Pear")
    image = models.ImageField(upload_to="product-images") 
    description = models.TextField(null=True, blank=True, default="This is product") 

    price = models.DecimalField(max_digits=99999999999999, decimal_places=2, default="1.99")
    old_price = models.DecimalField(max_digits=99999999999999, decimal_places=2, default="2.99")

    specifications = models.TextField(null=True, blank=True)
    type = models.CharField(max_length=100, default="Organic", null=True, blank=True)
    stock_count = models.CharField(max_length=100, default="10", null=True, blank=True)
    life = models.CharField(max_length=100, default="100 Days", null=True, blank=True)
    mfd = models.DateTimeField(auto_now_add=False, null=True, blank=True)
    colors = models.ManyToManyField(Color, related_name='products', blank=True)  # added related_name
    sizes = models.ManyToManyField(Size, related_name='products', blank=True)
    color = models.CharField(max_length=30, null=True, blank=True)

    tags = TaggableManager(blank = True)

    product_status = models.CharField(choices=STATUS, max_length=10, default="in_review")

    status = models.BooleanField(default=True)
    in_stock = models.BooleanField(default=True)
    featured = models.BooleanField(default=False)
    digital = models.BooleanField(default=False)

    sku = models.UUIDField(default=uuid.uuid4, editable=False)

    date = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name_plural = "Products"

    def product_image(self):
        if self.image:
            return settings.WEBSITE_URL + self.image.url
        else:
            return 'https://picsum.photos/200/200'
    
    def __str__(self):
        return self.title
    
    def get_percentage(self):
        new_price = (self.price / self.old_price) * 100
        return new_price

class ProductImages(models.Model):
    images = models.ImageField(upload_to="product-images") 
    product = models.ForeignKey(Product, related_name="p_images", on_delete=models.SET_NULL, null=True)
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Product Images"

    def product_images(self):
        if self.images:
            return settings.WEBSITE_URL + self.images.url
        else:
            return 'https://picsum.photos/200/200'

class Cart(models.Model):
    cart_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='carts', null=True, blank=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='cart_items')
    quantity = models.PositiveIntegerField(default=1)
    size = models.CharField(max_length=30)
    added_on = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.product.title} - {self.quantity} pcs"

    def get_total_price(self):
        return self.product.price * self.quantity

    
    
class ProductReview(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, related_name='reviews')
    review = models.TextField()
    rating = models.IntegerField(choices=RATING, default=None)
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Product Reviews"

    def __str__(self):
        return self.product.title

    def get_rating(self):
        return self.rating

    def created_at_formatted(self):
       return timesince(self.date)

class Wishlist(models.Model):
    wishlist_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Wishlists"

    def __str__(self):
        return self.product.title

class Address(models.Model):
    address_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    country = models.CharField(max_length=50)
    company_name = models.CharField(max_length=100, blank=True, null=True)
    street_address = models.CharField(max_length=100)
    apartment = models.CharField(max_length=50, blank=True, null=True)
    city = models.CharField(max_length=50)
    state = models.CharField(max_length=50)
    phone = models.CharField(max_length=20)
    postal_code = models.CharField(max_length=20)
    delivery_instruction = models.TextField(blank=True, null=True)
    default_shipping = models.BooleanField(default=False)
    default_billing = models.BooleanField(default=False)
    status = models.BooleanField(default=False)

    class Meta:
        verbose_name_plural = "Addresses"

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.street_address}, {self.city}, {self.state}"


class OrderItem(models.Model):
    order = models.ForeignKey('Order', on_delete=models.CASCADE, related_name='order_items')
    product = models.ForeignKey('Product', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price_at_purchase = models.DecimalField(max_digits=99999999999999, decimal_places=2)
    item_total = models.DecimalField(max_digits=99999999999999, decimal_places=2)
    size = models.CharField(max_length=30)

    def __str__(self):
        return f"{self.quantity} of {self.product.title}"

class Order(models.Model):
    status_choices = (
        ('pending', 'Pending'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    )
    PAYMENT_METHOD_CHOICES = (
        ('credit_card', 'Credit Card'),
        ('debit_card', 'Debit Card'),
        ('paypal', 'PayPal'),
        ('bank_transfer', 'Bank Transfer'),
        ('cash_on_delivery', 'Cash on Delivery'),
    )
    order_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    total_price = models.DecimalField(max_digits=99999999999999, decimal_places=2, blank=True, null=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='credit_card')
    address = models.ForeignKey(Address, related_name="user_order_address", on_delete=models.CASCADE)
    order_status = models.CharField(max_length=10, choices=status_choices, default='pending')
    order_date = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    products = models.ManyToManyField(Product, through=OrderItem)

    class Meta:
        verbose_name_plural = "Orders"

    def __str__(self):
        return f"Order {self.order_id} by {self.user}"
    
    def order_date_formatted(self):
        # Get the 'Asia/Kolkata' timezone
        india_timezone = pytz.timezone('Asia/Kolkata')
        
        # Convert the order_date to the India timezone
        local_order_date = self.order_date.astimezone(india_timezone)
        
        # Format the date and time
        return local_order_date.strftime("%d %B %Y %I:%M %p")
    
class Coupon(models.Model):
    name = models.CharField(max_length=50, unique=True)  # Unique coupon code
    code = models.CharField(max_length=50, unique=True)  # Unique coupon code
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='coupons')
    discount_percentage = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(100)], 
        help_text="Discount percentage (0-100)"
    )
    valid_from = models.DateTimeField()
    valid_to = models.DateTimeField()
    active = models.BooleanField(default=True)
    used = models.BooleanField(default=False)  # Track if the coupon has been used

    def is_valid(self):
        """Check if the coupon is valid based on time and active status."""
        return self.active and not self.used and self.valid_from <= timezone.now() <= self.valid_to

    def __str__(self):
        return self.code