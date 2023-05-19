
$(document).ready(function(){
    // Add product to cart, increase cart total count and disable button
    $(document).on("click", ".add-product-to-cart", function (e) {
        quantity = 1
        let clicked_button = $(this);
        let data={
            "id":clicked_button.attr("data-product"),
            "quantity":quantity
        }

        // Add product to cart
        let request = apiAddProduct(data);
        request.done(function (data) {
            if (data["success"] == true) {
                // Increase cart total count
                let count = parseInt($("#cart-total").text());
                $("#cart-total").text(count+quantity);
                
                // Disable button
                clicked_button.prop("disabled", true);
                clicked_button.addClass("makedisable");

                Swal.fire(data["message"])
            } else {
                Swal.fire(data["error"])
            }
        }).fail(function (data) {
            Swal.fire(data["responseText"])
        })
    });


    // Add PLUS-MINUS product to cart
    $(document).on("click", ".chg-quantity", function (e) {
        let clicked_button = $(this);
        let action = clicked_button.attr("data-action");
        let product_price = clicked_button.closest('.cart-row').find('.product-price');
        let product_total_price = clicked_button.closest('.cart-row').find('.product-total-price');
        let quantity_element = clicked_button.closest('.cart-row').find('.cart_quantity');
        let cart_total_element = $("#cart-total");
        let cart_items_count_element = $(".cart_items_count");
        let cart_items_total_price_element = $(".cart_items_total_price");
        
        let quantity = parseInt(quantity_element.text());
        let cart_items_count = parseInt(cart_items_count_element.text());
        let cart_items_total_price = parseFloat(cart_items_total_price_element.text())
        if (action === "add_plus"){
            quantity = quantity + 1 
            cart_items_count = cart_items_count + 1
            cart_items_total_price = cart_items_total_price + parseFloat(product_price.text());
        }else if(action === "add_minus"){
            quantity = quantity - 1
            cart_items_count = cart_items_count - 1
            cart_items_total_price = cart_items_total_price - parseFloat(product_price.text());
        }

        if(quantity === 0){
            Swal.fire("Minimum quantity is 1")
            return
        }
        
        let data={
            "id":clicked_button.attr("data-product"),
            "quantity":quantity
        }

        // Add product to cart
        let request = apiAddProduct(data);
        request.done(function (data) {
            if (data["success"] == true) {
                cart_total_element.text(cart_items_count);
                cart_items_count_element.text(cart_items_count);
                cart_items_total_price_element.text(cart_items_total_price);
                quantity_element.text(quantity);
                product_total_price.text(parseFloat(product_price.text())*quantity);
                Swal.fire(data["message"])
            } else {
                Swal.fire(data["error"])
            }
        }).fail(function (data) {
            Swal.fire(data["responseText"])
        })
    });

    // Remove order item
    $(document).on("click", ".remove_order_item", function (e) {
        let clicked_button = $(this);
        let checkout = $(".checkout")
        let product_price = clicked_button.closest('.cart-row').find('.product-price');
        let product_total_price = clicked_button.closest('.cart-row').find('.product-total-price');
        let quantity_element = clicked_button.closest('.cart-row').find('.cart_quantity');
        let cart_total_element = $("#cart-total");
        let cart_items_count_element = $(".cart_items_count");
        let cart_items_total_price_element = $(".cart_items_total_price");
        let quantity = parseInt(quantity_element.text());
        let cart_items_count = parseInt(cart_items_count_element.text()) - quantity;
        let cart_items_total_price = parseFloat(cart_items_total_price_element.text()) - parseFloat(product_total_price.text());
        

        let id = clicked_button.attr("data-orderitem");
        let request = apiRemoveOrderItem(id);
        request.done(function (data) {
            if (data["success"] == true) {
                cart_total_element.text(cart_items_count);
                cart_items_count_element.text(cart_items_count);
                cart_items_total_price_element.text(cart_items_total_price);
                clicked_button.closest('.cart-row').remove();
                if(cart_items_count === 0){
                    checkout.remove();
                }
                Swal.fire(data["message"])
            } else {
                Swal.fire(data["error"])
            }
        }).fail(function (data) {
            Swal.fire(data["responseText"])
        })
    });

    // Checkout order
    $(document).on("click", ".checkout", function (e) {
        let clicked_button = $(this);
        let id = clicked_button.attr("data-order");
        let request = apiCompleteOrder(id);
        request.done(function (data) {
            if (data["success"] == true) {
                Swal.fire(data["message"])
                setTimeout(function() {
                    window.location.href = "/e_commerce/";
                  }, 1500);
            }else{
                Swal.fire(data["error"])
            }
        }).fail(function (data) {
            Swal.fire(data["responseText"])
        })
    })

    $(document).on("change", "#sort", function (e) {
        e.preventDefault();
        isFinish = false
        isLoading = false
        page = 1
        let product_list = $(".product_list")
        product_list.html('');
        ordering = this.value
        loadMoreProduct()
    })

    $(document).on("keyup", "#search_box", function (e) {
        e.preventDefault();
        isFinish = false
        isLoading = false
        page = 1
        let product_list = $(".product_list")
        product_list.html('');
        search = this.value

        outerwears = ''
        sizes = ''
        status = ''
        price_min = ''
        price_max = ''

        // unchecked all filter params
        document.querySelectorAll('.tick > input').forEach((item,index) => {
            item.checked = false
        })
        loadMoreProduct()
    })

    // size
    getSizeFilter();

    // outerwears
    getOuterwears();

    
    // update filter params
    getFilterData();

    
    // Load on scrolling
    loadMoreProduct();
    $(window).scroll(function() { 
        if ($(window).scrollTop() + $(window).height() +20 >= $(document).height()) {
            // User has scrolled to the bottom of the page
            if(isLoading == false){
                loadMoreProduct();
            }
        }
    });
    let request = apiCheckAccessToken();
    request.done(function (data) {

        if (data["success"] == false) {
            $.cookie("access_token", null);
            $.cookie("refresh_token", null);
            $.cookie("username", null);
            $(location).attr('href', '/e_commerce/login');
        }
    }).fail(function (data) {
        $.cookie("access_token", null);
        $.cookie("refresh_token", null);
        $.cookie("username", null);
        $(location).attr('href', '/e_commerce/login');
    })

    // filter
    $('#filter_apply').on('click', function(){
            getFilterData()
            isFinish = false
            isLoading = false
            page = 1
            let product_list = $(".product_list")
            product_list.html('');
            loadMoreProduct();
    })


})

