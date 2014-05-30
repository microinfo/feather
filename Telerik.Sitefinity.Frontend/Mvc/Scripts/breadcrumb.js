﻿(function ($) {

    var breadcrumbModule = angular.module('breadcrumb', []);
    
    breadcrumbModule.factory('breadcrumbService', function ($rootScope) {
        var breadcrumbElements = [];

        var breadcrumbElement = function (propPath, propName) {
            this.PropertyPath = propPath;
            this.PropertyName = propName;
        };

        return {
            //push the element if it is not already presented
            push: function (propPath, propName) {
                var lastElement = breadcrumbElements[breadcrumbElements.length - 1];
                if (!lastElement || lastElement.PropertyPath !== propPath)
                    breadcrumbElements.push(new breadcrumbElement(propPath, propName));
            },
            //gets all breadcrumb elements
            getAll: function () {
                return breadcrumbElements;
            },
            //remove all breadcrumbElements
            removeAll: function () {
                breadcrumbElements = [];
            }
        };
    });
    
    breadcrumbModule.directive('breadcrumb', function (breadcrumbService) {
        return {
            restrict: 'A',
            template: '<ul class="breadcrumb"><li ng-repeat=\'bc in Breadcrumbs\' ng-class="{\'active\': {{$last}} }"><a ng-click="RefreshHierarchy(bc.PropertyPath, bc.PropertyName)" ng-bind="bc.PropertyName"></a></li></ul>',
            replace: true,
            link: function (scope, tElement, tAttrs) {

                //inspect whether the current view has been modified
                scope.$watch(tAttrs.ngModel, function (v) {
                    addSingleBreadcrumbElement(v);
                    $('.properties-grid').scrollTop(0);
                });

                //adds single path element at the end of the breadcrumb.
                addSingleBreadcrumbElement = function (propPath) {
                    if (propPath) {
                        if (breadcrumbService.getAll().length === 0)
                            breadcrumbService.push('', 'Home');

                        var containingProperties = propPath.split('/');
                        var propName = containingProperties[containingProperties.length - 1];
                        breadcrumbService.push(propPath, propName);

                        var breadcrumbElement = $(".breadcrumb");
                        breadcrumbElement.show();
                    }
                    scope.Breadcrumbs = breadcrumbService.getAll();
                };

                //generates all elements of the breadcrumb
                generateCurrentBreadcrumbElements = function (proeprtyPath, propName) {
                    breadcrumbService.removeAll();
                    breadcrumbService.push('', 'Home');
                    var breadcrumbElement = $('.breadcrumb');
                    if (proeprtyPath) {
                        breadcrumbElement.show();
                        var containingProperties = proeprtyPath.split('/');
                        containingProperties.forEach(function (propName) {
                            if (propName) {
                                var propPath = proeprtyPath.substr(0, proeprtyPath.indexOf(propName)) + propName;
                                breadcrumbService.push(propPath, propName);
                            }
                        });
                    }
                    else {
                        breadcrumbElement.hide();
                    }
                    return breadcrumbService.getAll();
                };

                //initial populate of the breadcrumb elements
                scope.Breadcrumbs = generateCurrentBreadcrumbElements();

                scope.RefreshHierarchy = function (propertyPath, propertyName) {
                    scope.propertyPath = propertyPath;
                    scope.propertyName = propertyName;
                    scope.Breadcrumbs = generateCurrentBreadcrumbElements(propertyPath, propertyName);
                };
            }
        };

    });

})(jQuery);