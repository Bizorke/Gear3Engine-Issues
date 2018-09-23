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
		this.count = 0;

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
	insertCoord(wp){
		this.count++;
		if(this.children){
			if(wp.x < this.centerX){
				if(wp.y < this.centerY) this.children.tl.insertCoord(wp);
				else this.children.bl.insertCoord(wp);
			}
			else{
				if(wp.y < this.centerY) this.children.tr.insertCoord(wp);
				else this.children.br.insertCoord(wp);
			}
		}
		else this.coords.push(wp);
	}
    getRandomCoord(){
		if(this.children){ //Choose a random child THAT HAS A COORDINATE IN IT and call getRandomCoord on it.
			if(!this.count) return null;
			let childrenWithWaypoints = Object.keys(this.children).map(k=>this.children[k]).filter(n=>n.count != 0);
			return childrenWithWaypoints[Math.floor(Math.random() * childrenWithWaypoints.length)].getRandomCoord();
		}
		else{ //Choose a random coordinate from this.coords.
			return this.coords[Math.floor(Math.random() * this.coords.length)];
		}
	}
}

module.exports = QuadTree;