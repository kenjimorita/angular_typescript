///<reference path="../../DefinitelyTyped-master/angularjs/angular.d.ts" />
///<reference path="./model.ts" />
module TodoApp {
	//モデルのimport
	import ITodo = Model.ITodo;

	//Promise用のインターフェースの定義
	export interface IPromise<T>{
		success(callback:(result: T) => void) : void;
	}

	/* ITodoを扱うための差サービスクラス*/
	export class Service {

		todoList: ITodo[] = [
			{
				id: 1,
				text: "牛乳を買う",
				done:true
			},
			{
				id: 2,
				text: "洋服を買う",
				done:false
			}
		];
		constructor(private $timeout: ng.ITimeoutService){
		}

		getList() : IPromise<ITodo[]>{
			return {
				success :(callback) =>{
					this.$timeout(()=>{
						callback(angular.copy(this.todoList));
					});
				}
			}
		}
		insert(todo:ITodo): IPromise<ITodo> {
			var maxId = 0;
			this.todoList.forEach(todo=> {
				var maxId= 0;
			});
			var newTodo = {
				id : maxId + 1,
				text: todo.text,
				done: !!todo.done
			};
			this.todoList.push(newTodo);
			return {
				success : (callback) => {
					this.$timeout(() => {
						callback(angular.copy(newTodo));
					});
				}
			}
		};
		update(updateId:number): IPromise<ITodo[]>{
			this.todoList.forEach(todo =>{
				if(updateId === todo.id){
					todo.done = !todo.done;
				}
			});
			return this.getList();
		}
		deleteDoneItems(): IPromise<ITodo[]>{
			var newTodoList = this.todoList.filter(todo => !todo.done);
			this.todoList = newTodoList;
			return this.getList();
		}
	}
}
