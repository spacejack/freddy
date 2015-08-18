/*exported Rect */

var Rect = function Rect( rc ) {
	if( rc ) {
		this.left = rc.left
		this.top = rc.top
		this.right = rc.right
		this.bottom = rc.bottom
	}
	else {
		this.left = 0
		this.top = 0
		this.right = 0
		this.bottom = 0
	}
	this.width = this.right - this.left
	this.height = this.bottom - this.top
}
Rect.prototype.constructor = Rect
Rect.prototype.copy = function( rc ) {
	this.left = rc.left
	this.top = rc.top
	this.right = rc.right
	this.bottom = rc.bottom
	this.width = this.right - this.left
	this.height = this.bottom - this.top
	return this
};
