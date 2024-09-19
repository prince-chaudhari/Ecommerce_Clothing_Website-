from rest_framework import serializers
from account.models import User
from core.models import Coupon
from django.utils.encoding import smart_str, force_bytes, DjangoUnicodeDecodeError
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from account.utils import Util
import random
import string
from django.utils import timezone

def generate_coupon_code(length=10):
    """Generate a unique coupon code."""
    characters = string.ascii_uppercase + string.digits
    code = ''.join(random.choice(characters) for _ in range(length))
    # Ensure the generated code is unique
    while Coupon.objects.filter(code=code).exists():
        code = ''.join(random.choice(characters) for _ in range(length))
    return code

class UserRegistrationSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)
    username = serializers.CharField()
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, attrs):
        password = attrs.get('password')
        password2 = attrs.get('password2')
        email = attrs.get('email')
        
        if password != password2:
            raise serializers.ValidationError("Password and Confirm Password don't match")
        
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("A user with this email already exists")
        
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        
        # Generate and save coupon code
        coupon_code = generate_coupon_code()  # Ensure this function generates a unique code
        coupon = Coupon.objects.create(
           name = "WELCOME_DISCOUNT",
            code=coupon_code,
            user=user,
            discount_percentage=25.0,  # Set your desired discount percentage
            valid_from=timezone.now(),
            valid_to=timezone.now() + timezone.timedelta(days=30),  # Valid for 30 days
            active=True
        )
        
        # Generate email content
        body = f'''Hi {user.username},

Welcome to GreenCart! We're thrilled to have you join our community.

As a token of appreciation, we're giving you a special one-time coupon code that you can use on your first purchase to enjoy a discount on your favorite items.

Your Coupon Code: {coupon_code}

Use this code at checkout and get 25% off on any item of your choice!

Here's what you can look forward to:

Exclusive Fashion Collections: Stay updated with our latest arrivals and trending styles.
Special Offers & Discounts: Get early access to our promotions and sales events.
Personalized Shopping Experience: Tailor-made recommendations just for you.
Feel free to browse through our collection and add your favorite pieces to the cart. We hope you have an amazing shopping experience with us!

Start Shopping Now: http://localhost:3000/

If you have any questions or need assistance, our customer support team is here to help.

Happy Shopping!

Best regards,
GreenCart Team
        '''
        data = {
            'subject': f'Welcome to GreenCart! Enjoy a Special Discount on Your First Purchase!',
            'body': body,
            'to_email': user.email
        }
        Util.send_email(data)  # Ensure this function sends an email properly

        return user

class UserLoginSerializer(serializers.ModelSerializer):
  email = serializers.EmailField(max_length=255)
  class Meta:
    model = User
    fields = ['email', 'password']
  
class UserProfileSerializer(serializers.ModelSerializer):
  class Meta:
    model = User
    fields = ['id', 'email', 'username', 'get_avatar', 'gender', 'date_of_birth']

class UserChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(max_length=255, style={'input_type': 'password'}, write_only=True)
    password = serializers.CharField(max_length=255, style={'input_type': 'password'}, write_only=True)
    password2 = serializers.CharField(max_length=255, style={'input_type': 'password'}, write_only=True)

    class Meta:
        fields = ['current_password', 'password', 'password2']

    def validate(self, attrs):
        user = self.context.get('user')
        
        current_password = attrs.get('current_password')
        password = attrs.get('password')
        password2 = attrs.get('password2')

        # Check if current password is correct
        if not user.check_password(current_password):
            raise serializers.ValidationError({'current_password': 'Current password is incorrect.'})

        # Check if the new passwords match
        if password != password2:
            raise serializers.ValidationError({'password': 'The new passwords do not match.'})

        # Set the new password
        user.set_password(password)
        user.save()

        return attrs

class SendPasswordResetEmailSerializer(serializers.Serializer):
  email = serializers.EmailField(max_length=255)
  class Meta:
    fields = ['email']

  def validate(self, attrs):
    email = attrs.get('email')
    print("Hello")
    if User.objects.filter(email=email).exists():
      user = User.objects.get(email = email)
      uid = urlsafe_base64_encode(force_bytes(user.id))
      # print('Encoded UID', uid)
      token = PasswordResetTokenGenerator().make_token(user)
      # print('Password Reset Token', token)
      link = 'http://localhost:3000/api/user/reset/'+uid+'/'+token
      print('Password Reset Link', link)
      # Send EMail
      body = 'Click Following Link to Reset Your Password '+link
      print(user.email)
      data = {
        'subject':'Reset Your Password',
        'body':body,
        'to_email':user.email
      }
      Util.send_email(data)
      return attrs
    else:
      raise serializers.ValidationError('You are not a Registered User')

class UserPasswordResetSerializer(serializers.Serializer):
  password = serializers.CharField(max_length=255, style={'input_type':'password'}, write_only=True)
  password2 = serializers.CharField(max_length=255, style={'input_type':'password'}, write_only=True)
  class Meta:
    fields = ['password', 'password2']

  def validate(self, attrs):
    try:
      password = attrs.get('password')
      password2 = attrs.get('password2')
      uid = self.context.get('uid')
      token = self.context.get('token')
      if password != password2:
        raise serializers.ValidationError("Password and Confirm Password doesn't match")
      id = smart_str(urlsafe_base64_decode(uid))
      user = User.objects.get(id=id)
      if not PasswordResetTokenGenerator().check_token(user, token):
        raise serializers.ValidationError('Token is not Valid or Expired')
      user.set_password(password)
      user.save()
      return attrs
    except DjangoUnicodeDecodeError as identifier:
      PasswordResetTokenGenerator().check_token(user, token)
      raise serializers.ValidationError('Token is not Valid or Expired')
  