from django.contrib.auth.models import User
from .models import Product, Order, OrderItem
from .serializers import UserSerializer, ProductSerializer, OrderSerializer
from django.shortcuts import render, redirect, get_object_or_404
from django.utils.timezone import localtime
from django.db.models import Q
from django.http import HttpResponseBadRequest, JsonResponse, HttpResponseRedirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

@login_required
@staff_member_required
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

@login_required
@staff_member_required
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

@login_required
@staff_member_required
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

@login_required
@staff_member_required
def update_product(request, pk):
    if request.method == 'POST':
        product = get_object_or_404(Product, pk=pk)
        product.name = request.POST['name']
        product.price = request.POST['price']
        product.description = request.POST.get('description', '')
        product.save()
    return redirect('list_products')

@login_required
@staff_member_required
def delete_product(request, pk):
    if request.method == 'POST':
        product = get_object_or_404(Product, pk=pk)
        product.delete()
    return redirect("list_products")

@login_required
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

@login_required
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

@login_required
def update_order(request, pk):
    if request.method == 'POST':
        order = get_object_or_404(Order, pk=pk)
        order.table_number = request.POST.get('table_number')
        order.responsible_name = request.POST.get('responsible_name')
        if not order.table_number or not order.responsible_name:
            return HttpResponseBadRequest("Table number and responsible name are required fields.")
        order.save()

        products = request.POST.getlist('products[]')
        quantities = request.POST.getlist('quantities[]')

        updated_items = {
            int(pid): int(qty)
            for pid, qty in zip(products, quantities)
            if pid.strip() and qty.strip()
        }

        existing_items = {
            item.product.id: item
            for item in order.items.all()
        }

        for product_id in list(existing_items.keys()):
            if product_id not in updated_items:
                existing_items[product_id].delete()

        for product_id, quantity in updated_items.items():
            if product_id in existing_items:
                item = existing_items[product_id]
                if item.quantity != quantity:
                    item.quantity = quantity
                    item.save()
            else:
                product = get_object_or_404(Product, pk=product_id)
                OrderItem.objects.create(order=order, product=product, quantity=quantity)

    return redirect('list_orders')

@login_required
def order_details(request, pk):
    order = get_object_or_404(Order, pk=pk)
    items = OrderItem.objects.filter(order=order).select_related('product')

    return JsonResponse({
        'id': order.id,
        'table_number': order.table_number,
        'responsible_name': order.responsible_name,
        'opened_at': localtime(order.opened_at).strftime('%d/%m/%Y %H:%M'),
        'closed_at': localtime(order.closed_at).strftime('%d/%m/%Y %H:%M') if order.closed_at else None,
        'is_paid': order.is_paid,
        'items': [
            {
                'product_id': item.product.id,
                'product_name': item.product.name,
                'quantity': item.quantity,
                'price': float(item.product.price),
            } for item in items
        ]
    })

@login_required
def close_order(request, pk):
    if request.method == 'POST':
        order = get_object_or_404(Order, pk=pk)
        if not order.is_paid:
            order.is_paid = True
            order.save()
    return redirect('list_orders')

def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect('list_orders')
        else:
            messages.error(request, 'Usuário ou senha inválidos.')

    return render(request, 'login.html')
        
def logout_view(request):
    logout(request)
    return redirect('login')

# API
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_logout(request):
    request.user.auth_token.delete()
    return Response({"success": True}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_current_user(request):
    user = request.user
    return Response({
        'username': user.username,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_employees(request):
    query = request.GET.get('q', '')
    users = User.objects.all()

    if query:
        users = users.filter(
            Q(username__icontains=query) |
            Q(email__icontains=query)
        )

    users = users.order_by('username')
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_products(request):
    query = request.GET.get('q', '')
    products = Product.objects.all()

    if query:
        products = products.filter(
            Q(name__icontains=query) |
            Q(description__icontains=query)
        )

    products = products.order_by('name')
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_create_product(request):
    name = request.data.get('name')
    description = request.data.get('description', '')
    price = request.data.get('price')

    if not name or not price:
        return Response({"error": "Name and price are required fields."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        product = Product.objects.create(
            name=name,
            description=description,
            price=price
        )
        serializer = ProductSerializer(product)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def api_update_product(request, pk):
    product = get_object_or_404(Product, pk=pk)
    name = request.data.get('name', product.name)
    description = request.data.get('description', product.description)
    price = request.data.get('price', product.price)

    if not name or not price:
        return Response({"error": "Name and price are required fields."}, status=status.HTTP_400_BAD_REQUEST)

    product.name = name
    product.description = description
    product.price = price

    try:
        product.save()
        serializer = ProductSerializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def api_delete_product(request, pk):
    product = get_object_or_404(Product, pk=pk)

    try:
        product.delete()
        return Response({"success": True}, status=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_orders(request):
    query = request.GET.get('q', '')
    orders = Order.objects.all()

    if query:
        orders = orders.filter(
            Q(table_number__icontains=query) |
            Q(responsible_name__icontains=query)
        )

    orders = orders.order_by('is_paid', 'opened_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)