

Array.prototype.moveAndShift = function (targetIndex, insertIndex) {
    var val = this.splice(targetIndex, 1)[0];
    this.splice(insertIndex, 0, val);
    return this;
};

//# sourceMappingURL=../scripts/stanby-utils.js.map