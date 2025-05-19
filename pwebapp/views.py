from django.shortcuts import render
from django.http import HttpResponse

def teste(request):
    return HttpResponse("Olá Mundo!")
