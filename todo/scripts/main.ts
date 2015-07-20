/// <reference path="../../DefinitelyTyped-master/angularjs/angular.d.ts"/>
/// <reference path="./model.ts"/>
/// <reference path="./service.ts"/>
/// <reference path="./controller.ts"/>

module TodoApp{
	angular.module("todo",[])
	.service("todoService",TodoApp.Service)
	.controller("TodoController",TodoApp.Controller);
}