// global variable
var page = 1;
var isLoading  = false;
var isFinish = false
var sizes = '';
var outerwears = '';
var status = '';
var price_min = '';
var price_max = '';
var _filterObj = {};
var ordering = '';
var search = '';
// update filter params
getFilterData();


function loadMoreProduct(){
    if (isLoading) {
        return; // Prevent multiple simultaneous requests
    }
    isLoading = true;
    if(isFinish){
        return
    }
    let request = apiGetProducts(page, outerwears, sizes, status, price_min, price_max, ordering, search );
    request.done(function (data) {
        let product_list = $(".product_list")
        if (data['results'].length > 0) {

            data["results"].forEach(function (item, index) {
                product_list.append(createProductHTML(item));
            })
        }
        else{
            product_list.html('');
        }
        page = page+1;
        isLoading = false;
    }).fail(function (data) {
        isLoading = false;
        isFinish = true
    })
    
   
}

function createProductHTML(product){
    let innerHTML = "";
    if(product["order_items"].includes(product.id)){
        innerHTML = `<button disabled data-product="${product["id"]}" data-action="add" class="btn btn-outline-secondary add-btn update-cart add-product-to-cart makedisable">Add to Cart</button>`;
    }
    else{
        innerHTML = `<button data-product="${product["id"]}" data-action="add" class="btn btn-outline-secondary add-btn update-cart add-product-to-cart">Add to Cart</button>`;
    }
    let image_path = product['image'] ? product['image'] : 'https://www.freepnglogos.com/uploads/belts-png/casual-dress-belts-for-men-28.png';
    let startHTML = `
    <div class="col-lg-4 col-md-6 pt-lg-0 pt-md-4 pt-3" bis_skin_checked="1">
    <div class="card d-flex flex-column align-items-center" bis_skin_checked="1">
        <div class="product-name text-center" bis_skin_checked="1">
        ${product["name"]}
        </div>
        <div class="card-img" bis_skin_checked="1">
        <img src="${image_path}" alt="">
        </div>
        <div class="card-body pt-5" bis_skin_checked="1">
        <div class="text-muted text-center mt-auto" bis_skin_checked="1">Available Colors</div>
        <div class="d-flex align-items-center justify-content-center colors my-2" bis_skin_checked="1">
            <div class="btn-group" data-toggle="buttons" data-tooltip="tooltip" data-placement="right" title="" data-original-title="choose color" bis_skin_checked="1">
            <label class="btn btn-dark border form-check-label">
                <input class="form-check-input" type="radio" autocomplete="off">
            </label>
            <label class="btn btn-brown form-check-label active">
                <input class="form-check-input" type="radio" autocomplete="off">
            </label>
            </div>
        </div>
        <div class="d-flex align-items-center justify-content-center price" bis_skin_checked="1">
            <div class="font-weight-bold" bis_skin_checked="1">${product["price"]}</div>
        </div>
        </div>
    </div>
    ${innerHTML}
    </div>
	`;	

;


    return startHTML
}


