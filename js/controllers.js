'use strict';
/* Controllers */

var cMovilControllers = angular.module('cMovilControllers', []);




/* Controller Category*/
cMovilControllers.controller('establishmentCtrl', ['$scope', '$filter', '$window', 'cMovilConfig', '$routeParams', 'localStorageService', 'Establishment',
    function ($scope, $filter, $window, cMovilConfig, $routeParams, localStorageService, Establishment) {

        localStorageService.clearAll();
        localStorageService.set("establishment", $routeParams.establishment);

        Establishment.getCategories().success(function (data) {
            $scope.categories = data.rubros;
        });
        // get All establishments
        Establishment.getEstablishment($routeParams.establishment).success(function (data) {
            $scope.establecimiento = data.establecimiento;

        });

        $scope.getDate = function (sucursal) {
            // get today day
            var today = new Date();
            // get object day
            var day = $filter('filter')(sucursal.horarios, { dia: today.getDay() })[0];

            // check range
            return day;
        }

        $scope.checkHour = function (sucursal) {
            if (Establishment.checkHour(sucursal.horarios)) {
                $window.location.href = cMovilConfig.URL_SPLASH + sucursal.nombre + '/mode/establishment';
            }
        }

    }]);



/* Controller Category*/
cMovilControllers.controller('categoriesCtrl', ['$scope', 'localStorageService', 'Category', 'cMovilConfig', '$rootScope', 'User',
    function ($scope, localStorageService, Category, cMovilConfig, $rootScope, User) {


        // column order by OrderBy
        $scope.orderProp = 'orden';
        if (localStorage.getItem('sucursal_logo') != null && localStorage.getItem('sucursal_logo') != 'null' )
            $('img[alt="Logo"]').attr("src",cMovilConfig.URL_BASE_WS + 'uploads/images/sucursales/'+localStorage.getItem('sucursal_logo'));
        if (User.can(cMovilConfig.ROLE_WAITER) || $rootScope.hasModule('ProductoListado')) {
            $scope.url = '#/products/';
        }
        else if ($rootScope.hasModule('ListadoConAlergenos')) {
            $scope.url = '#products/alergens/';
        }
        else {
            $scope.url = '#/client/products/';
        }

        // get All categories
        Category.getAll(localStorageService.get('sucursal')).success(function (data) {
            $scope.categories = data;
        });

        // Refresh Scope when the language change
        $scope.$watch(
            function ($scope) {
                $scope.categoryFilters = { locale: localStorageService.get('lang'), estado: true };
            },
            function (newValue) {
            }
        );
    }]);

/* Controller Products */
cMovilControllers.controller('productsCtrl', ['$timeout', '$scope', '$routeParams', 'localStorageService', 'Product', 'WishList', '$filter',
    function ($timeout, $scope, $routeParams, localStorageService, Product, WishList, $filter) {

        // inicialize translator
        var translate = $filter('translate');

        // get Products without Alergenos
        var withAlergenos = false;

        $scope.withHeart = true;


        // column order by OrderBy
        $scope.orderProp = localStorageService.get('orden_default');

        $scope.order = function (type) {
            if (type === 'puntaje' || type === 'rating') {
                $scope.reverse = true;
            }
            else {
                $scope.reverse = false;
            }
        }
        $scope.reverse = false;

        // get All Products by Category without Alergenos
        Product.getAll(localStorageService.get('sucursal'), $routeParams.categoria, $routeParams.tipo, withAlergenos).success(function (data) {
            $scope.products = data;
        });

        // Refresh Scope when the language change
        $scope.$watch(
            function ($scope) {
                $scope.productFilters = { locale: localStorageService.get('lang'), activo: true };
            },
            function (newValue) {
            }
        );
        // Save item in wishlist
        $scope.saveItem = function (product) {
            if (product.Amount > 0) {
                WishList.saveItem(product);
                $scope.msg = translate("The product was added sucessfully");
                $scope.showMessage = true;
                $timeout(function () {
                    $scope.showMessage = false;
                }, 1000);
            }
        }
        // Reset Product Amount
        $scope.resetAmountProduct = function (product) {
            product.Amount = 0;
        }
        // Add item to WishList
        $scope.addItem = function (product) {
            if (isNaN(product.Amount))
                product.Amount = 1;
            else
                product.Amount++;
        }

        // Remove item from Wishlist
        $scope.removeItem = function (product) {
            if (product.Amount > 0)
                product.Amount--;
        }
        // Add supplement to Item
        $scope.addSupplement = function (supplement) {
            if (isNaN(supplement.Amount))
                supplement.Amount = 1;
            else
                supplement.Amount++;
        }
        // Remove supplement to Wishlist
        $scope.removeSupplement = function (supplement) {
            if (supplement.Amount > 0)
                supplement.Amount--;
        }
    }]);

/* Controller Product by Client */
cMovilControllers.controller('productsByClientCtrl', ['cMovilConfig', '$filter', '$timeout', '$scope', '$routeParams', 'localStorageService', 'Product', 'WishList', 'Review',
    function (cMovilConfig, $filter, $timeout, $scope, $routeParams, localStorageService, Product, WishList, Review) {
        // init toolstrip
        $('[data-toggle="tooltip"]').tooltip();
        // inicialize translator
        var translate = $filter('translate');
        // Order By Orden
        $scope.orderProp = localStorageService.get('orden_default');
        $scope.withHeart = true;

        $scope.order = function (type) {
            if (type === 'puntaje' || type === 'rating') {
                $scope.reverse = true;
            }
            else {
                $scope.reverse = false;
            }
        }

        // Get Product with Alergenos
        var withAlergenos = true;

        // Get All Products by Category
        Product.getAll(localStorageService.get('sucursal'), $routeParams.categoria, $routeParams.tipo, withAlergenos).success(function (data) {
            $scope.products = data;
        });

        // Add Item to wishlist
        $scope.addOrRemoveItem = function (product) {
            var result = WishList.existItem(product);

            if (result) {
                $scope.msgErrorProduct = translate("The product was removed sucessfully");
                $scope.showErrorProduct = true;
                $timeout(function () {
                    $scope.showErrorProduct = false;
                }, 1000);

                WishList.removeDefined(product);
            }
            else {
                $scope.msgSuccessProduct = translate("The product was added sucessfully");
                $scope.showSuccessProduct = true;
                $timeout(function () {
                    $scope.showSuccessProduct = false;
                }, 1000);
                WishList.add(product);
            }
        }
        $scope.existItem = function (product) {
            return WishList.existItem(product);
        }


        // Refresh Scope when language change
        $scope.$watch(
            function ($scope) {
                $scope.productFilters = { locale: localStorageService.get('lang'), activo: true };
            },
            function (newValue) {
            }
        );
    }]);

