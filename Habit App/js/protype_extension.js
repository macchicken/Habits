String.prototype.splitOnce = function (regex) {
    var match = this.match(regex);
    if (match) {
        var match_i = this.indexOf(match[0]);
        return [this.substring(0, match_i),
        this.substring(match_i + match[0].length)];
    } else {
        return [this, ""];
    }
}