from django import forms

from .models import User

class ProfileForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ('username', 'gender', 'date_of_birth')

    # def __init__(self, *args, **kwargs):
    #     super(ProfileForm, self).__init__(*args, **kwargs)
    #     # Make name and avatar optional
    #     self.fields['name'].required = False
    #     self.fields['avatar'].required = False
