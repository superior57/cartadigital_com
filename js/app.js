'use strict';

/* App Module */

var cMovilApp = angular.module('cMovilApp', [
    'ngRoute',
    'cMovilControllers',
    'cMovilServices',
    'djds4rce.angular-socialshare',
    'LocalStorageModule',
    'pascalprecht.translate',
    'angular-loading-bar',
    'ngAnimate'
])
        .constant("cMovilConfig", {
            "SYSTEM_NAME": "CartaMóvil",
            "ROLE_USER": "User",
            "ROLE_WAITER": "Mozo",
            "ROLE_RESPONSIBLE": "Encargado",
            "ORDER_TYPE_NORMAL": 1,
            "ORDER_TYPE_TAKEAWAY": 2,
            "ORDER_TYPE_DELIVERY": 3,
            "ORDER_TYPE_ESTABLISHMENT": 4,
            "URL_CATEGORIES": "index.html#/categories",
            "URL_SPLASH": "lite.html#/splash/",
            "URL_BASE_WS": "https://panel.cartamovil.com/",
            "URL_BASE_WEBSERVICES": "https://panel.cartamovil.com/webservices",
            "URL_UPLOADS": "https://panel.cartamovil.com/uploads",
            "STATE_ITEM_PENDING": 1,
            "STATE_ITEM_IMPRESO": 2,
            "STATE_ITEM_HECHO": 3,
            "STATE_ITEM_RECHAZADO": 4,
            "STATE_ORDER_OK": 'Pendiente',
            "STATE_ORDER_FAIL": 'Rechazado',
            "STATE_ORDER_PENDING": 'AConfirmar',
            "STATE_ORDER_OK_REVERSE": 5,
            "STATE_ORDER_FAIL_REVERSE": 4,
            "ORIGIN_BUTTON": 1,
            "ORIGIN_KITCHEN": 2,
            "MONEYS": [{id: 3, simbol: '€'}, {id: 2, simbol: '$'}, {id: 1, simbol: '$'}],
        });

angular.module('cMovilApp').run(function ($filter, $FB, $rootScope, $location, cMovilConfig, $interval, localStorageService) {

    FastClick.attach(document.body);

    // set ID facebook
    $FB.init('1648480525407532');
    $rootScope.money = localStorageService.get('money');
    $rootScope.cMovilConfig = cMovilConfig;

    $rootScope.hasModule = function (name)
    {
        if (localStorageService.get('modules'))
        {
            var module = $filter('filter')(localStorageService.get('modules'), {nombre: name})[0];
            if (module)
            {
                return true;
            }
            else
            {
                return false;
            }
        } 
    }
    $rootScope.inter = null;
    var history = [];
    $rootScope.$on('$routeChangeStart', function (event) {
      let is_modalShow2 = $('.caja_idiomas').is(':visible');
        if(is_modalShow2) {
     $('.caja_idiomas').hide();
        }  
        let is_modalShow = $('.modal').is(':visible');
        if(is_modalShow) {
        event.preventDefault();
        $('.modal').modal('hide');
        }
    });	
    $rootScope.$on('$routeChangeSuccess', function () {
        $('.modal').modal('hide');
        $interval.cancel($rootScope.inter);
        history.push($location.$$path);
    });


    $rootScope.back = function () {
        $('.modal').modal('hide');
        var prevUrl = history.length > 1 ? history.splice(-2)[0] : "/";
        $location.path(prevUrl);

    };
});


