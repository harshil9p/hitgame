"use strict";

/* main model generation */ 
var app = angular.module("hitgame", ['toaster']);

/* interpolater to not get conflicts with the server rendering */ 
app.config(function($interpolateProvider){
     $interpolateProvider.startSymbol('[[').endSymbol(']]');
 });


app.run(function($rootScope){
    $rootScope.TIMEINTERVAL = 15;
});

/* directives list */

app.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
});