/* Controller Language */
cMovilControllers.controller('LanguageCtrl', ['$scope', 'localStorageService', 'Language', '$translate',
    function ($scope, localStorageService, Language, $translate) {
        // Get All languages enables
        $scope.Languages = Language.getLanguagesLocal();

        // change language of the session
        $scope.changeLanguage = function (lang) {
            localStorageService.set("lang", lang.id);
            $translate.use(lang.id);
        }
    }]);

/* Controller Caller*/
cMovilControllers.controller('callWaiterCtrl', ['$scope', 'localStorageService', 'Caller',
    function ($scope, localStorageService, Caller) {
        // Call to Waiter
        $scope.callWaiter = function (action) {
            if (action === "CALL" || action === "BILL") {
                document.getElementById("callermandarin").style.color = "#FF4233";
            }
            if (action === "CANCEL")
                document.getElementById("callermandarin").style.color = "";
            Caller.callWaiter(action, localStorageService.get("puesto"));
        }
    }]);

/* Controler Detail Product */
cMovilControllers.controller('detailProductCtrl', ['$filter', '$timeout', '$scope', '$routeParams', 'localStorageService', 'Product', 'WishList',
    function ($filter, $timeout, $scope, $routeParams, localStorageService, Product, WishList) {

        // Order By Orden
        $scope.orderProp = localStorageService.get('orden_default');
        $scope.withHeart = false;
        // inicialize translator
        var translate = $filter('translate');
        /* get Product By Id With Alergenos */
        Product.get($routeParams.producto).success(function (data) {

            $scope.products = data.producto;
            $scope.alergenos = data.alergenos;
        });

        // Refresh scope when the language change
        $scope.$watch(
            function ($scope) {
                $scope.productFilters = { locale: localStorageService.get('lang'), activo: true };
                $scope.countryFilters = { locale: localStorageService.get('lang') };

            },
            function (newValue) {
            }
        );


        // Add item to WishList
        $scope.addItemWish = function (product) {
            WishList.add(product);
            $scope.msg = translate("The product was added sucessfully");
            $scope.showMessage = true;
            $timeout(function () {
                $scope.showMessage = false;
            }, 1000);
        }
        // Save item into wishlist
        $scope.saveItem = function (product) {
            product.Amount = 1;
            WishList.saveItem(product);
            $scope.msg = translate("The product was added sucessfully");
            $scope.showMessage = true;
            $timeout(function () {
                $scope.showMessage = false;
            }, 1000);
        };
        // add suplement in the item
        $scope.addSupplement = function (supplement) {
            if (isNaN(supplement.Amount))
                supplement.Amount = 1;
            else
                supplement.Amount++;
        };
        // remove supplement to item
        $scope.removeSupplement = function (supplement) {
            if (supplement.Amount > 0)
                supplement.Amount--;
        };
    }]);
/* Controller Wishlist */
cMovilControllers.controller('wishlistCtrl', ['$scope', 'localStorageService', 'WishList', 'User', 'cMovilConfig',
    function ($scope, localStorageService, WishList, User, cMovilConfig) {

        $scope.stateButton = false;

        $scope.isShowEnabled = User.can(cMovilConfig.ROLE_WAITER);
        // Filters and orders
        $scope.productFilters = { activo: true };

        // Order By Orden
        $scope.orderProp = localStorageService.get('orden_default');

        // Display items from Wishlist
        $scope.items = WishList.getAll();



        if (angular.isDefined(localStorageService.get("comment"))) {
            $scope.comment = localStorageService.get("comment");
        }
        // Save Comment
        $scope.saveComment = function () {

            localStorageService.set("comment", $scope.comment);
        }

        // Add Item to Wishlist
        $scope.addItem = function (product) {
            WishList.add(product);
        }
        // Remove item of the wishlist
        $scope.removeItem = function (product) {
            WishList.remove(product);
        }


        // Add supplement to item
        $scope.addSupplement = function (product, supplement) {
            if (isNaN(supplement.Amount))
                supplement.Amount = 1;
            else
                supplement.Amount++;
            WishList.refreshSupplement(product);
        }
        // Remove supplement from wishlist
        $scope.removeSupplement = function (product, supplement) {
            if (supplement.Amount > 0)
                supplement.Amount--;
            WishList.refreshSupplement(product);
        }
    }]);
// Controller Splash
cMovilControllers.controller('splashCtrl', ['$filter', '$timeout', '$routeParams', '$window', 'TypeProduct', 'Language', 'localStorageService', 'Config', 'cMovilConfig', 'User', 'Device', 'WishList', 'Tax',
    function ($filter, $timeout, $routeParams, $window, TypeProduct, Language, localStorageService, Config, cMovilConfig, User, Device, WishList, Tax) {
        if (!User.isAuthenticated()) {
            User.createUserAnonymous();
        }

        // get BranchOffice and Languages
        Config.getAll($routeParams.sucursal).success(function (data) {
         
            if (data.success) {
                localStorageService.set('orden_default', data.Sucursal.orden_default);
                localStorageService.set('locale_default', data.Sucursal.locale_default);
                 localStorage.setItem('sucursal_logo', data.Sucursal.logo);
                if (localStorage.getItem('sucursal_logo') != null && localStorage.getItem('sucursal_logo') != 'null' )
                     $('img[alt="Logo"]').attr("src",cMovilConfig.URL_BASE_WS + 'uploads/images/sucursales/'+localStorage.getItem('sucursal_logo')); 
                localStorageService.set('lang', localStorageService.get('locale_default'));
                localStorageService.set('sucursal', data.Sucursal.id);
                localStorageService.set('branchoffice', data.Sucursal);
                localStorageService.set("acceso_ilimitado", data.Sucursal.acceso_ilimitado);
                if (data.Sucursal.acceso_ilimitado == true)
                    var acceso_ilimitado = true;
                else
                    var acceso_ilimitado = false;
                //alert(JSON.stringify(data.Sucursal.acceso_ilimitado));
                // set simbol money
                var money = $filter('filter')(cMovilConfig.MONEYS, { id: data.Sucursal.moneda })[0];
                localStorageService.set('money', money.simbol);

                // save languages        
                Language.getAll(data.Sucursal.id).success(function (data) {
                    localStorageService.set('languages', data.Idiomas);
                });

                // get Devices
                Device.getDevices(data.Sucursal.id).success(function (data) {
                    localStorageService.set('devices', data.dispositivos);
                });

                // get Tables
                WishList.getTables(data.Sucursal.id).success(function (data) {

                    localStorageService.set('tables', data.puestos);

                });

                // get Modules
                Config.getModules(data.Sucursal.id).success(function (data) {
                    localStorageService.set('modules', data.modulos);
                });

                // get Payment Methods
                Config.getPaymentMethods(data.Sucursal.id).success(function (data) {
                    localStorageService.set('paymentMethods', data.formasPago);
                });

                // get taxes
                Tax.getTaxes(data.Sucursal.id).success(function (data) {
                    localStorageService.set('taxes', data.impuestos);
                });
            }
        });

        // Take table number
        var puesto = $routeParams.puesto;
        //   alert(JSON.stringify(localStorageService.get('tables')));
        if (localStorageService.get('acceso_ilimitado') == true && puesto == null) {
            if (localStorageService.get('tables') === null && localStorageService.get('tables').count > 0)

                puesto = localStorageService.get('tables')[0].id;
            else
                puesto = "eureka";

            localStorageService.set('puesto', puesto);
            // delete wishlist
            localStorageService.set('wishlist', []);

            // Take Mode
            var mode = $routeParams.mode;
            localStorageService.set('mode', mode);

            // Take language from browser
            var lang = $window.navigator.language || $window.navigator.userLanguage;
            //localStorageService.set('lang', lang.split('-')[0]);
            localStorageService.set('lang', localStorageService.get('locale_default'));
            //   $scope.categoryFilters = {locale: localStorageService.get('locale_default'), estado: true};
            // Save type products
            TypeProduct.getAll().success(function (data) {
                localStorageService.set('typesProduct', data.tipos);
            });


            // Show splashing
            $timeout(function () {
                //   var host = $location.host();
                //   var port = $location.port();
                $window.location.href = cMovilConfig.URL_CATEGORIES;
            }, 5000);

        }
        else
            if (localStorageService.get('acceso_ilimitado') === false && puesto == null) {
                $timeout(function () {
                    $(".figure").hide();
                    $("#myModal").modal('show');
                    //$window.location.href = cMovilConfig.URL_CATEGORIES;
                }, 0);
            }
            else {
                localStorageService.set('puesto', puesto);
                // delete wishlist
                localStorageService.set('wishlist', []);

                // Take Mode
                var mode = $routeParams.mode;
                localStorageService.set('mode', mode);

                // Take language from browser
                var lang = $window.navigator.language || $window.navigator.userLanguage;
                if (localStorageService.get('lang') === null)
                    localStorageService.set('lang', lang.split('-')[0]);


                // Save type products
                TypeProduct.getAll().success(function (data) {
                    localStorageService.set('typesProduct', data.tipos);
                });


                // Show splashing
                $timeout(function () {
                    //   var host = $location.host();
                    //   var port = $location.port();
                    $window.location.href = cMovilConfig.URL_CATEGORIES;
                }, 5000);
            }
    }]);

