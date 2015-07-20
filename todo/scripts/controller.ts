///<reference path="../../DefinitelyTyped-master/angularjs/angular.d.ts" />
///<reference path="./model.ts" />
///<reference path="./service.ts" />

module TodoApp{
	import ITodo = Model.ITodo;

	export interface Scope extends ng.IScope {
		text: string;
		insert() : void;
		update(todo:ITodo):void;
		deleteDoneItems():void;
		todoList:TodoApp.Model.ITodo[];
	}
	export class Controller {
		constructor (public $scope: Scope,public todoService: TodoApp.Service){
			this.$scope.insert = this.insert.bind(this);
			this.$scope.update = this.update.bind(this);
			this.$scope.deleteDoneItems = this.deleteDoneItems.bind(this);

			this.todoService.getList()
			.success(todoList=>{
				this.$scope.todoList = todoList;
			});
		}
		insert():void {
			var todo: ITodo = {
				text: this.$scope.text,
				done: false
			};
			this.todoService.insert(todo)
			.success(todo => {
				this.$scope.todoList.push(todo);
				this.$scope.text = "";
			});
		}
		update(updateTodo:ITodo): void {
			this.todoService.update(updateTodo.id)
			.success(todoList=>{
				this.$scope.todoList = todoList;
			});
		}
		deleteDoneItems():void{
			this.todoService.deleteDoneItems()
			.success(newTodoList=>{
				this.$scope.todoList = newTodoList;
			});
		};
	}
}



// interface IStringPromise {
// 	success(callback:(result:string) => void): void;
// }
// function returnPromise(): IStringPromise{
// 	var result: string;
// 	var callback : (result:string) => void;
// 	window.setTimeout(()=> {
// 		result = "非同期完了";
// 		if(callback !== null){
// 			callback(result);
// 		}
// 	},3000);
// 	return {
// 		success:(callbackFunction:(result:string)=> void) => {
// 			if(result !== undefined){
// 				window.setTimeout(()=> {
// 					callbackFunction(result);
// 				},0); // 			}else{
// 				callback = callbackFunction;
// 			}
// 		}
// 	};
// }
// var promiseA = returnPromise();
// promiseA.success(result =>{
// 	alert(result);
// });
//
// var promiseB = returnPromise();
// window.setTimeout(()=>{
// 	promiseB.success(result =>{
// 		alert(result);
// 	});
// },4000);
