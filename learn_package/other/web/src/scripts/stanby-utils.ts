/// <reference path="./utils/extended-array.ts" />

// 任意の値を任意のindexに移動し、以降のindexを更新する関数。割り込むイメージ
// - targetIndex 任意の値が入っているindex
// - insertIndex 新しいindex先
Array.prototype.moveAndShift = function(targetIndex, insertIndex) {
	var val = this.splice(targetIndex, 1)[0];//取り出し（元の要素から削除）
	this.splice(insertIndex, 0, val);//insertしたい場所に挿入
	return this;
};




