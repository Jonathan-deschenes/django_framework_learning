from django.shortcuts import render, redirect
from .form import ContactForm

# Create your views here.

# This is the home page view function


def home_view(request):
    return render(request, "form_app/home.html")

# This is the contact page view function


def contact_view(request):
    # Is the request a post
    if request.method == "POST":
        form = ContactForm(request.POST)
        if form.is_valid():
            # If post valid then send email and redirect
            form.send_email()
            return redirect('contact-success')
    # Else then send a empty form
    else:
        form = ContactForm()
    context = {'form': form}
    return render(request, "form_app/contact.html", context)

# This is the contact succes view function to handle the success page


def contact_succes_view(request):
    return render(request, "form_app/contact_succes.html")
