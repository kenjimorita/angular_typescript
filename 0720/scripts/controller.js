///<reference path="../../DefinitelyTyped-master/angularjs/angular.d.ts" />
///<reference path="./model.ts" />
///<reference path="./service.ts" />
var TodoApp;
(function (TodoApp) {
    var Controller = (function () {
        function Controller($scope, todoService) {
            var _this = this;
            this.$scope = $scope;
            this.todoService = todoService;
            this.$scope.insert = this.insert.bind(this);
            this.$scope.update = this.update.bind(this);
            this.$scope.deleteDoneItems = this.deleteDoneItems.bind(this);
            this.todoService.getList()
                .success(function (todoList) {
                _this.$scope.todoList = todoList;
            });
        }
        Controller.prototype.insert = function () {
            var _this = this;
            var todo = {
                text: this.$scope.text,
                done: false
            };
            this.todoService.insert(todo)
                .success(function (todo) {
                _this.$scope.todoList.push(todo);
                _this.$scope.text = "";
            });
        };
        Controller.prototype.update = function (updateTodo) {
            var _this = this;
            this.todoService.update(updateTodo.id)
                .success(function (todoList) {
                _this.$scope.todoList = todoList;
            });
        };
        Controller.prototype.deleteDoneItems = function () {
            var _this = this;
            this.todoService.deleteDoneItems()
                .success(function (newTodoList) {
                _this.$scope.todoList = newTodoList;
            });
        };
        ;
        return Controller;
    })();
    TodoApp.Controller = Controller;
})(TodoApp || (TodoApp = {}));
