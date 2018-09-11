/**
 * Used to spacially divide coordinates on a map.
 */
class QuadTree{
    constructor(centerX, centerY, width, height, depth){
		this.centerX = centerX;
		this.centerY = centerY;
		this.width = width; 
		this.height = height;
		this.depth = depth;
		this.coords = []; // Eg. {x: 10, y: 15};

		this.children = null;
		if(this.depth > 0){
			this.children = {
				tl: new QuadTree(this.centerX-this.width/4,this.centerY-this.height/4,this.width/2,this.height/2,this.depth-1),
				tr: new QuadTree(this.centerX+this.width/4,this.centerY-this.height/4,this.width/2,this.height/2,this.depth-1),
				bl: new QuadTree(this.centerX-this.width/4,this.centerY+this.height/4,this.width/2,this.height/2,this.depth-1),
				br: new QuadTree(this.centerX+this.width/4,this.centerY+this.height/4,this.width/2,this.height/2,this.depth-1)
			}
		}
	}
	/**
	 * Inserts a point into the appropirate child node, or, if this is a leaf node, inserts it into this.coords.
	 * @param {Number} x X coordinate of the new point to insert.
	 * @param {Number} y Y coordinate of the new point to insert.
	 */
	insertCoord(x, y){
		throw "NOT IMPLEMENTED";
	}
    getRandomCoord(){
		if(this.children){ //Choose a random child THAT HAS A COORDINATE IN IT and call getRandomCoord on it.
			throw "NOT IMPLEMENTED";
		}
		else{ //Choose a random coordinate from this.coords.
			return this.coords[Math.floor(Math.random() * this.coords.length)];
		}
	}
}