/* Controller Review */
cMovilControllers.controller('reviewCtrl', ['$filter', '$timeout', '$location', '$scope', 'Review',
    function ($filter, $timeout, $location, $scope, Review) {
        // inicialize translator
        var translate = $filter('translate');


        // Send Review
        $scope.sendReview = function () {
            $scope.submitted = true;
            if ($scope.reviewForm.$valid) {
                $scope.title = translate("Comments");
                Review.sendReview($scope.title, $scope.email, $scope.comment, $scope.type).success(function (data) {
                    if (data.success) {

                        $scope.msgSuccess = translate("The Comment was sent sucessfully");
                        $scope.showMessageSuccess = true;
                        $timeout(function () {
                            $scope.showMessageSuccess = false;
                            $location.path("/categories");
                        }, 2000);
                    }
                    else {
                        $scope.msgError = translate("Error submitting the comment. Please try again");
                        $scope.showMessageError = true;
                        $timeout(function () {
                            $scope.showMessageError = false;
                        }, 2000);
                    }

                }).error(function (data) {
                    $scope.msgError = translate("Error submitting the comment. Please try again");
                    $scope.showMessageError = true;
                    $timeout(function () {
                        $scope.showMessageError = false;
                    }, 2000);
                });
            }

        }

    }]);

/* Controller Header*/
cMovilControllers.controller('headerCtrl', ['$scope', '$location', 'localStorageService',
    function ($scope, $location, localStorageService) {

        // Specify if the item is active or not
        var establishment = localStorageService.get('establishment');
        $scope.establishment = establishment;
        $scope.isEstablishment = function () {

            if (establishment) {
                return true;
            }
            else {
                return false;
            }
        }
        $scope.getEstablishment = function () {
            return localStorageService.get('establishment');
        }
        $scope.isActive = function (viewLocation) {

            return viewLocation === $location.path();
        };

    }]);

// Controller TypeProduct
cMovilControllers.controller('TypeProductCtrl', ['$scope', 'TypeProduct',
    function ($scope, TypeProduct) {
        // get strip
        $scope.getImage = function (id) {
            return TypeProduct.getImage(id);
        };
    }]);

/* Controller User */
cMovilControllers.controller('userCtrl', ['$rootScope', '$scope', '$filter', 'User', '$location', 'localStorageService', '$window', 'cMovilConfig',
    function ($rootScope, $scope, $filter, User, $location, localStorageService, $window, cMovilConfig) {


        // check the type of user for redirection
        $scope.isAuthenticatedWithRedirection = function () {
            if (User.can(cMovilConfig.ROLE_WAITER)) {
                $location.path("categories");
            }
            else
                return true;
        }
        $scope.getPuesto = function () {
            let puesto = parseInt(localStorageService.get("puesto"));
            var table = $filter('filter')(localStorageService.get("tables"), { id: puesto })[0];
            if (table)
                return true;
            else
                return false;
        }

        // say if the user has rol wished
        $scope.can = function (rol) {
            return User.can(rol);
        }

        // check if the user is authenticated
        $scope.isAuthenticated = function () {
            return User.isAuthenticated();
        }
        // login
        $scope.login = function () {
            $scope.submitted = true;
            if ($scope.form.$valid) {
                User.login($scope.user, $scope.password).success(function (data) {
                    if (data.success) {
                        localStorageService.set('user', data.usuario);
                        //    var host = $location.host();
                        //    var port = $location.port();
                        $window.location.href = cMovilConfig.URL_SPLASH + data.usuario.sucursalNombre;
                    }
                    else {
                        $scope.fail = true;
                    }
                })
                    .error(function () {
                        $scope.fail = true;
                    });
            }
        }
        // close session
        $scope.logout = function () {
            localStorageService.clearAll();
            $location.path("login");
        }


        // control action
        $scope.executeActionDevice = function (number) {
            $('#actionsDevice').modal('show');
            $rootScope.number = number;
        }
    }]);




