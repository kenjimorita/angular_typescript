/// <reference path="../../DefinitelyTyped-master/angularjs/angular.d.ts"/>
/// <reference path="../../DefinitelyTyped-master/jquery/jquery.d.ts"/>

class MyController{
	public fafa:string;
	public efafa:string;
	public myForm;
	public user;
	public user3;
	public selftext;
	constructor(private valuefa,public $scope //watchの為のscopeは他サービスと同じ扱いとして考える
	){
		this.$scope = $scope;
		this.valuefa = valuefa;
		this.user = "fafa";
		this.selftext = "morita";
		this.user3 = "linkuserです";
		MyController.$inject = ["valuefa","$scope"];//サービスは自分のコンストラクタに$injectで
		this.$scope.$watch('main.user',(newValue) =>{
			console.log(newValue);
		})
	}

		getdata(){
			console.log(this.fafa);
		}
		public validateCorporateIdPattern(value:string){
		}
	};
	//////////////////////linkなし
	function mainDDO(){
		return {
		restrict :"E", //2ではEは@Component  //Aは@Directive
		template:"<input type='text' ng-model='main.user'> hello {{main.user}}</p>",
		scope :{},//使わない場合も空objectでisolate scope化
		//&以外は使わない!,:scopeを共有してしまうので、&は読み込み専用
		//http://qiita.com/armorik83/items/5542daed0c408cb9f605
		// replace ://Deprecated
		controller :"MyController",
		controllerAs :"main"
		// bindToControler :""
		}
	}
/////////////////////linkあり
	class MainDefinetion {
		static postlink($scope,iElement,iAttr){
			//
		}
		static ddo(){
			return {
				restrict: "E",
				template: "<p>kfafa {{main2.user3}}</p>",
				controller : "MyController",
				controllerAs : "main2",
				link: MainDefinetion.postlink,
				scope:{}
			}
		}
	}


	/////////////////////
	///
	class MyselfD {
		constructor(public $scope){
			this.$scope = $scope;
			this.$scope.$watch('selftext',function(newValue){
				console.log(newValue);
			})
		}
		static postlink($scope,iElement,iAttr){

		}
		static ddo(){
			return {
				restrict: "E",
				scope: {},
				link: MyselfD.postlink,
				controller: "MyController",
				controllerAs: "fafa",
				template: "<input type='text' ng-model='fafa.selftext'>{{fafa.selftext}}"
			}
		}
	}



	var myApp = angular.module("myApp", ["ngMessages","ui.validate"]);

	myApp.controller("MyController",MyController);
	myApp.value('valuefa',{name : 'morita', age : 25});
	myApp.constant('moritaConst',[
		{name:'John', age:25, gender:'boy'},
		{name:'Jessie', age:30, gender:'girl'},
		{name:'Johanna', age:28, gender:'girl'},
		{name:'Joy', age:15, gender:'girl'},
		{name:'Mary', age:28, gender:'girl'},
		{name:'Peter', age:95, gender:'boy'},
		{name:'Sebastian', age:50, gender:'boy'},
		{name:'Erika', age:27, gender:'girl'},
		{name:'Patrick', age:40, gender:'boy'},
		{name:'Samantha', age:60, gender:'girl'}
	]);
	myApp.directive('main', mainDDO);
	myApp.directive('main2', MainDefinetion.ddo);
	myApp.directive('myself', MyselfD.ddo);
