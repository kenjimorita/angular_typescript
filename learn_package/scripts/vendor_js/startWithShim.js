if (!String.prototype.startsWith) {
  String.prototype.startsWith = function (str) {
    return this.lastIndexOf(str, 0) === 0;
  };
}