/*Controller Order*/
cMovilControllers.controller('orderCtrl', ['$location', '$timeout', 'localStorageService', '$scope', 'WishList', 'Device', '$filter', 'Order', 'Config',
    function ($location, $timeout, localStorageService, $scope, WishList, Device, $filter, Order, Config) {

        // inicialize translator
        var translate = $filter('translate');

        /*Set vars for fill items or invoice or bill*/

        var branchoffice = localStorageService.get('branchoffice');
        var user = localStorageService.get('user');
        var printer = localStorageService.get("printer");
        $scope.datetime = new Date();
        $scope.bussines = branchoffice.nombre;
        $scope.cif = branchoffice.cif;
        $scope.waiter = user.nombre;
        $scope.items = [];
        $scope.ticketItems = [];
        $scope.part = 1;
        var self = this;

        /* Refresh change of table*/
        $scope.$watch(
            function ($scope) {
                printer = localStorageService.get("printer");
                $scope.itemsFilters = { locale: localStorageService.get('lang') };
                if ($scope.items.length > 0) {
                    $scope.showData = true;
                }
                else {
                    $scope.showData = false;
                }
            },
            function (newValue) {
            }
        );



        $scope.print = function (data) {
            if (!printer) {
                $scope.msgError = translate("You must select a printer from the submenu");
                $scope.showMessageError = true;
                $timeout(function () {
                    $scope.showMessageError = false;
                }, 2500);
                return false;
            }




            var contentItems = 'CANT.    DESCRIPCION     TOTAL \n';
            var contentTax = "";
            angular.forEach($scope.itemsTicket, function (item, key) {
                contentItems = contentItems + Config.alignString(item.Cantidad.toString(), 3) + " " + Config.alignString(item.Concepto.toString(), 20) + " " + Config.alignString(item.Total.toString(), 6) + '\n';
            });
            angular.forEach($scope.taxes, function (tax, key) {
                var taxMoney = $filter('number')(($filter('number')(tax.porcentaje, 2) / 100) * $filter('number')(data.subtotal, 2), 2);
                contentTax = contentTax + " " + Config.alignString(tax.nombre, 6) + "  " + Config.alignString(tax.porcentaje, 2) + "% (" + taxMoney + " EUR)";
            });
            var ticket = "            {{sucursal}}     \n" +
                "=============================\n" +
                "Ticket # {{ticket}}\n" +
                "Fecha Hora :{{fechahora}}\n" +
                "Mesa: {{puesto}}\n" +
                "Camarero: {{camarero}}\n" +
                "=============================\n" +
                "{{items}}\n" +
                "=============================\n" +
                "SUBTOTAL : {{subtotal}} EUR  \n" +
                "   {{taxes}}                 \n" +
                "TOTAL: {{total}} EUR         \n" +
                "=============================\n" +
                "GRACIAS POR SU COMPRA \n" +
                "OPINE CON EL PIN {{footer}}\n\n\n\n";

            ticket = ticket.replace("{{sucursal}}", data.sucursal);
            ticket = ticket.replace("{{fechahora}}", Config.alignString(data.fechahora, 19));
            ticket = ticket.replace("{{puesto}}", data.puesto);
            ticket = ticket.replace("{{camarero}}", data.camarero);
            ticket = ticket.replace("{{subtotal}}", $filter('number')(data.subtotal, 2));
            ticket = ticket.replace("{{taxes}}", contentTax);
            ticket = ticket.replace("{{total}}", $filter('number')(data.total, 2));
            ticket = ticket.replace("{{items}}", contentItems);

            var table = $filter('filter')(localStorageService.get("tables"), { numero: $scope.table })[0];

            Order.getPin(branchoffice.llave, table.id).success(function (data) {
                if (data.success) {
                    $scope.msgInfo = translate("Printing...");
                    $scope.showMessageInfo = true;
                    $timeout(function () {
                        $scope.showMessageInfo = false;
                    }, 6000);

                    ticket = ticket.replace("{{footer}}", data.pin);
                    ticket = ticket.replace("{{ticket}}", data.pin);
                    Device.print(printer, ticket);
                }
            })
                .error(function () {
                    alert("error al generar el pin");
                });


        }
        //        
        // close table or bill
        $scope.closeTable = function () {
            var table = $filter('filter')(localStorageService.get("tables"), { numero: $scope.table })[0];

            if ($scope.table && table) {

                WishList.closeTable(branchoffice.llave, table.id).success(function (data) {
                    if (data.success) {
                        $('.modal').modal('hide');
                        $scope.msgSuccess = translate("The bill was closed correctly");
                        $scope.showMessageSuccess = true;
                        $timeout(function () {
                            $scope.showMessageSuccess = false;

                            $location.path("/categories");
                        }, 2500);
                    }
                }).error(function (data) {
                    $scope.msgError = translate("Server Error");
                    $scope.showMessageError = true;
                    $timeout(function () {
                        $scope.showMessageError = false;
                    }, 1500);
                });
            }
            else {
                $scope.msgError = translate("You must choose a table please");
                $scope.showMessageError = true;
                $timeout(function () {
                    $scope.showMessageError = false;
                }, 1500);
            }
        },
            // search orders pending and printed
            $scope.searchOrders = function () {
                var table = $filter('filter')(localStorageService.get("tables"), { numero: $scope.table })[0];

                if ($scope.table && table) {
                    var branchoffice = localStorageService.get("branchoffice");
                    var state = "1,2,3"; // orders printed and pending
                    var items = [];

                    // get Orders pending
                    WishList.getOrders(branchoffice.llave, table.id, state).success(function (data) {
                        // get Orders
                        $scope.orders = data.pedidos;

                        $scope.itemsTicket = data.ticket;

                        // all items from 
                        angular.forEach($scope.orders, function (order, key) {
                            angular.forEach(order.items, function (item, key) {
                                item.order = order.id;
                                items.push(item);
                            });
                        });

                        // datas of item
                        $scope.subtotal = self.getSubTotal();
                        $scope.total = self.getTotal();
                        $scope.ticket = {
                            ticket: "-----",
                            sucursal: $scope.bussines,
                            items: self.contentItems,
                            fechahora: $filter('date')(new Date(), 'dd/MM/yyyy HH:mm:ss'),
                            puesto: table.numero,
                            camarero: $scope.waiter,
                            subtotal: self.getSubTotal(),
                            total: self.getTotal()
                        };
                    });

                    $scope.items = items;
                    $scope.taxes = localStorageService.get("taxes");



                }
                else {
                    $scope.msgError = translate("You must choose a table please");
                    $scope.showMessageError = true;
                    $timeout(function () {
                        $scope.showMessageError = false;
                    }, 1500);
                    $scope.items = [];
                }
            },
            // display total        
            this.getSubTotal = function () {

                var subtotal = 0;

                angular.forEach($scope.orders, function (order, key) {
                    subtotal += Number(order.importeTotal);
                });

                return subtotal;
            },
            this.getTotal = function () {
                var total = this.getSubTotal();
                var taxes = localStorageService.get("taxes");
                angular.forEach(taxes, function (tax, key) {
                    total += total * (tax.porcentaje / 100);
                });
                return total;
            }


    }]);

