from rest_framework.pagination import PageNumberPagination

DEFAULT_PAGE = 1
class CustomPagination(PageNumberPagination):
    page = DEFAULT_PAGE
    page_size = 9
    page_size_query_param = 'page_size'
    max_page_size = 100000