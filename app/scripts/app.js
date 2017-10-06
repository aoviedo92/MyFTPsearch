(function () {
    'use strict';
    var _Partials = './partials';
    angular.module('app', [
            'ngRoute',
            'ngMaterial',
            'ngAnimate'
        ])
        .config(['$routeProvider', '$mdIconProvider', '$mdThemingProvider', function ($routeProvider, $mdIconProvider, $mdThemingProvider) {
            $routeProvider.when('/', {
                templateUrl: _Partials + '/search-page.html',
                animation: "slide"
            });
            $routeProvider.when('/ftp', {
                templateUrl: _Partials + '/ftp.html',
                animation: "slide"
            });
            $routeProvider.when('/show', {
                templateUrl: _Partials + '/show-server.html',
                animation: "slide"
            });
            $routeProvider.when('/search', {templateUrl: _Partials + '/search-page.html'});
            $routeProvider.otherwise({redirectTo: '/'});
            $mdIconProvider
                .iconSet('social', './assets/img/icons/sets/social-icons.svg', 24)
                .iconSet('device', './assets/img/icons/sets/device-icons.svg', 24)
                .defaultIconSet('./assets/img/icons/sets/core-icons.svg', 24);
            $mdThemingProvider.theme('default')
                .primaryPalette('deep-purple');
                //.accentPalette('orange');
        }
        ])
        .directive('focus', function ($timeout) {
            return {
                scope: {
                    trigger: '@focus'
                },
                link: function (scope, element) {
                    scope.$watch('trigger', function (value) {
                        if (value === "true") {
                            $timeout(function () {
                                element[0].focus();
                            });
                        }
                    });
                }
            };
        })
    ;


})();