/* Controller Device */
cMovilControllers.controller('deviceCtrl', ['$filter', '$timeout', 'Device', '$scope', 'localStorageService',
    function ($filter, $timeout, Device, $scope, localStorageService) {
        $scope.devices = localStorageService.get("devices");

        $scope.executeAction = function (device, number) {
            device.accion = number;
            Device.executeAction(device).success(function (data) {

            });
        }

        $scope.selectPrinter = function (printer) {
            localStorageService.set("printer", printer);
        }
        $scope.$watch(
            function ($scope) {
                $scope.printerSelected = localStorageService.get("printer");
            },
            function (newValue) {
            }
        );

    }]);

/* Controller Kitchen */
cMovilControllers.controller('kitchenCtrl', ['$interval', 'localStorageService', '$filter', '$scope', 'Order', 'Device', 'cMovilConfig', '$rootScope', '$timeout', 'Config',
    function ($interval, localStorageService, $filter, $scope, Order, Device, cMovilConfig, $rootScope, $timeout, Config) {

        var branchoffice = localStorageService.get("branchoffice");
        var self = this;
        self.branchoffice = branchoffice;

        $scope.stateItemFilter = { estadoitem: cMovilConfig.STATE_ITEM_PENDING || cMovilConfig.STATE_ITEM_IMPRESO };

        self.getDevices = function () {
            $scope.devices = localStorageService.get("devices");
        }


        self.getOrders = function () {
            Order.getOrdersWithOutPrint(branchoffice.llave, $scope.dispositivos.uuid).success(function (data) {
                if (data.success) {
                    $scope.orders = data.pedidos;
                    angular.forEach(data.pedidos, function (order, key) {
                        self.print(order, cMovilConfig.ORIGIN_KITCHEN);
                    });
                }
            });
        }
        self.lastOrders = function () {
            Order.getLastOrders(branchoffice.llave).success(function (data) {
                $scope.lastOrders = data.pedidos;
            });
        }

        $scope.confirmOrder = function (order, device) {
            Order.confirmOrder(branchoffice.llave, order, device).success(function (data) {
                if (data.success) {
                    order.temporally = true;
                }
            });
        }
        $scope.cancelOrder = function (order, device) {
            if (!order.motive) {
                order.motive = "";
            }
            Order.cancelOrder(branchoffice.llave, order, device, order.motive).success(function (data) {
                if (data.success) {
                    order.temporally = true;
                }
            });
        },
            $scope.getState = function (order, state) {
                var report = $filter('filter')(order.reporte, { estado: state })

                if (Array.isArray(report) && report.length > 0) {
                    return report[0].cantidad;
                }

                return 0;
            }
        $scope.print = function (order) {
            self.print(order, cMovilConfig.ORIGIN_BUTTON);
        }

        self.print = function (order, origin) {
            var itemsSelecteds = [];
            if (origin === cMovilConfig.ORIGIN_KITCHEN) {
                itemsSelecteds = $filter('filter')(order.items, { estadoitem: cMovilConfig.STATE_ITEM_PENDING });
                // La Reimpresion no entra en el flujo automatico
                if ($scope.dispositivos.impresionDirecta == false) {
                    return false; // No es impresion directa entonces salgo.
                }
            }
            else {
                $scope.statesOfItem = function (item) {
                    return item.estadoitem == cMovilConfig.STATE_ITEM_PENDING || cMovilConfig.STATE_ITEM_IMPRESO;
                };
                itemsSelecteds = $filter('filter')(order.items, $scope.statesOfItem);
            }

            var items = [];
            angular.forEach(itemsSelecteds, function (item, key) {
                var device = $filter('filter')(item.dispositivos, { uuid: $scope.dispositivos.uuid });
                if (device.length > 0) {
                    items.push(item);
                }
            });

            // if there is not items return false else printing
            if (items.length <= 0) {
                return false;
            }

            // Si es ReImpresion
            if ($scope.dispositivos.impresionDirecta == false) {

                return Order.reprintOrder(self.branchoffice.llave, order, $scope.dispositivos)
                    .success(function (data) {
                        if (data.success) {

                        }
                    });

            }
            var contentItems = 'CANT.    DESCRIPCION \n';

            angular.forEach(items, function (item, key) {
                contentItems = contentItems + Config.alignString(item.cantidad.toString(), 3) + " " + Config.alignString(item.nombre.toString(), 26) + '\n';

                angular.forEach(item.suplementos, function (sup, key) {
                    contentItems = contentItems + "S" + Config.alignString(sup.cantidad.toString(), 2) + " " + Config.alignString(sup.nombre.toString(), 24) + '\n';
                });
            });
            var ticket = self.getTemplateKitchen(order, contentItems, Config);
            //console.log(ticket); // para testear sin impresora y ser feliz
            //  PRINT            
            if ($scope.dispositivos.uuid) {
                bt.disconnect();
                bt.connect($scope.dispositivos.uuid, function () {
                    bt.write(ticket, function (message) {
                        Order.confirmPrinting(self.branchoffice.llave, order, $scope.dispositivos).success(function (data) {
                            if (data.success) {
                                console.log("se informo OK");
                            }
                        });
                        bt.disconnect();
                    }, function () {
                        console.log("no escribio");
                    });
                }, function () {
                    console.log("no conecto");
                });
            }
            else {
                alert("no hay impresora");
            }
        }

        self.getTemplateKitchen = function (order, contentItems, Config) {
            var ticket = "";

            if (order.tipoId == cMovilConfig.ORDER_TYPE_DELIVERY) {
                ticket =
                    "Pedido # {{ticket}}   DELIVERY  \n" +
                    "Completados: {{completados}} Rechazados: {{rechazados}}\n" +
                    "Fecha Hora :{{fechahora}}\n" +
                    "=============================\n" +
                    "{{items}}\n" +
                    "Observaciones: {{observaciones}}\n " +
                    "=============================\n" +
                    "DATOS DE ENTREGA \n" +
                    " Nombre : {{nombre}}\n" +
                    " Apellido :{{apellido}}\n" +
                    " Calle : {{calle}}\n" +
                    " Nro : {{nro}}\n" +
                    " Piso : {{piso}} Dpto : {{dpto}} \n" +
                    " Aclaracion: {{aclaracion}}\n" +
                    " Email: {{email}}\n" +
                    " Telefono: {{telefono}}\n" +
                    " Costo Envio: {{costo}}\n" +
                    " Pago con: {{pagoCon}}\n \n \n \n";

            }
            else if (order.tipoId == cMovilConfig.ORDER_TYPE_TAKEAWAY) {
                ticket =
                    "Pedido # {{ticket}}   TAKEAWAY  \n" +
                    "Fecha Hora :{{fechahora}}\n" +
                    "=============================\n" +
                    "{{items}}\n" +
                    "Observaciones: {{observaciones}}\n " +
                    "=============================\n" +
                    " Nombre : {{nombre}}\n" +
                    " Apellido :{{apellido}}\n \n \n \n";
            }
            if (order.tipoId == cMovilConfig.ORDER_TYPE_ESTABLISHMENT) {
                ticket =
                    "Pedido # {{ticket}}   ESTABLECIMIENTO  \n" +
                    "Fecha Hora :{{fechahora}}\n" +
                    "=============================\n" +
                    "{{items}}\n" +
                    "Observaciones: {{observaciones}}\n " +
                    "=============================\n" +
                    "DATOS DE ENTREGA \n" +
                    " Nombre : {{nombre}}\n" +
                    " Apellido :{{apellido}}\n" +
                    " Calle : {{calle}}\n" +
                    " Nro : {{nro}}\n" +
                    " Piso : {{piso}} Dpto : {{dpto}} \n" +
                    " Aclaracion: {{aclaracion}}\n" +
                    " Email: {{email}}\n" +
                    " Telefono: {{telefono}}\n";
            }
            else {
                ticket = ticket + "\n" +
                    "Pedido # {{ticket}}\n" +
                    "Camarero : {{waiter}}\n" +
                    "Fecha Hora :{{fechahora}}\n" +
                    "Mesa: {{puesto}}\n" +
                    "=============================\n" +
                    "{{items}}\n" +
                    "Observaciones: {{observaciones}}\n \n \n \n";
            }

            ticket = ticket.replace("{{ticket}}", order.id);
            ticket = ticket.replace("{{fechahora}}", Config.alignString(order.fechaHora.date, 19));
            ticket = ticket.replace("{{puesto}}", order.puesto);
            ticket = ticket.replace("{{items}}", contentItems);
            ticket = ticket.replace("{{waiter}}", order.camarero);
            ticket = ticket.replace("{{observaciones}}", order.observaciones);
            ticket = ticket.replace("{{nombre}}", order.nombreDestinatario);
            ticket = ticket.replace("{{apellido}}", order.apellidoDestinatario);
            ticket = ticket.replace("{{calle}}", order.calleDestinatario);
            ticket = ticket.replace("{{nro}}", order.numeroDestinatario);
            ticket = ticket.replace("{{piso}}", order.pisoDestinatario);
            ticket = ticket.replace("{{dpto}}", order.dptoDestinatario);
            ticket = ticket.replace("{{aclaracion}}", order.aclaracionDestinatario);
            ticket = ticket.replace("{{email}}", order.emailDestinatario);
            ticket = ticket.replace("{{telefono}}", order.telefonoDestinatario);
            ticket = ticket.replace("{{costo}}", order.costoEnvio);
            ticket = ticket.replace("{{pagoCon}}", order.cuantoPaga);

            ticket = ticket.replace("{{completados}}", $scope.getState(order, cMovilConfig.STATE_ORDER_OK_REVERSE));
            ticket = ticket.replace("{{rechazados}}", $scope.getState(order, cMovilConfig.STATE_ORDER_FAIL_REVERSE));

            return ticket;
        }


        self.executeKitchen = function () {
            $rootScope.inter = $interval(function () {
                $('.modal').modal('hide');
                self.getOrders();
            }.bind(this), 10000, false);
        }

        // load the devices
        self.getDevices();
        self.executeKitchen();
    }]);

