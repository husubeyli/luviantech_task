from django_filters import rest_framework as filter
from django_filters import RangeFilter
from e_commerce.models import Product


class NumberInFilter(filter.BaseInFilter, filter.NumberFilter,):
    pass
class CharInFilter(filter.BaseInFilter, filter.CharFilter):
    pass

class ProductFilter(filter.FilterSet):
    # id = NumberInFilter(field_name='id',lookup_expr='in')
    # name = CharInFilter(field_name='name',lookup_expr='in')
    outerwears = NumberInFilter(field_name='outerwears', lookup_expr='in')
    sizes = NumberInFilter(field_name='sizes', lookup_expr='in')
    status = NumberInFilter(field_name='status')
    price = RangeFilter(field_name='price')

    class Meta:
        model = Product
        fields = ['outerwears','sizes','status', 'price']
        # fields = ['sizes']


