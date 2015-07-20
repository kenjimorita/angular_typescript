///<reference path="../../DefinitelyTyped-master/angularjs/angular.d.ts" />
///<reference path="./model.ts" />
var TodoApp;
(function (TodoApp) {
    var Service = (function () {
        function Service($timeout) {
            this.$timeout = $timeout;
            this.todoList = [
                {
                    id: 1,
                    text: "牛乳を買う",
                    done: true
                },
                {
                    id: 2,
                    text: "洋服を買う",
                    done: false
                }
            ];
        }
        Service.prototype.getList = function () {
            var _this = this;
            return {
                success: function (callback) {
                    _this.$timeout(function () {
                        callback(angular.copy(_this.todoList));
                    });
                }
            };
        };
        Service.prototype.insert = function (todo) {
            var _this = this;
            var maxId = 0;
            this.todoList.forEach(function (todo) {
                var maxId = 0;
            });
            var newTodo = {
                id: maxId + 1,
                text: todo.text,
                done: !!todo.done
            };
            this.todoList.push(newTodo);
            return {
                success: function (callback) {
                    _this.$timeout(function () {
                        callback(angular.copy(newTodo));
                    });
                }
            };
        };
        ;
        Service.prototype.update = function (updateId) {
            this.todoList.forEach(function (todo) {
                if (updateId === todo.id) {
                    todo.done = !todo.done;
                }
            });
            return this.getList();
        };
        Service.prototype.deleteDoneItems = function () {
            var newTodoList = this.todoList.filter(function (todo) { return !todo.done; });
            this.todoList = newTodoList;
            return this.getList();
        };
        return Service;
    })();
    TodoApp.Service = Service;
})(TodoApp || (TodoApp = {}));