cMovilControllers.controller('socialCtrl', ['$scope', '$filter', 'cMovilConfig', '$location', function ($scope, $filter, cMovilConfig, $location) {
    // Share in facebook
    $scope.share = function (product) {
        FB.ui(
            {
                method: 'feed',
                name: product.nombre,
                link: cMovilConfig.URL_BASE_WS + 'uploads/images/productos/' + product.empresa + '/' + product.sucursal + '/' + product.logo,
                picture: cMovilConfig.URL_BASE_WS + 'uploads/images/productos/' + product.empresa + '/' + product.sucursal + '/' + product.logo,
                caption: product.nombre,
                description: product.descripcion,
                message: 'CartaMóvil'
            });
    };

    $scope.shareRating = function () {
        FB.ui(
            {
                method: 'feed',
                name: "#CartaMóvil #Compartir Opinion",
                link: "www.cartamovil.com",
                picture: "www.cartamovil.com",
                caption: "#CartaMóvil #Compartir Opinion",
                description: "#CartaMóvil #Compartir Opinion",
                message: 'CartaMóvil'
            });
    };

}]);

cMovilControllers.controller('ratingCtrl', ['$scope', '$filter', 'Review', '$timeout', 'localStorageService', '$location', function ($scope, $filter, Review, $timeout, localStorageService, $location) {
    // array of scores
    var plats = [];
    var questions = [];
    var translate = $filter('translate');
    var branchoffice = localStorageService.get("branchoffice");
    var puesto = localStorageService.get("puesto");
    var pin = localStorageService.get("pin");
    $scope.starRating = 0;

    // get Questions
    if (pin) {
        Review.getQuestions(branchoffice.llave).success(function (data) {
            $scope.questions = data.preguntas;
        });

        Review.getProductsByPin(branchoffice.llave, pin).success(function (data) {
            $scope.products = data.productos;
        });
    }

    $scope.cancelRating = function () {
        $('.modal').modal('hide');
    }
    $scope.checkPin = function () {

        if ($scope.pin) {
            Review.checkPin($scope.pin).success(function (data) {
                if (data.success && data.result) {
                    localStorageService.set("pin", $scope.pin);
                    $location.path("rating");
                }
                else {
                    $scope.msgError = translate("The Pin is invalid");
                    $scope.showMessageError = true;
                    $timeout(function () {
                        $scope.showMessageError = false;
                    }, 1500);
                }
            })
                .error(function (data) {
                    $scope.msgError = translate("The Pin is invalid");
                    $scope.showMessageError = true;
                    $timeout(function () {
                        $scope.showMessageError = false;
                    }, 1500);
                });
        }
    }

    /* Refresh change of table*/
    $scope.$watch(
        function ($scope) {

            $scope.langFilters = { locale: localStorageService.get('lang') };

        },
        function (newValue) {
        }
    );

    $scope.sendScore = function (product, puntaje) {
        Review.raitingProduct(product, puntaje).success(function (data) {
            if (data.success) {
                $scope.msgSuccess = translate("The score was sent sucessfully");
                $scope.showMessageSuccess = true;
                $timeout(function () {
                    $scope.showMessageSuccess = false;
                }, 2000);
            }
        }).error(function (data) {
            $scope.msgError = translate("Error sending the score. Please try again");
            $scope.showMessageError = true;
            $timeout(function () {
                $scope.showMessageError = false;
            }, 2000);
        });
    },
        // add score of plats
        $scope.addOrUpdateProduct = function (product, puntaje) {
            var item = $filter('filter')(plats, { producto: product })[0];
            if (item) {
                item.puntaje = puntaje;
            }
            else {
                plats.push({ id: product, puntaje: puntaje });
            }
        };

    // add score from questions
    $scope.addOrUpdateQuestion = function (question, puntaje) {
        var item = $filter('filter')(questions, { id: question })[0];
        if (item) {
            item.puntaje = puntaje;
        }
        else {
            questions.push({ id: question, puntaje: puntaje });
        }
    };

    // send request
    $scope.sendFeedbackClient = function () {
        Review.sendFeedbackClient(plats, questions, $scope.comment, pin, puesto).success(function (data) {
            if (data.success && data.result) {
                $scope.msgSuccess = translate("The score was sent sucessfully");
                $scope.showMessageSuccess = true;
                $timeout(function () {
                    $scope.showMessageSuccess = false;
                }, 2000);
                $('.modal').modal('hide');
                localStorageService.remove("pin");
            }
            else {
                $scope.msgError = translate("Error sending the score. Please try again");
                $scope.showMessageError = true;
                $timeout(function () {
                    $scope.showMessageError = false;
                }, 3000);
                $('.modal').modal('hide');
                localStorageService.remove("pin");
                $scope.cancelRating();
            }
        }).error(function () {
            $scope.msgError = translate("Error sending the score. Please try again");
            $scope.showMessageError = true;
            $timeout(function () {
                $scope.showMessageError = false;
            }, 3000);
            $('.modal').modal('hide');
            localStorageService.remove("pin");
            $scope.cancelRating();
        });
    }



}]);

