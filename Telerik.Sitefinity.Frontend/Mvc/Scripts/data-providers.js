﻿
(function ($) {

    var dataProvidersModule = angular.module('dataProviders', []);

    dataProvidersModule.factory('providerService', function ($http, $q, urlService) {
        var defaultProviderName = '',
            defaulltProvider;

        var getCookie = function (cname) {
            var name = cname + '=';
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i].trim();
                if (c.indexOf(name) == 0)
                    return c.substring(name.length, c.length);
            }
            return '';
        };

        //returns an array of available providers
        var getAll = function (managerName) {

            var getUrl = urlService.providersDataServiceUrl
                + 'providers/?sortExpression=Title'
                + '&dataSourceName=' + managerName
                + '&siteId=' + getCookie('sf_site')
                + '&itemType=Telerik.Sitefinity.Multisite.Web.Services.ViewModel.SiteDataSourceLinkViewModel'
                + '&itemSurrogateType=Telerik.Sitefinity.Multisite.Web.Services.ViewModel.SiteDataSourceLinkViewModel'
                + '&allProviders=true'
                + '&skip=0'
                + '&take=50';

            var deferred = $q.defer();
            $http.get(getUrl, { cache: false })
                .success(function (data) {
                    deferred.resolve(data);
                })
                .error(function (data) {
                    deferred.reject(data);
                });

            return deferred.promise;
        };

        //return the default provider
        var getDefault = function (providerList) {
            if (!defaultProviderName)
                defaultProviderName = urlService.defaultProviderName;

            if (providerList && providerList.length > 0) {
                for (var i = 0; i < providerList.length; i++) {
                    if (providerList[i].Name === defaultProviderName) {
                        return providerList[i];
                    }
                }
                return providerList[0];
            }

            return null;
        };

        //sets the default provider name
        var setDefaultProviderName = function (providerName) {
            defaultProviderName = providerName;
        };

        //gets the default provider name
        var getDefaultProviderName = function () {
            if (!defaultProviderName)
                defaultProviderName = UrlHelperService.defaultProviderName;
            return defaultProviderName;
        };

        //the public interface of the service
        return {
            getAll: getAll,
            getDefault: getDefault,
            setDefaultProviderName: setDefaultProviderName,
            getDefaultProviderName: getDefaultProviderName
        };
    });
    
    dataProvidersModule.directive('provider-selector', function (providerService) {
        return {
            restrict: 'E',
            template: '<div class="dropdown s-bg-source-wrp" ng-show="IsProviderSelectorVisible">'
                        + '<a class="btn btn-default dropdown-toggle" >'
                            + '{{SelectedProvider.Title}} <span class="caret"></span>'
                        + '</a>'
                        + '<ul class="dropdown-menu" >'
                            + '<li>'
                                + '<a href="#">-Provider-</a>'
                            + '</li>'
                            + '<li ng-repeat="provider in Providers">'
                                + '<a href="#" ng-click="SelectedProviderChanged(provider)">{{provider.Title}}</a>'
                            + '</li>'
                        + '</ul>'
                     + '</div>',
            replace: true,
            link: function (scope, tElement, tAttrs) {

                var onGetProvidersSuccess = function (data) {
                    scope.Providers = data.Items;
                    scope.SelectedProvider = providerService.getDefault(data.Items);
                    scope.SelectedProviderName = providerService.getDefaultProviderName();

                    var currentSelectedProviderName;
                    if (data && data.Items && data.Items.length >= 2) {
                        scope.IsProviderSelectorVisible = true;
                        if (scope.SelectedProvider)
                            currentSelectedProviderName = scope.SelectedProvider.Name;
                    }
                    else {
                        scope.IsProviderSelectorVisible = false;
                    }
                };

                var onGetProvidersError = function () {
                    scope.$emit('errorOccurred', { message: 'Error occurred while populating providers list!' });
                };

                scope.SelectedProvider = null;

                //if provider name is set explicitly the dropdown will be updated
                scope.$watch('SelectedProviderName', function () {
                    scope.SelectedProvider = providerService.getDefault(scope.Providers);
                    if (scope.SelectedProvider)
                        scope.$emit('providerSelectionChanged', { providerName: scope.SelectedProvider.Name });
                });

                //if selection is changed manually from the dropdown
                scope.SelectedProviderChanged = function (provider) {
                    scope.SelectedProvider = provider;
                    if (provider) {
                        var currentSelectedProviderName = provider.Name;
                        scope.$emit('providerSelectionChanged', { providerName: currentSelectedProviderName });
                    }
                };

                scope.IsProviderSelectorVisible = false;

                if (tAttrs && tAttrs.managerType)
                    providerService.getAll(tAttrs.managerType).then(onGetProvidersSuccess, onGetProvidersError);
                else
                    scope.$emit('errorOccurred', { message: 'Error occurred while populating provider list! Please provide value to the managerType attribute!' });
            }
        };
    });

})(jQuery);