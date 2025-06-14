from django.contrib.auth.models import User
from .models import Product
from django.shortcuts import render, redirect, get_object_or_404
from django.db.models import Q
from django.http import HttpResponseBadRequest

def employees(request):
    query = request.GET.get('q', '')
    users = User.objects.all()

    if query:
        users = users.filter(
            Q(username__icontains=query) |
            Q(email__icontains=query) |
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query)
        )

    users = users.order_by('username')
    return render(request, 'employees.html', {'users': users, 'query': query})

def products(request):
    query = request.GET.get('q', '')
    products = Product.objects.all().order_by('name')

    if query:
        products = products.filter(
            Q(name__icontains=query) |
            Q(description__icontains=query)
        )

    products = products.order_by('name')
    return render(request, 'products.html', {'products': products, 'query': query})

def create_product(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        description = request.POST.get('description')
        price = request.POST.get('price')

        if not name or not price:
            return HttpResponseBadRequest("Nome e preço são obrigatórios.")

        Product.objects.create(
            name=name,
            description=description,
            price=price
        )
    return redirect('list_products')

def update_product(request, pk):
    product = get_object_or_404(Product, pk=pk)
    if request.method == 'POST':
        product.name = request.POST['name']
        product.price = request.POST['price']
        product.description = request.POST.get('description', '')
        product.save()
    return redirect('list_products')

def delete_product(request, pk):
    product = get_object_or_404(Product, pk=pk)
    if request.method == 'POST':
        product.delete()
    return redirect("list_products")