cMovilControllers.controller('questionCtrl', ['$scope', '$filter', 'Review', '$timeout', 'localStorageService', '$location', function ($scope, $filter, Review, $timeout, localStorageService, $location) {
    // array of scores
    var questions = [];
    var translate = $filter('translate');
    var branchoffice = localStorageService.get("branchoffice");
    var puesto = localStorageService.get("puesto");
    $scope.starRating = 0;

    // get Questions
    Review.getQuestions(branchoffice.llave).success(function (data) {
        $scope.questions = data.preguntas;
    });

    $scope.cancelRating = function () {
        $('.modal').modal('hide');
        $timeout(function () {
            $location.path("categories");
        }, 500);

    }

    // add score from questions
    $scope.addOrUpdateQuestion = function (question, puntaje) {
        var item = $filter('filter')(questions, { id: question })[0];
        if (item) {
            item.puntaje = puntaje;
        }
        else {
            questions.push({ id: question, puntaje: puntaje });
        }
    };
    /* Refresh change of table*/
    $scope.$watch(
        function ($scope) {

            $scope.langFilters = { locale: localStorageService.get('lang') };

        },
        function (newValue) {
        }
    );
    // send request
    $scope.sendQuestions = function () {
        Review.sendQuestions(questions, $scope.comment, puesto).success(function (data) {
            if (data.success && data.result) {
                $scope.msgSuccess = translate("The score was sent sucessfully");
                $scope.showMessageSuccess = true;
                $timeout(function () {
                    $scope.showMessageSuccess = true;
                }, 2000);
                $('.modal').modal('show');
            }
            else {
                $scope.msgError = translate("Error sending the score. Please try again");
                $scope.showMessageError = true;
                $timeout(function () {
                    $scope.showMessageError = true;
                }, 3000);
                $('.modal').modal('show');
                $scope.cancelRating();
            }
        }).error(function () {
            $scope.msgError = translate("Error sending the score. Please try again");
            $scope.showMessageError = true;
            $timeout(function () {
                $scope.showMessageError = true;
            }, 3000);
            $('.modal').modal('show');
            $scope.cancelRating();
        });
    }



}]);


