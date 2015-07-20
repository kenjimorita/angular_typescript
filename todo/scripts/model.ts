module TodoApp.Model {
	/* TODO1件を表すデータ*/
	export interface ITodo {
		/* TODOのID*/
		id?: number;
		/* TODOの内容*/
		text: string;
		/* TODOが完了済みかどうか*/
		done: boolean;
	}
}
