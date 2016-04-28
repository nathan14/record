(function(){
    var app = angular.module('Record', ['chart.js'])

    .service('SelectorService', function($http, $q) {
        this.emptyData = function() {
            return [
                [{'name': 'gender', 'value': ''}, {'name': 'age', 'value': ''}, {'name': 'illness', 'value': ''}],
                [{'name': 'clinical-effectiveness', 'value': 50}, {'name': 'weight-gain', 'value': 1}, { 'name': 'EPS', 'value': 1 }],
                [{'name': 'prolactin', 'value': 1 }, { 'name': 'sedation', 'value': 1 }, { 'name': 'QTc', 'value': 1 }],
                [{'name': 'toSave', 'value': 0}]
            ];
        }

        this.emptyResults = function() {
            return {
                name1: '', name2: '', name3: '', name4: '', name5: ''
            }
        };

        this.saveData = function(data) {
            var promise = $http.post('Services/Record_Service.asmx/SaveInput', data);
            var def = $q.defer();

            promise.then(function(response) {
                return def.resolve(response);
            });

            return def.promise;
        }

        this.retriveData = function(data) {
            var promise = $http.post('Services/Record_Service.asmx/BuildMedicineListSeperated', data);
            var def = $q.defer();
            
            promise.then(function(response) {
                return def.resolve(response);
            });
            
            return def.promise;
        }

        this.retriveAllData = function() {
            var promise = $http.post('Services/Record_Service.asmx/ReturnAllMedicinesData', '');
            var def = $q.defer();
            
            promise.then(function(response) {
                return def.resolve(response);
            });
            
            return def.promise;
        }

        this.getDataByName = function(name, allData) {
            for(var i = 0; i < allData.length; i++) {
                if(allData[i].medicineName == name) {
                    return allData[i];
                }
            }
        }

        this.removedResults = function() {
            return [];
        }

        this.valuesChanged = function() {
            return [];
        }

        this.createJSONToSend = function(dataJSON) {
            var dataJSONToSend = { 
                    gender: dataJSON[0].value,
                    age: dataJSON[1].value,
                    illness: dataJSON[2].value,
                    clinical_effectivnes: dataJSON[3].value,
                    weight_gain: dataJSON[4].value,
                    eps: dataJSON[5].value,
                    prolactin: dataJSON[6].value,
                    sedation: dataJSON[7].value,
                    QTc_Prologation: dataJSON[8].value,
                    toSave: dataJSON[9].value,
                    username: window.localStorage.getItem('username') || null
            }

            return dataJSONToSend;
        }

        this.filterRemovedResults = function(results, removedResults) {
            var slicedResults = [];
            var addResult = true;
            for(var i = 0; i < results.length; i++) {
                for(var j = 0; j < removedResults.length; j++) {
                    if(results[i].MedicineName == removedResults[j]) {
                        addResult = false;
                    }
                }
                if(addResult) slicedResults.push(results[i]);
                addResult = true;
            }

            return slicedResults;
        }

        this.getValuesChanged = function(dataJSONToSendCompare, dataJSONToSend, changesMade) {
            if(JSON.stringify(dataJSONToSendCompare) != JSON.stringify(dataJSONToSend)) {
                for(var firstKey in dataJSONToSend) {
                    if(dataJSONToSend.hasOwnProperty(firstKey) && (firstKey == 'gender' || firstKey == 'age')) {
                        for(var secondKey in dataJSONToSendCompare) {
                            if(dataJSONToSendCompare.hasOwnProperty(firstKey)) {
                                if(firstKey == secondKey) {
                                    if(dataJSONToSend[firstKey] != dataJSONToSendCompare[secondKey]) {
                                        if(changesMade.indexOf(firstKey) == -1) {
                                            changesMade.push(firstKey);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return changesMade;
        }
    })

    .service('ChartService', function() {
        this.initCharts = function(data) {
            var self = this;

            var chartArray = {
                labels: [],
                chartData: [[]],
                colours: [
                    {fillColor:['#393D3F', '#C98CA7', '#E76D83', '#3AC089', '#7E3D3F', '#9CC4B2']},
                    {highlightFill:['#000', '#000', '#000', '#000', '#000', '#000']}]
            }

            angular.forEach(data[1], function(item, key) {
                if(item.name.length > 13) {
                    var tempName = item.name.substring(0, 13) + '...';
                    chartArray.labels.push(self.formatLabel(tempName));
                }
                else {
                    chartArray.labels.push(self.formatLabel(item.name));
                }

                chartArray.chartData[0].push(item.value);
            });

            angular.forEach(data[2], function(item, key) {
                chartArray.labels.push(self.formatLabel(item.name));
                chartArray.chartData[0].push(item.value);
            });

            return chartArray;
        }

        this.formatLabel = function(label) {
            label = label.replace(/-/g, ' ');
            label = label.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
            if(label.length < 4) {
               label = label.toUpperCase();
            }

            return label;
        }
    })

    .service('LoginService', function($http, $q){
        this.login = function(data) {
            var promise = $http.post('Services/Record_Service.asmx/Authenticate', data);
            var def = $q.defer();
            
            promise.then(function(response) {
                return def.resolve(response);
            });
            
            return def.promise;
        }
    })

    .controller('NavbarController', function($scope, $rootScope, $window, LoginService, SelectorService) {
        if(window.localStorage.getItem('username')) {
            $rootScope.isLoggedIn = true;
            $scope.username = window.localStorage.getItem('username');
        }
        else {
            $rootScope.isLoggedIn = false;
        }
        
        $scope.login = function() {
            var username = $scope.username;
            var password = $scope.password;
            var loginData = {username: username, password: password};
            var loginDataToSend = JSON.stringify(loginData)
            var loginPromise = LoginService.login(loginData);

            loginPromise.then(function (response) {
                var result = JSON.parse(response.data["d"]);
                if(result) {
                    $rootScope.isLoggedIn = result;
                    console.log('Logged in as: ' + username);
                    window.localStorage.setItem('username', username);
                }
                else {
                    alert('Wrong Credentials');
                }
            });
        }

        $scope.logout = function() {
            window.localStorage.removeItem('username');
            $window.location.reload();
        }
    })

    .controller('FormController', function($scope, $interval, $timeout, $rootScope, SelectorService, ChartService) {
        // Get all data for all medicines
        var retriveAllData = SelectorService.retriveAllData();
        var allData;
        retriveAllData.then(function(response) {
            allData = JSON.parse(response.data["d"]);
            console.log('All Data');
            console.log(allData);
        });

        var removedResults = SelectorService.removedResults();      
        $scope.data = SelectorService.emptyData();
        $scope.submitBtn = 'Save Results';
        $scope.results = SelectorService.emptyResults();
        $scope.changesMade = SelectorService.valuesChanged();
        $scope.popup = {
            title: 'title',
            info: 'info info info',
            dontUseWith: 'dont use with'
        }

        var dataJSONToSendCompare = '';

        $scope.formSubmit = function(toSave) {
            var data = $scope.data;
            data[3][0].value = toSave ? '1' : '0';
            var dataJSON = [].concat.apply([], data);
            var dataJSONToSend = SelectorService.createJSONToSend(dataJSON);

            $scope.changesMade = SelectorService.getValuesChanged(dataJSONToSendCompare, dataJSONToSend, $scope.changesMade);
            dataJSONToSendCompare = dataJSONToSend;
            console.log(dataJSONToSend);
            dataJSONToSend = JSON.stringify(dataJSONToSend);

            if(toSave) {
                var saveData = SelectorService.saveData(dataJSONToSend);
                saveData.then(function(response) {
                    var sessionId = response.data.d;
                    clearSelectors(sessionId);
                });
            }
            else {
                var retriveData = SelectorService.retriveData(dataJSONToSend);
                retriveData.then(function(response) {
                    console.log(response);
                    var results = JSON.parse(response.data["d"]);
                    $scope.results = results;
                    $scope.results = SelectorService.filterRemovedResults($scope.results, removedResults);
                });
            }
        };

        $scope.resultInfo = function(result) { // Show modal with result information
            $scope.popup.contraIndications = '';
            $scope.popup.interactions = '';
            var resultData = SelectorService.getDataByName(result.MedicineName, allData);
            $('#modal-notice').modal('show');
            $scope.popup.title = result.MedicineName;
            $scope.popup.info = 'info info info';
            $scope.popup.dontUseWith = 'dont use with';
            $scope.popup.contraIndications = resultData.all_Contra_Indications;
            $scope.popup.interactions = resultData.all_Interactions;
        }

        $scope.removeResult = function(resultName) { // Add another removed result 
            removedResults.push(resultName);
            $scope.results = SelectorService.filterRemovedResults($scope.results, removedResults);
        }

        $rootScope.resetForm = function() {
            $scope.data = SelectorService.emptyData();
            removedResults = SelectorService.removedResults();
            $scope.genderState = '';
            $scope.ageState = '';
            $scope.illnesState = '';
            $scope.changesMade = [];
        }

        $scope.$watch('data', function() {
            loadCharts();
            $scope.formSubmit();
        }, true);

        $scope.chartOptions = {
            scaleShowLabels: false,
            scaleLineColor: 'transparent',
            scaleShowGridLines : false,
            scaleShowHorizontalLines: false,
            maintainAspectRatio: false,
            scaleShowVerticalLines: false,
            datasetStroke: false
        }

        var clearSelectors = function(sessionId) {
            $scope.submitBtn = 'Saving...';
            $scope.sessionId = sessionId;
            $('#modal-saved').modal('show');
            $timeout(function() {
                $scope.submitBtn = 'Save Results';
                $scope.submitState = ''; // Clear selected class submit btn
            }, 2000)
        }

        var loadCharts = function() {
            var chartArray = ChartService.initCharts($scope.data);
            $scope.labels = chartArray.labels;
            $scope.chartData = chartArray.chartData;
            $scope.colours = chartArray.colours;
        }
    })

    .filter('indexFilter', function() {
        return function(index) {
            var output = '';

            switch(index) {
                case 2: output = 'nd'; break;
                case 3: output = 'rd'; break;
                case 4: output = 'th'; break;
                case 5: output = 'th'; break;
            }

            return (index + output);
        }
    })

    .filter('firstUpperCase', function() {
        return function(label) {
            label = label.replace(/-/g, ' ');
            label = label.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
            if(label.length < 4) {
               label = label.toUpperCase();
            }

            return label;
        }
    })

    .directive('inputRange', function($compile) {
        var linker = function(scope, element, attrs) {
            var template = '<div id="{{info.name}}" class="input-group input-group-range">'
                        +   '<div class="input-group-label">{{info.name | firstUpperCase}}</div>'
                        +       '<input class="input-group-range-text form-control input-md" min="0" max="100" value="{{info.value}}" type="number" maxlength="3">'
                        +       '<input class="input-group-range-slider" ng-model="info.value" ng-init="value=1" type="range" min="1" max="100">'
                        +    '</div>'
                        +'</div>';

            element.html(template).show();
            $compile(element.contents())(scope);
        }

        return {
            restrict: 'E',
            link: linker,
            scope: {
                info: '='
            }
        }
    })
})();