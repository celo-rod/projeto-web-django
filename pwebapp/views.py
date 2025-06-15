from django.contrib.auth.models import User
from .models import Product, Order, OrderItem
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
            return HttpResponseBadRequest("Name and price are required fields.")

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

def orders(request):
    orders = Order.objects.all()
    query = request.GET.get('q', '')

    if query:
        orders = orders.filter(
            Q(table_number__icontains=query) |
            Q(responsible_name__icontains=query)
        )

    orders = orders.order_by('is_paid', 'opened_at')
    products = Product.objects.all()
    products_data = list(products.values('id', 'name', 'price'))
    return render(request, 'orders.html',  {'orders': orders, 'query': query, 'products_data': products_data})

def create_order(request):
    if request.method == 'POST':
        table_number = request.POST.get('table_number')
        responsible_name = request.POST.get('responsible_name')
        products = request.POST.getlist('products[]')
        quantities = request.POST.getlist('quantities[]')

        if not table_number or not responsible_name:
            return HttpResponseBadRequest("Table number and responsible name are required fields.")

        valid_items = []
        for product_id, quantity_str in zip(products, quantities):
            try:
                quantity = int(quantity_str)
                if not product_id or quantity <= 0:
                    continue
                
                product = Product.objects.get(id=product_id)
                valid_items.append({
                    'product': product,
                    'quantity': quantity
                })
            except (Product.DoesNotExist, ValueError):
                continue

        if not valid_items:
            return HttpResponseBadRequest("At least one valid product with a quantity greater than 0 is required.")

        order = Order.objects.create(
            table_number=table_number,
            responsible_name=responsible_name
        )

        for item in valid_items:
            OrderItem.objects.create(
                order=order,
                product=item['product'],
                quantity=item['quantity']
            )
    return redirect('list_orders')