// Controller TypeProduct
cMovilControllers.controller('PaymentMethodCtrl', ['Order', '$sce', 'cMovilConfig', 'User', '$filter', '$scope', 'localStorageService', 'WishList', 'Establishment', '$location', '$timeout',
    function (Order, $sce, cMovilConfig, User, $filter, $scope, localStorageService, WishList, Establishment, $location, $timeout) {
        var self = this;
        var items = WishList.getAll();
        $scope.items = items;
        $scope.paymentMethods = localStorageService.get('paymentMethods');
        var taxes = localStorageService.get("taxes");
        $scope.taxes = taxes;
        var comment = localStorageService.get('comment');
        $scope.comment = (comment == null) ? '' : comment;
        // Check Type User
        $scope.isWaiter = User.can(cMovilConfig.ROLE_WAITER);
        $scope.isShowEnabled = (User.can(cMovilConfig.ROLE_WAITER) || localStorageService.get('puesto') == null) && localStorageService.get('mode') == null;
        $scope.isDelivery = User.can(cMovilConfig.ROLE_USER) && localStorageService.get('mode') == 'delivery';
        $scope.isTakeAway = User.can(cMovilConfig.ROLE_USER) && localStorageService.get('mode') == 'takeAway';
        $scope.isEstablishment = User.can(cMovilConfig.ROLE_USER) && localStorageService.get('mode') == 'establishment';
        $scope.paymentmodel = (function (arr) {
            for (var i = arr.length - 1; i >= 0; i--) {
                if (arr[i].default)
                    return arr[i].id;
            }
        })($scope.paymentMethods);
        $scope.shippingCost = localStorageService.get('branchoffice').costoFijoEnvio;
        // inicialize translator
        var translate = $filter('translate');

        // Refresh Scope when the language change
        $scope.$watch(
            function ($scope) {
                $scope.languageFilters = { locale: localStorageService.get('lang') };
            },
            function (newValue) {
            }
        );
        // get total supplements
        $scope.getSupplements = function (item) {
            var total = 0;
            angular.forEach(item.suplementos, function (sup, key) {
                total += sup.Amount * sup.precio;
            });
            if (angular.isUndefined(total) || isNaN(total)) {
                return 0;
            }
            return total;
        }
        // get subtotal
        this.getSubTotal = function () {
            var total = 0;
            angular.forEach(items, function (item, key) {
                total += item.Amount * item.precio;

                angular.forEach(item.suplementos, function (sup, key) {
                    if (angular.isDefined(sup.Amount) && angular.isDefined(sup.precio)) {
                        total += sup.Amount * sup.precio;
                    }

                });

            });
            return total;
        };
        // get total
        this.getTotal = function () {
            var total = this.getSubTotal();

            angular.forEach(taxes, function (tax, key) {
                total += total * (tax.porcentaje / 100);
            });
            if ($scope.isDelivery) {
                var shipping = $scope.shippingCost;
                total = total + parseFloat(shipping);
            }
            return total;
        }

        $scope.subtotal = this.getSubTotal();
        $scope.total = this.getTotal();


        // Send order to server
        $scope.sendOrder = function () {
            // validate the payment method

            var tableId = null; // lo pase a null para que no ensucie estadisticas
            var clientAddressData = null;
            var orderType = cMovilConfig.ORDER_TYPE_NORMAL;
            if (!$scope.payForm.$valid) {
                $scope.msgError = translate("You should choose a payment method");
                $scope.showMessageError = true;
                $timeout(function () {
                    $scope.showMessageError = false;
                }, 2000);
                return;
            }
            $scope.submitted = true;
            // validate the table
            if ($scope.table || localStorageService.get("puesto")) {

                if ($scope.table) {
                    var table = $filter('filter')(localStorageService.get("tables"), { numero: $scope.table })[0];
                    tableId = table.id;
                    $('.table-modal').modal('hide');
                }
                else {
                    tableId = parseInt(localStorageService.get("puesto"));
                }

            }
            else {
                if ($scope.isDelivery) { // DELIVERY MODE
                    if (!$scope.addressForm.$valid)
                        return;
                    $('.address-modal').modal('hide');
                    orderType = cMovilConfig.ORDER_TYPE_DELIVERY;
                    clientAddressData = $scope.addressData;


                }
                else if ($scope.isTakeAway) { // TAKE AWAY MODE
                    if (!$scope.clientForm.$valid)
                        return;
                    $('.client-modal').modal('hide');
                    orderType = cMovilConfig.ORDER_TYPE_TAKEAWAY;
                    clientAddressData = $scope.clientData;

                }
                else if ($scope.isEstablishment) { // ESTABLISHMENT MODE
                    orderType = cMovilConfig.ORDER_TYPE_ESTABLISHMENT;
                }
                else {
                    $scope.msgError = translate("You must choose a table please");
                    $scope.showMessageError = true;
                    $timeout(function () {
                        $scope.showMessageError = false;
                    }, 1500);
                    return;
                }


            }

            $scope.stateButton = true;
            WishList.sendOrder($scope.comment, tableId, $scope.paymentmodel, clientAddressData, orderType)
                .success(function (data) {
                    if (data.success) {
                        // delete the order
                        localStorageService.set('wishlist', []);
                        localStorageService.remove('comment');
                        $scope.items = [];
                        Order.saveOrderTemporally(data);
                        // process the payment method
                        self.processPaymentMethod(data);
                    }
                    else {
                        $scope.msgError = translate("The order was not sent. Please, try again");
                        $scope.showMessageError = true;
                        $timeout(function () {
                            $scope.showMessageError = false;
                        }, 2000);
                    }
                })
                .error(function (data) {
                    $scope.stateButton = false;
                    $scope.msgError = translate("The order was not sent. Please, try again");
                    $scope.showMessageError = true;
                    $timeout(function () {
                        $scope.showMessageError = false;
                    }, 2000);
                });

        } // END $scope.sendOrder  END

        self.processPaymentMethod = function (data) {
            if (data.paymentData.hasOwnProperty("urlPago")) {
                $scope.msgInfo = translate("Redirecting to pay...");
                $scope.showMessageInfo = true;
                $scope.action = $sce.trustAsResourceUrl(data.paymentData.urlPago);
                $scope.params = data.paymentData.params;
                $scope.version = data.paymentData.version;
                $scope.signature = data.paymentData.signature;
                $timeout(function () {
                    $scope.showMessageInfo = false;
                    document.frmApi.submit();
                }, 3000);

            }
            else {
                $scope.msgSuccess = translate("The order was sent sucessfully");
                $scope.orderSuccess = translate("Your order number is:");
                $scope.orderNumberSuccess = data.pedido.id;
                $scope.showMessageSuccess = true;
                $timeout(function () {
                    $scope.showMessageSuccess = false;
                    $location.path("/categories");
                }, 3500);
            }
        }

        $scope.sendOrderEstablishment = function () {
            var establishment = localStorageService.get("establishment");
            if (establishment) {
                if (angular.isUndefined($scope.comment)) {
                    $scope.comment = "";
                }

                Establishment.sendOrder($scope.comment, establishment).success(function (data) {

                    if (data.success) {
                        localStorageService.set('wishlist', []);
                        $scope.comment = "";
                        $scope.msgSuccess = translate("The order was sent sucessfully");
                        $scope.showMessageSuccess = true;
                        $timeout(function () {
                            $scope.showMessageSuccess = false;
                            $scope.items = [];
                            $location.path("/categories");
                        }, 3000);
                    }
                    else {
                        $scope.msgError = translate("The order was not sent. Please, try again");
                        $scope.showMessageError = true;
                        $timeout(function () {
                            $scope.showMessageError = false;
                        }, 2000);
                    }
                }).error(function (data) {
                    $scope.msgError = translate("The order was not sent. Please, try again");
                    $scope.showMessageError = true;
                    $timeout(function () {
                        $scope.showMessageError = false;
                    }, 2000);
                });
            }
            else {
                $scope.msgError = translate("You must choose a table please");
                $scope.showMessageError = true;
                $timeout(function () {
                    $scope.showMessageError = false;
                }, 1500);
            }
        }
    }]);

cMovilControllers.controller('myOrdersCtrl', ['$timeout', '$filter', '$sce', 'Order', '$scope', function ($timeout, $filter, $sce, Order, $scope) {
    var translate = $filter('translate');
    $scope.myOrders = Order.getHistory();

    $scope.processPaymentMethod = function (data) {
        // inicialize translator
        if (data.paymentData.hasOwnProperty("urlPago")) {
            $scope.msgInfo = translate("Redirecting to pay...");
            $scope.showMessageInfo = true;
            $scope.action = $sce.trustAsResourceUrl(data.paymentData.urlPago);
            $scope.params = data.paymentData.params;
            $scope.version = data.paymentData.version;
            $scope.signature = data.paymentData.signature;
            $timeout(function () {
                $scope.showMessageInfo = false;
                document.frmApi.submit();
            }, 3000);
        }
    }
}]);

cMovilControllers.controller('paymentOkCtrl', ['Order', '$routeParams', '$scope', function (Order, $routeParams, $scope) {

    Order.getOrderById($routeParams.order).success(function (data) {

        if (data.success) {
            Order.changeState(data.pedido);
        }
    });

}]);


cMovilControllers.controller('paymentFailCtrl', ['Order', '$routeParams', '$scope', function (Order, $routeParams, $scope) {
    Order.getOrderById($routeParams.order).success(function (data) {

        if (data.success) {
            Order.changeState(data.pedido);
            $scope.motive = data.pedido.motivo;
        }
    });
}]);

cMovilControllers.controller('faqsCtrl', ['$scope', function ($scope) {


}]);
