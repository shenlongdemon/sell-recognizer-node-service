(function () {
    'use strict';
    var currentVersion = '1.0.81.2016008.1436';    
    var app = angular
            .module('app', ['ngRoute', 'ngCookies', 'ui.router', 'ngAnimate', 'cfp.loadingBar', 'ngStorage', 'darthwade.loading', 'ui.bootstrap']);

    app.factory('HttpRequestTimeoutInterceptor', function ($q, $rootScope, HttpPendingRequestsService, cfpLoadingBar) {
        return {
            request: function (config) {
                delete $rootScope.globalError;
                config = config || {};
                //if (config.timeout === undefined) {
                config.timeout = HttpPendingRequestsService.newTimeout();
                //}
                cfpLoadingBar.start();
                return config;
            },
            requestError: function (rejection) {
                console.log(rejection); // Contains the data about the error on the request.
                cfpLoadingBar.complete();

                // Return the promise rejection.
                return $q.reject(rejection);
            },
            response: function (response) {
                
                var deferred = $q.defer();
                deferred.resolve(response);
                cfpLoadingBar.complete();
                return deferred.promise;
            },
            responseError: function (response) {
                console.log(response);
                if (response.config.timeout.isGloballyCancelled)
                {
                    return $q.defer().promise;
                }

                cfpLoadingBar.complete();
                return $q.reject(response);
            }
        };
    });


    app.service('HttpPendingRequestsService', function ($q, cfpLoadingBar) {
        var cancelPromises = [];
        function newTimeout() {
            var cancelPromise = $q.defer();
            cancelPromises.push(cancelPromise);
            return cancelPromise.promise;
        }
        function cancelAll() {
            angular.forEach(cancelPromises, function (cancelPromise)
            {
                cancelPromise.promise.isGloballyCancelled = true;
                cancelPromise.resolve();
            });

            cfpLoadingBar.complete();
            cancelPromises.length = 0;
        }
        return {
            newTimeout: newTimeout,
            cancelAll: cancelAll
        };
    });

    app.config(config)
    .constant('Constants',
            {
                HOST: window.location.origin,
                API_BASE: window.location.origin + "/api/{service}/{action}",                
                SOAP_API: "http://96.93.123.234/easyWebService/Service1.asmx"
            }
    )
    .run(run);


    config.$inject = ['$routeProvider', '$httpProvider', 'cfpLoadingBarProvider', '$provide', '$compileProvider'];

    function config($routeProvider, $httpProvider, cfpLoadingBarProvider, $provide, $compileProvider) {

        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|javascript):/);
        cfpLoadingBarProvider.includeSpinner = true;
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        $routeProvider
                // by default, we just edit home/index.view.html to display main page
               .when('/', {
                   controller: 'HomeController',
                   templateUrl: 'home/index.view.html'
               })
               .when('/:module', {
            	   templateUrl:function(params) {
            		   var url = "/modules/" + params.module + "/index.view.html";                		   
                       return url;
            	   }
               })
               .when('/:module/:page', {
                   
            	   templateUrl:function(params) {
            		   var url = "/modules/" + params.module + "/view/" + params.page + ".view.html";            		   
                       return url;
            	   }
               })               
              .otherwise({redirectTo: '/'});

        //$locationProvider.html5Mode(true);

        run.$inject = ['$rootScope', '$location', '$cookieStore', '$http', '$injector', '$localStorage', 'HttpPendingRequestsService'];


        var $http, interceptor = ['$q', '$injector', '$location', '$rootScope', 'Constants', function ($q, $injector, $location, $rootScope, Constants) {
                function success(response) {
                    $http = $http || $injector.get('$http');
                    return response;
                }


                function error(response) {
                    delete $rootScope.globalError;
                    $http = $http || $injector.get('$http');
                    if (response.status === 403)
                    {
                        $location.path('/unauthorized');
                    } else if (response.status !== 400 && response.status !== 401) {
                        if (response.config.timeout.isGloballyCancelled)
                        {
                            $rootScope.globalError = "Request has been cancelled by user.";
                        } else {
                            $rootScope.globalError = "API_NOT_AVAILABLE";
                        }

                        return $q.reject(response);
                    } else if (response.status >= 500) {
                        $rootScope.globalError = "SERVER_HAS_PROBLEM";
                        return $q.reject(response);
                    } else
                    {
                        delete $rootScope.globalError;
                        return $q.reject(response);
                    }
                }

                return function (promise) {
                    return promise.then(success, error);
                };
            }];
        $httpProvider.interceptors.push('HttpRequestTimeoutInterceptor');
        $httpProvider.responseInterceptors.push(interceptor);
    }   

    function run($rootScope, $location, $cookieStore, $http, $injector, $localStorage, HttpPendingRequestsService) {    	
        $rootScope.version = currentVersion;
    }

})();