function createSizeHTML(data) {
    let startHTML = `
    <div class="custom-checkbox" >
        <label class="btn btn-success form-check-label">
            <input data-filter="sizes" onclick="getFilterData()" value=${data['id']} class="form-check-input filter-item-checkbox" type="checkbox" /> ${data['size']}
        </label>
    </div>
    `;
    return startHTML
}

function getSizeFilter() {
    let request = apiGetSizes();
    request.done(function (data) {
        let size_div = $("#size > div");
        data.forEach(function (item, index) {
            size_div.append(createSizeHTML(item));
        })
    })
}




function createOuterwearsHTML(data) {

    let startHTML = `
    <div class="my-1 custom-checkbox" >
        <label class="tick">
            ${data['name']}
            <input data-filter="outerwears" onclick="getFilterData()" class="filter-item-checkbox" value=${data['id']} type="checkbox" />
            <span class="check"></span>
        </label>
    </div>
    `;
    return startHTML
}


function getOuterwears(){
    let request = apiGetOuterwears();
    request.done(function (data) {
        let outerwears_div = $("#inner-box");
        data.forEach(function (item, index) {
            outerwears_div.append(createOuterwearsHTML(item));
        })
    })
}


function getFilterData() { // filter product data return products
    // $(".ajaxLoader").hide();
    isFinish = false
    page = 1

    var _filterObj={};
    _filterObj['price_min'] = document.getElementById('input-left').value
    _filterObj['price_max'] = document.getElementById('input-right').value
    // _filterObj['category'] = theCategory


    if($(".filter-item-checkbox")){
        $(".filter-item-checkbox").each(function(index,ele){
            var _filterKey=$(this).data('filter');

            _filterObj[_filterKey]=Array.from(document.querySelectorAll('input[data-filter='+_filterKey+']:checked')).map(function(el){
                return parseInt(el.value) ? el.value : '' ;
            })


        });
    }

    if(Object.keys(_filterObj).length > 0){
        if ('status' in _filterObj) {
            if (_filterObj['status'].length == 0){
                status = '';
            }
            else{
                status = _filterObj['status'].join(',');
            }
        }
        if ('outerwears' in _filterObj) {
            if (_filterObj['outerwears'].length == 0){
                outerwears = '';
            }
            else{
                outerwears = _filterObj['outerwears'].join(',');
            }
        }
        if ('sizes' in _filterObj) {
            if (_filterObj['sizes'].length == 0){
                sizes = '';
            }
            else {
                sizes = _filterObj['sizes'].join(',');
            }
        }
        if ('price_min' in _filterObj) {
            if (_filterObj['price_min'].length == 0){
                price_min = '';
            }
            else {
                price_min = _filterObj['price_min']
            }
        }
        if ('price_max' in _filterObj) {
            if (_filterObj['price_max'].length == 0){
                price_max = '';
            }
            else {
                price_max = _filterObj['price_max']
            }
        }
    }
    else {
        outerwears=''
        sizes=''
    }
    // console.log(_filterObj, 'yeni');
    return _filterObj
}