cMovilApp.config(['$compileProvider', 'localStorageServiceProvider', '$routeProvider', '$translateProvider', 'cfpLoadingBarProvider', '$locationProvider',
    function ($compileProvider, localStorageServiceProvider, $routeProvider, $translateProvider, cfpLoadingBarProvider, $locationProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|http?|file|ftp|whatsapp|mailto|chrome-extension):/);
        $translateProvider.useSanitizeValueStrategy('escape');
        cfpLoadingBarProvider.spinnerTemplate = '<br/><center><button class="btn btn-info">Loading...</button></center>';
        cfpLoadingBarProvider.latencyThreshold = 500;
        //        localStorageServiceProvider.setStorageType('localStorage');
        localStorageServiceProvider.setPrefix('cMovil');
//        $locationProvider.hashPrefix("");
//        $locationProvider.html5Mode(true);
        // config routing
        $routeProvider.
                when('/splash/:sucursal/mode/:mode', {
                    templateUrl: 'partials/splash.html',
                    controller: 'splashCtrl'
                }).
                when('/splash/:sucursal/:puesto', {
                    templateUrl: 'partials/splash.html',
                    controller: 'splashCtrl'
                }).
                when('/splash/:sucursal', {
                    templateUrl: 'partials/splash.html',
                    controller: 'splashCtrl'
                }).
                when('/establishment/:establishment', {
                    templateUrl: 'partials/establishment-list.html',
                    controller: 'establishmentCtrl'
                }).
                when('/categories', {
                    templateUrl: 'partials/category-list.html',
                    controller: 'categoriesCtrl'
                }).
                when('/products/:categoria', {
                    templateUrl: 'partials/product-list.html',
                    controller: 'productsCtrl'
                }).
                when('/products/popular/:tipo', {
                    templateUrl: 'partials/product-list.html',
                    controller: 'productsCtrl'
                }).
                when('/client/products/popular/:tipo', {
                    templateUrl: 'partials/client-product-list.html',
                    controller: 'productsByClientCtrl'
                }).
                when('/popular/alergens/:tipo', {
                    templateUrl: 'partials/product-alergens-list.html',
                    controller: 'productsByClientCtrl'
                }).
                when('/products', {
                    templateUrl: 'partials/product-list.html',
                    controller: 'productsCtrl'
                }).
                when('/product/:producto', {
                    templateUrl: 'partials/detail-product.html',
                    controller: 'detailProductCtrl'
                }).
                when('/wishlist', {
                    templateUrl: 'partials/wish-list.html',
                    controller: 'wishlistCtrl'
                }).
                when('/review', {
                    templateUrl: 'partials/review.html',
                    controller: 'reviewCtrl'
                }).
                when('/orders', {
                    templateUrl: 'partials/order.html',
                    controller: 'orderCtrl'
                }).
                when('/client/products/:categoria', {
                    templateUrl: 'partials/client-product-list.html',
                    controller: 'productsByClientCtrl'
                }).
                when('/products/alergens/:categoria', {
                    templateUrl: 'partials/product-alergens-list.html',
                    controller: 'productsByClientCtrl'
                }).
                when('/login', {
                    templateUrl: 'partials/login.html',
                    controller: 'userCtrl'
                }).
                when('/kitchen', {
                    templateUrl: 'partials/kitchen.html',
                    controller: 'kitchenCtrl'
                }).
                when('/rating', {
                    templateUrl: 'partials/rating.html',
                    controller: 'ratingCtrl'
                }).
                when('/verifypin', {
                    templateUrl: 'partials/verify-pin.html',
                    controller: 'ratingCtrl'
                }).
                when('/kitchen/showall', {
                    templateUrl: 'partials/kitchen-showall.html',
                    controller: 'kitchenCtrl'
                }).
                when('/questions', {
                    templateUrl: 'partials/question.html?',
                    controller: 'questionCtrl'
                }).
                when('/paymentmethod', {
                    templateUrl: 'partials/paymentmethod.html',
                    controller: 'PaymentMethodCtrl'
                }).
                when('/paymentok/:order', {
                    templateUrl: 'partials/payment-ok.html',
                    controller: 'paymentOkCtrl'
                }).
                when('/paymentfail/:order', {
                    templateUrl: 'partials/payment-fail.html',
                    controller: 'paymentFailCtrl'
                }).
                when('/myorders', {
                    templateUrl: 'partials/myorders.html',
                    controller: 'myOrdersCtrl'
                }).
               when('/callWaiter', {
                    templateUrl: 'partials/callwaiter.html',
                    controller: 'callWaiterCtrl'
                }).
 
                when('/faqs', {
                    templateUrl: 'partials/faqs.html',
                    controller: 'faqsCtrl'
                }).
                otherwise({
                    redirectTo: '/login'
                });



        $translateProvider.translations('es', {
            'Pay with' : 'Paga con',
            'How far will you pay?':'¿Con cuanto va a pagar?',
            'Shipping cost': 'Costo de envio',
            'Enter your address information': 'Ingrese su información de dirección',
            'The Name is required.': 'Nombre es obligatorio.',
            'Name': 'Empresa cartamóvil',
            'The Last Name is required.': 'Apellido es obligatorio.',
            'Last Name': 'Apellido',
            'The Street is required.': 'Calle es obligatorio.',
            'Street': 'Calle',
            'The Number is required.': 'Numero es obligatorio.',
            'Number': 'Numero',
            'The Floor is required.': 'Piso es obligatorio.',
            'Floor': 'Piso',
            'The Apartment is required.': 'Departamento es obligatorio.',
            'Apartment': 'Departamento',
            'The Clarification is required.': 'Aclaracion es obligatorio.',
            'Clarification': 'Aclaracion',
            'The Phone Number is required.': 'Numero Telefonico es obligatorio.',
            'Phone Number': 'Numero Telefonico',
            'The Email is required.': 'Email es obligatorio.',
            'Email': 'Email',
            'DELIVERY DATA': 'Datos de Envio',
            'ORDER DATA': 'Datos de Pedido',
            'Observation': 'Observación',
            'Reason for rejection': 'Motivo del rechazo',
            'Telephone': 'Telefono',
            'Surname': 'Apellido',
            'Department': 'Departamento',
            'Motive': 'Motivo',
            'Take Away': 'Para llevar',
            'Your order number is:': 'Su número de orden es:',
            'Reset Printer': 'Reiniciar Impresora',
            'Power Off Printer': 'Apagar Impresora',
            'Print Test': 'Imprimir Test',
            'Terms and Conditions': 'Politicas devolución',
            'Enter the number of table': 'Ingrese el número de mesa',
            'Send': 'Enviar',
            'Payment retrying': 'Reintentar Pago',
            'Operation rejected!': 'Operación Denegada!',
            'Retry': 'Reintentar',
            'Ahead': 'Adelante',
            'Your payment has been processed successfully': 'Su pago ha sido procesado correctamente,',
            'Thank you for choosing us!': 'gracias por elegirnos!',
            'Redirecting to pay...': 'Redireccionando para pagar...',
            'You should choose a payment method': 'Debe elegir una forma de pago disponible',
            'Payment and Confirmation': 'Pago y Confirmación',
            'Back': 'Atrás',
            'State': 'Estado',
            'My Orders': 'Mis Pedidos',
            'Payment Methods': 'Forma de Pago',
            'Payment methods available': 'Formas de pago disponibles',
            'Product': 'Producto',
            'Supl.': 'Supl.',
            'Price': 'Precio',
            'Orders': 'Pedidos',
            'Comments': 'Comentarios',
            'End Session': 'Cerrar Sessión',
            'Rate Photo': 'Puntuar Foto',
            'Share Photo': 'Compartir Foto',
            'Whatsapp': 'Whatsapp',
            'Facebook': 'Facebook',
            'Allergens': 'Alérgenos',
            'Search': 'Buscar',
            'Order by default': 'Orden por defecto',
            'Order by name': 'Orden por nombre',
            'Order by photo quality': 'Orden por calidad de foto',
            'Order by reviews': 'Orden por opiniones',
            'Select Printer': 'Seleccionar impresora',
            'Order': 'Pedido',
            'Table': 'Mesa',
            'Branch Office': 'Sucursal',
            'Observations': 'Observaciones',
            'Amount': 'Cantidad',
            'Description': 'Descripción',
            'Welcome to CartaMóvil': 'Bienvenidos a CartaMóvil',
            'The access Fail.': 'El login es incorrecto',
            'The Username is required.': 'El usuario es obligatorio',
            'The Password is required.': 'El password es obligatorio',
            'Log in': 'Entrar',
            'Connected Printers': 'Impresoras conectadas',
            'Printer': 'Impresora',
            'Print': 'Imprimir',
            'There are not orders availables': 'No hay pedidos disponibles',
            'Restaurant': 'Restaurante',
            'Waiter': 'Camarero',
            'CIF': 'CIF',
            'Date and Time': 'Fecha y hora',
            'Cancel': 'Cancelar',
            'Bill': 'Facturar',
            'Suppl.': 'Suple.',
            'Total': 'Total',
            'Additional supplements': 'Suplementos adicionales',
            'Payment method': 'Método de pago',
            'Cash Payment': 'Pago en efectivo',
            'Total to pay': 'Total a pagar',
            'Money Received': 'Dinero recibido',
            'Divide account': 'Dividir cuenta',
            'Part(s)': 'Parte(s)',
            'To return': 'Devolver',
            'Paid out': 'Pagado',
            'Delete': 'Eliminar',
            'Credit Card': 'Tarjeta de credito',
            'Total Payment': 'Total a pagar',
            'Paid': 'Pagado',
            'Add': 'Añadir',
            'Items ordered': 'Items ordenados',
            'Confirm': 'Confirmar',
            'Send Feedback': 'Enviar Opinión',
            'Close and exit': 'Cerrar y salir',
            'Feedback': 'Opiniones',
            'PIN': 'PIN',
            'Enter your PIN': 'Ingresa tu PIN',
            'Accept': 'Aceptar',
            'Share your feedback in social media': 'Compartir tu opinión en redes sociales',
            'Supplements': 'Suplementos',
            'Ordered saucers': 'Platillos ordenados',
            'Send Order': 'Enviar Pedido',
            'No items available': 'No hay items disponibles',
            'The product was added sucessfully': 'El producto fue agregado correctamente',
            'The product was removed sucessfully': 'El producto fue eliminado correctamente',
            'The order was sent sucessfully': 'El pedido fue enviado correctamente',
            'The order was not sent. Please, try again': 'El pedido no fue enviado. Por favor intenta de nuevo',
            'You must choose a table please': 'Debe elegir una mesa por favor',
            'Thanks por send your question':  'Gracias por enviar su pregunta',
            'The Comment was sent sucessfully': 'El comentario fue enviado correctamente. Muchas gracias ',
            'Error submitting the comment. Please try again': 'Error al enviar el comentario . Por favor intente de nuevo ',
            'The bill was closed correctly': 'La cuenta fue cerrada correctamente',
            'The Pin is invalid': 'El PIN es incorrecto',
            'The score was sent sucessfully': 'Su opinión fue enviada correctamente',
            'Error sending the score. Please try again': 'Error enviando el puntaje . Por favor intente de nuevo',
            'Server Error': 'Error en el servidor',
            'Cash': 'Efectivo',
            'Card': 'Tarjeta',
            'Printers': 'Impresoras',
            'You must select a printer from the submenu': 'Debe seleccionar una impresora desde el submenu',
            'Printing...': 'Imprimiendo...',
            'popular': 'destacado',
            'new': 'nuevo',
            'Select Category': 'Seleccionar Categoría',
        });

        $translateProvider.preferredLanguage('es');
    }]);
