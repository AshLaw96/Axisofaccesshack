from django.shortcuts import render

def user_profile(request):
    return render(request, 'accounts/user_profile.html')


def caregiver_profile(request):
    return render(request, 'accounts/caregiver_profile.html')
