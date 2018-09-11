
function isInRange(d, o1, o2){
	return d*d>(o1.x-o2.x)*(o1.x-o2.x)+(o1.y-o2.y)*(o1.y-o2.y);
}

class LineSegment{
	constructor(a,b){
		this.a = a;
		this.b = b;
		this.dx = b.x - a.x;
		this.dy = b.y - a.y;
		this.m = this.dy / this.dx;
		this.d = Math.sqrt((this.dx*this.dx)+(this.dy*this.dy));
		this.ux = this.dx / this.d;
		this.uy = this.dy / this.d;
		this.nx = this.uy;
		this.ny = -this.ux;
	}
	collidesWith(other){
		if(this.m == other.m) return false;
		let a = this.a;
		let b = this.b;
		let c = other.a;
		let d = other.b;
		let aSide = (d.x - c.x) * (a.y - c.y) - (d.y - c.y) * (a.x - c.x) > 0;
		let bSide = (d.x - c.x) * (b.y - c.y) - (d.y - c.y) * (b.x - c.x) > 0;
		let cSide = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x) > 0;
		let dSide = (b.x - a.x) * (d.y - a.y) - (b.y - a.y) * (d.x - a.x) > 0;
		return aSide !== bSide && cSide !== dSide;

	}
	getCollisionPoint(other){

		// y = L1ay + ((L1by-L1ay)/(L1bx-L1ax))*(x - L1ax)
		// y2 = L2ay + ((L2by-L2ay)/(L2bx-L2ax))*(x - L2ax)
		// L2ay + ((L2by-L2ay)/(L2bx-L2ax))*(x - L2ax) = L1ay + ((L1by-L1ay)/(L1bx-L1ax))*(x - L1ax)
		// ((L2by-L2ay)/(L2bx-L2ax))*(x - L2ax) - ((L1by-L1ay)/(L1bx-L1ax))*(x - L1ax) = (L1ay - L2ay)
		// x*((L2by-L2ay)/(L2bx-L2ax)) - L2ax*((L2by-L2ay)/(L2bx-L2ax)) - x*((L1by-L1ay)/(L1bx-L1ax)) + L1ax*((L1by-L1ay)/(L1bx-L1ax)) = (L1ay - L2ay)
		// x*((L2by-L2ay)/(L2bx-L2ax)) - x*((L1by-L1ay)/(L1bx-L1ax)) = (L1ay - L2ay) + L2ax*((L2by-L2ay)/(L2bx-L2ax)) - L1ax*((L1by-L1ay)/(L1bx-L1ax))
		// x*(((L2by-L2ay)/(L2bx-L2ax)) - ((L1by-L1ay)/(L1bx-L1ax))) = (L1ay - L2ay) + L2ax*((L2by-L2ay)/(L2bx-L2ax)) - L1ax*((L1by-L1ay)/(L1bx-L1ax))
		// x = ((L1ay - L2ay) + L2ax*((L2by-L2ay)/(L2bx-L2ax)) - L1ax*((L1by-L1ay)/(L1bx-L1ax))) / (((L2by-L2ay)/(L2bx-L2ax)) - ((L1by-L1ay)/(L1bx-L1ax)))
		// y = L1ay + ((L1by-L1ay)/(L1bx-L1ax))*(x - L1ax)
		let x, y;
		if(other.m == this.m){
			x = Infinity;
			y = Infinity;
		}
		else if(this.m == Infinity || this.m == -Infinity){
			x = this.a.x;
			y = other.m * (x - other.a.x) + other.a.y;
		}
		else if(other.m == Infinity || other.m == -Infinity){
			x = other.a.x;
			y = this.m * (x - this.a.x) + this.a.y;
		}
		else{
			x = ((this.a.y - other.a.y) + other.a.x * other.m - this.a.x * this.m) / (other.m - this.m);
			y = this.a.y + this.m * (x - this.a.x);
		}

		// let x = (this.a.y - this.b.y + this.b.x*((other.b.y-this.b.y)/(other.b.x-this.b.x)) 
		// 	- other.a.x * ((other.a.y-this.a.y)/(other.a.x-other.a.x))) / (((other.b.y-this.b.y)/(other.b.x-this.b.x)) - ((other.a.y-this.a.y)/(other.a.x-other.a.x)))
		// let y = this.a.y + ((other.a.y-this.a.y)/(other.a.x-other.a.x))*(x - other.a.x);
		return {x: x, y: y};

	}
	getDistanceFromPoint(p){
		let dSq = this.d * this.d;
		let aSq = p.distanceSqFrom(this.a);
		let bSq = p.distanceSqFrom(this.b);
		if(aSq > dSq + bSq) return Math.sqrt(aSq);
		if(bSq > dSq + aSq) return Math.sqrt(aSq);
		let numerator = Math.abs(this.dy * p.x - this.dx * p.y + this.b.x*this.a.y-this.b.y*this.a.x);
		let dd = numerator / this.d;
		return dd;
	}
}

class AABBTree{
	constructor(pt, parent){
		this.pt = pt || null;
		this.parent = parent || null;
		if(pt){
			this.top = pt.y;
			this.bottom = pt.y;
			this.left = pt.x;
			this.right = pt.x;
		}
		else{
			this.top = 0;
			this.bottom = 0;
			this.left = 0;
			this.right = 0;
		}
		this.node1 = null;
		this.node2 = null;
	}
	insertPoint(pt){
		if(this.pt){
			this.node1 = new AABBTree(this.pt, this);
			this.node2 = new AABBTree(pt, this);
			this.pt = null;
		}
		else if(!this.node1) this.pt = pt;
		else{
			let ba1 = this.node1.boundingArea();
			let ba2 = this.node2.boundingArea();
			let hba1 = this.node1.hypotheticalBoundingArea(pt);
			let hba2 = this.node2.hypotheticalBoundingArea(pt);
			if(hba1 - ba1 == hba2 - ba2){
				if(ba1 < ba2) this.node1.insertPoint(pt);
				else this.node2.insertPoint(pt);
			}
			else if(hba1 - ba1 < hba2 - ba2) this.node1.insertPoint(pt);
			else this.node2.insertPoint(pt);
		}
		if(this.pt){
			this.top = pt.y;
			this.bottom = pt.y;
			this.left = pt.x;
			this.right = pt.x;
		}
		else{
			this.top = Math.min(this.node1.top, this.node2.top);
			this.bottom = Math.max(this.node1.bottom, this.node2.bottom);
			this.left = Math.min(this.node1.left, this.node2.left);
			this.right = Math.max(this.node1.right, this.node2.right);
		}
	}
	hypotheticalBoundingArea(pt){
		let minx = Math.min(this.left, pt.x);
		let maxx = Math.max(this.right, pt.x);
		let miny = Math.min(this.top, pt.y);
		let maxy = Math.max(this.bottom, pt.y);
		return (maxx - minx) * (maxy - miny);
	}
	boundingArea(){
		return (this.right - this.left) * (this.bottom - this.top);
	}
	findClosestPoint(pt, testFunction){
		if(this.pt){
			return testFunction(this.pt) ? this.pt : null;
		}
		else if(this.node1 && this.node2){
			let ba1 = this.node1.boundingArea();
			let ba2 = this.node2.boundingArea();
			let hba1 = this.node1.hypotheticalBoundingArea(pt);
			let hba2 = this.node2.hypotheticalBoundingArea(pt);
			if(hba1 - ba1 < hba2 - ba2) {
				return this.node1.findClosestPoint(pt, testFunction) || this.node2.findClosestPoint(pt, testFunction);
			}
			else {
				return this.node2.findClosestPoint(pt, testFunction) || this.node1.findClosestPoint(pt, testFunction);
			}
		}
		else return null;
	}
}

class AABBLineTree{
	constructor(segment, parent){
		this.segment = segment || null;
		this.parent = parent || null;
		if(segment){
			this.top = Math.min(segment.a.y, segment.b.y);
			this.bottom = Math.max(segment.a.y, segment.b.y);
			this.left = Math.min(segment.a.x, segment.b.x);
			this.right = Math.max(segment.a.x, segment.b.x);
		}
		else{
			this.top = 0;
			this.bottom = 0;
			this.left = 0;
			this.right = 0;
		}
		this.node1 = null;
		this.node2 = null;
	}
	insertSegment(segment){
		if(this.segment){
			this.node1 = new AABBLineTree(this.segment, this);
			this.node2 = new AABBLineTree(segment, this);
			this.segment = null;
		}
		else if(!this.node1) this.segment = segment;
		else{
			let ba1 = this.node1.boundingArea();
			let ba2 = this.node2.boundingArea();
			let hba1 = this.node1.hypotheticalBoundingArea(segment);
			let hba2 = this.node2.hypotheticalBoundingArea(segment);
			if(hba1 - ba1 == hba2 - ba2){
				if(ba1 < ba2) this.node1.insertSegment(segment);
				else this.node2.insertSegment(segment);
			}
			else if(hba1 - ba1 < hba2 - ba2) this.node1.insertSegment(segment);
			else this.node2.insertSegment(segment);
		}
		if(this.segment){
			this.top = Math.min(segment.a.y, segment.b.y);
			this.bottom = Math.max(segment.a.y, segment.b.y);
			this.left = Math.min(segment.a.x, segment.b.x);
			this.right = Math.max(segment.a.x, segment.b.x);
		}
		else {
			this.top = Math.min(this.node1.top, this.node2.top);
			this.bottom = Math.max(this.node1.bottom, this.node2.bottom);
			this.left = Math.min(this.node1.left, this.node2.left);
			this.right = Math.max(this.node1.right, this.node2.right);
		}
	}
	hypotheticalBoundingArea(segment){
		let minx = Math.min(this.left, Math.min(segment.a.x, segment.b.x));
		let maxx = Math.max(this.right, Math.max(segment.a.x, segment.b.x));
		let miny = Math.min(this.top, Math.min(segment.a.y, segment.b.y));
		let maxy = Math.max(this.bottom, Math.max(segment.a.y, segment.b.y));
		return (maxx - minx) * (maxy - miny);
	}
	boundingArea(){
		return (this.right - this.left) * (this.bottom - this.top);
	}
	fintClosestSegment(pt){
		if(this.pt){
			return this;
		}
		else{
			let ba1 = node1.boundingArea();
			let ba2 = node2.boundingArea();
			let hba1 = node1.hypotheticalBoundingArea(pt);
			let hba2 = node2.hypotheticalBoundingArea(pt);
			if(hba1 - ba1 < hba2 - ba2) return this.node1.findClosestPoint(pt);
			else return this.node2.findClosestPoint(pt);
		}
	}
	pointIsColliding(pt){
		return pt.x > this.left && pt.x < this.right && pt.y > this.top && pt.y < this.bottom;
	}
	getClosestCollision(line){
		if(this.segment) return this.segment.collidesWith(line) ? this.segment : null;
		else{
			if(!this.node1) return null;
			let c1 = null;
			let c2 = null;
			if(this.node1.pointIsColliding(line.a) || this.node1.pointIsColliding(line.b)) c1 = this.node1.getClosestCollision(line);
			if(this.node2.pointIsColliding(line.a) || this.node2.pointIsColliding(line.b)) c2 = this.node2.getClosestCollision(line);
			
			if(!c1 && !c2) return null;
			else if(c1 && !c2) return c1;
			else if(c2 && !c1) return c2;
			else{
				if(c1.getDistanceFromPoint(line.a) < c2.getDistanceFromPoint(line.a)) return c1;
				else return c2;
			}

		}
	}
	collides(line){
		if(this.segment){
			return this.segment.collidesWith(line);
		}
		else{
			if(!this.node1) return false;
			let c1 = false;
			let c2 = false;
			if(this.node1.pointIsColliding(line.a) || this.node1.pointIsColliding(line.b)) c1 = this.node1.collides(line);
			if(c1) {
				return true;
			}
			if(this.node2.pointIsColliding(line.a) || this.node2.pointIsColliding(line.b)) c2 = this.node2.collides(line);
			if(c2) {
				return true;
			}
			
			return false;

		}
	}
}

var waypointIds = 1;

class Waypoint{
	constructor(x, y, priority, mergeWeight, obsticles){
		this.id = waypointIds++;
		this.x = x; 
		this.y = y;
		this.priority = priority || 1;
		this.mergeWeight = mergeWeight || 1;
		this.connections = [];
		this.obsticles = obsticles || []; //Nearby obsticles.
		this.addToObsticles();
	}
	/**
	 * Merges two wpaypoints and returns either the average, or if one is priority, the priority one.
	 * Don't forget to remove both waypoints from the graph first.
	 * @param {Waypoint} other 
	 */
	merge(other){
		this.removeFromObsticles();
		other.removeFromObsticles();
		if(other.priority == this.priority){
			let mergeWeight = this.mergeWeight + other.mergeWeight;
			return new Waypoint((this.x * this.mergeWeight + other.x * other.mergeWeight) / mergeWeight, 
				(this.y * this.mergeWeight + other.y * other.mergeWeight) / mergeWeight, this.priority, mergeWeight, this.obsticles.concat(other.obsticles));
		}
		else{
			let mergeWeight = this.mergeWeight + other.mergeWeight;
			this.mergeWeight = mergeWeight;
			other.mergeWeight = mergeWeight;
			if(this.priority){
				this.obsticles = this.obsticles.concat(other.obsticles);
				this.addToObsticles();
				return this;
			}
			else{
				other.obsticles = this.obsticles.concat(other.obsticles);
				other.addToObsticles();
				return other;
			}
		}
	}

	removeFromObsticles(){
		for(let i in this.obsticles){
			let o = this.obsticles[i];
			o.suggestedWaypoints.splice(o.suggestedWaypoints.findIndex(x => x == this), 1);
		}
	}
	addToObsticles(){
		for(let i in this.obsticles){
			let o = this.obsticles[i];
			if(!o.suggestedWaypoints) o.suggestedWaypoints = [];
			o.suggestedWaypoints.push(this);
		}
	}

	addConnection(wp){
		this.connections.push(wp)
	}

	removeConnection(wp){
		for(let i = 0; i < this.connections.length; i++){
			if(this.connections[i] == wp){
				this.connections.splice(i,1);
				break;
			}
		}
	}

	distanceSqFrom(other){
		let dx = this.x - other.x;
		let dy = this.y - other.y;
		return dx*dx+dy*dy;
	}
	distanceFrom(other){ return Math.sqrt(this.distanceSqFrom(other)) }
}

class AStarGraph{
	constructor(){
		this.obsticleClearance = 2;
		this.pathPadding = 1.5;
		this.arenaBounds = 200;
		this.obsticles = [];
		this.allWaypoints = [];
		this.allPaths = [];
		this.aabb = new AABBTree();
		this.obsticleAabb = new AABBLineTree();
		this.debugStr = "";
	}
	addOneObsticle(a, b){
		let l = new LineSegment(a,b);
		this.obsticles.push(l);
		this.obsticleAabb.insertSegment(l);
		return l;
	}
	/**
	 * Step 1: Add all obsticles and generate potential waypoints.
	 * Make sure a,b,c,d are in a clockwise order.
	 */
	addPerminantObsticle(a,b,c,d){
		
		let l1 = this.addOneObsticle(a,b);
		let l2 = this.addOneObsticle(b,c);
		let l3 = this.addOneObsticle(c,d);
		let l4 = this.addOneObsticle(a,d);
		//Debugging.
		// this.debugStr += (`${Math.round(a.x)}\t${Math.round(a.y)}\r\n`);
		// this.debugStr += (`${Math.round(b.x)}\t${Math.round(b.y)}\r\n`);
		// this.debugStr += (`${Math.round(c.x)}\t${Math.round(c.y)}\r\n`);
		// this.debugStr += (`${Math.round(d.x)}\t${Math.round(d.y)}\r\n`);
		// this.debugStr += (`${Math.round(a.x)}\t${Math.round(a.y)}\r\n\r\n`);
		

		let aex = a.x + (-l1.ux - l4.ux) * this.obsticleClearance;
		let aey = a.y + (-l1.uy - l4.uy) * this.obsticleClearance;
		let wpA = new Waypoint(aex, aey, null, null, [l1, l4]);

		let bex = b.x + (l1.ux - l2.ux) * this.obsticleClearance;
		let bey = b.y + (l1.uy - l2.uy) * this.obsticleClearance;
		let wpB = new Waypoint(bex, bey, null, null, [l2, l1]);

		let cex = c.x + (l2.ux - l3.ux) * this.obsticleClearance;
		let cey = c.y + (l2.uy - l3.uy) * this.obsticleClearance;
		let wpC = new Waypoint(cex, cey, null, null, [l3, l2]);

		let dex = d.x + (l3.ux + l4.ux) * this.obsticleClearance;
		let dey = d.y + (l3.uy + l4.uy) * this.obsticleClearance;
		let wpD = new Waypoint(dex, dey, null, null, [l4, l3]);

		/*l1.suggestedWaypoints = [wpA, wpB];
		l2.suggestedWaypoints = [wpB, wpC];
		l3.suggestedWaypoints = [wpC, wpD];
		l4.suggestedWaypoints = [wpD, wpA];*/

		if(aex < this.arenaBounds && aex > -this.arenaBounds && aey < this.arenaBounds && aey > -this.arenaBounds) {
			this.allWaypoints.push(wpA);
			//this.debugStr += (`${Math.round(wpA.x*10)/10}\t${Math.round(wpA.y*10)/10}\r\n`);
		}
		if(bex < this.arenaBounds && bex > -this.arenaBounds && bey < this.arenaBounds && bey > -this.arenaBounds) {
			this.allWaypoints.push(wpB);
			//this.debugStr += (`${Math.round(wpB.x*10)/10}\t${Math.round(wpB.y*10)/10}\r\n`);
		}
		if(cex < this.arenaBounds && cex > -this.arenaBounds && cey < this.arenaBounds && cey > -this.arenaBounds) {
			this.allWaypoints.push(wpC);
			//this.debugStr += (`${Math.round(wpC.x*10)/10}\t${Math.round(wpC.y*10)/10}\r\n`);
		}
		if(dex < this.arenaBounds && dex > -this.arenaBounds && dey < this.arenaBounds && dey > -this.arenaBounds) {
			this.allWaypoints.push(wpD);
			//this.debugStr += (`${Math.round(wpD.x*10)/10}\t${Math.round(wpD.y*10)/10}\r\n`);
		}
		return [l1, l2, l3, l4];
	}

	/**
	 * Step 2: prune waypoints that are close to walls.
	 */
	pruneInvalidWaypoints(){
		for(let w = this.allWaypoints.length - 1; w >= 0; w--){
			let wp = this.allWaypoints[w];
			if(this.waypointIsObstructed(wp) || wp.x < -this.arenaBounds || wp.x > this.arenaBounds || wp.y < -this.arenaBounds || wp.y > this.arenaBounds) this.allWaypoints.splice(w, 1);
		}
	}

	/**
	 * Step 2: Merge waypoints that are close together, provided that there is no obticle in-between.
	 */
	mergeWaypoints(){
		for(let i = this.allWaypoints.length - 1; i >= 0; i--){
			let wp1 = this.allWaypoints[i];
			for(let j = i - 1; j >= 0; j--){
				let wp2 = this.allWaypoints[j];
				if(isInRange(this.obsticleClearance*this.obsticleClearance,wp1,wp2)){
					let lineCandidate = new LineSegment(wp1,wp2);
					if(this.pathIsClear(lineCandidate)){
						this.allWaypoints[j] = wp2.merge(wp1);
						this.allWaypoints.splice(i, 1);
						break;
					}
				}
			}
		}
		//Auditing:
		// for(let i in this.allWaypoints){
		// 	let wp = this.allWaypoints[i];
		//  	this.debugStr += (`${Math.round(wp.x*10)/10}\t${Math.round(wp.y*10)/10}\r\n`);
		// }
	}
	/**
	 * Step 3: Draw paths between all waypoints that don't collide with obsticles.
	 */
	findLegitPaths(){
		this.allPaths = [];
		for(let i = 0; i < this.allWaypoints.length; i++){
			let wp1 = this.allWaypoints[i];
			if(wp1.x <= -this.arenaBounds || wp1.x >= this.arenaBounds || wp1.y <= -this.arenaBounds || wp1.y >= this.arenaBounds) continue;
			for(let j = i + 1; j < this.allWaypoints.length; j++){
				let wp2 = this.allWaypoints[j];
				//if(wp1 == wp2) continue;
				if(wp2.x <= -this.arenaBounds || wp2.x >= this.arenaBounds || wp2.y <= -this.arenaBounds || wp2.y >= this.arenaBounds) continue;
				let lineCandidate = new LineSegment(wp1,wp2);
				
				if(this.paddedPathIsClear(lineCandidate)){
					this.allPaths.push(lineCandidate);
					if(wp1.priority == 1) wp1.addConnection(wp2);
					if(wp2.priority == 1) wp2.addConnection(wp1);
				}
			}
		}
	}
	/**
	 * Step 4: Break down intersecting paths.
	 */
	breakDownPaths(){
		let checkQueue = this.allPaths;
		this.allPaths = [];
		while(checkQueue.length > 0){
			let candidate = checkQueue.pop();
			let hasBroken = false;
			for(let i = 0; i < checkQueue.length; i++){
				let nextItem = checkQueue[i];
				if(nextItem.a == candidate.a || nextItem.b == candidate.b || nextItem.a == candidate.b || nextItem.b == candidate.a) continue;
				if(candidate.getDistanceFromPoint(nextItem.a) < 0.1) continue;
				if(candidate.getDistanceFromPoint(nextItem.b) < 0.1) continue;
				if(nextItem.getDistanceFromPoint(candidate.a) < 0.1) continue;
				if(nextItem.getDistanceFromPoint(candidate.b) < 0.1) continue;
				if(nextItem.collidesWith(candidate)){
					let pt = candidate.getCollisionPoint(nextItem);
					nextItem.getDistanceFromPoint(candidate.a);
					let newWp = new Waypoint(pt.x, pt.y);
					this.allWaypoints.push(newWp);
					hasBroken = true;
					checkQueue.splice(i,1);
					nextItem.a.removeConnection(nextItem.b);
					nextItem.b.removeConnection(nextItem.a);
					candidate.a.removeConnection(candidate.b);
					candidate.b.removeConnection(candidate.a);
					nextItem.a.addConnection(newWp);
					nextItem.b.addConnection(newWp);
					candidate.a.addConnection(newWp);
					candidate.b.addConnection(newWp);
					newWp.addConnection(nextItem.b);
					newWp.addConnection(nextItem.a);
					newWp.addConnection(candidate.b);
					newWp.addConnection(candidate.a);
					let l1 = new LineSegment(newWp, candidate.a);
					let l2 = new LineSegment(newWp, candidate.b);
					let l3 = new LineSegment(newWp, nextItem.a);
					let l4 = new LineSegment(newWp, nextItem.b);
					checkQueue.push(l1);
					checkQueue.push(l2);
					checkQueue.push(l3);
					checkQueue.push(l4);
					// this.debugStr += (`${Math.round(l1.b.x*10)/10}\t${Math.round(l1.b.y * 10) / 10}\r\n`);
					// this.debugStr += (`${Math.round(l2.b.x*10)/10}\t${Math.round(l2.b.y * 10) / 10}\r\n`);
					// this.debugStr += (`${Math.round(newWp.x*10)/10}\t${Math.round(newWp.y * 10) / 10}\r\n`);
					// this.debugStr += (`${Math.round(l3.b.x*10)/10}\t${Math.round(l3.b.y * 10) / 10}\r\n`);
					// this.debugStr += (`${Math.round(l4.b.x*10)/10}\t${Math.round(l4.b.y * 10) / 10}\r\n\r\n`);
					break;
				}
			}
			if(!hasBroken){
				this.allPaths.push(candidate);
			}
		}
	}
	/**
	 * Step 5: Find pathways that overlap a bit.
	 */
	pruneRedundantPaths(){
		for(let k = 0; k < this.allWaypoints.length; k++){
			let candidate = this.allWaypoints[k];
			for(let i = 0; i < candidate.connections.length; i++){
				let wp1 = candidate.connections[i];
				for(let j = i + 1; j < candidate.connections.length; j++){
					let wp2 = candidate.connections[j];
					//candidate is connected to wp1 and wp2.
					//The conditions to merge are that wp1 and wp2 are connected, and more than 10x farther from candidate than candidate is from their connecting path.
					if(wp1.connections.find(c => c == wp2)){
						let wpDist = wp1.distanceSqFrom(wp2);
						let da = wp1.distanceSqFrom(candidate);
						let db = wp2.distanceSqFrom(candidate);
						let lineDist = new LineSegment(wp1, wp2).getDistanceFromPoint(candidate);
						if(da < wpDist && db < wpDist && lineDist < this.pathPadding){
							wp1.removeConnection(wp2);
							wp2.removeConnection(wp1);
						}
					}
				}
			}
		}
	}
	/**
	 * Step 6: AABB tree provides an optimization.
	 */
	constructAABBTree(){
		for(let i in this.allWaypoints) this.aabb.insertPoint(this.allWaypoints[i]);
	}

	//Utils.

	auditPaths(){
		for(let i = 0; i < this.allWaypoints.length; i++){
			let wp1 = this.allWaypoints[i];
			for(let j = i + 1; j < this.allWaypoints.length; j++){
				let wp2 = this.allWaypoints[j];
				if(wp1.connections.find(c => c == wp2)) {
					this.debugStr += (`${Math.round(wp1.x*10)/10}\t${Math.round(wp1.y*10)/10}\r\n`);
					this.debugStr += (`${Math.round(wp2.x*10)/10}\t${Math.round(wp2.y*10)/10}\r\n\r\n`);
				}
			}
		}
	}

	auditWaypoints(){
		for(let i in this.allWaypoints){
			let wp = this.allWaypoints[i];
		 	this.debugStr += (`${Math.round(wp.x*10)/10}\t${Math.round(wp.y*10)/10}\r\n`);
		}
	}

	addObsticle(a, b){
		let o  = new LineSegment(a,b)
		this.obsticles.push(o);
		this.obsticleAabb.insertSegment(o);
	}

	waypointIsObstructed(wp){
		for(let i in this.obsticles){
			let o = this.obsticles[i];
			if(o.getDistanceFromPoint(wp) < this.pathPadding) {
				o.getDistanceFromPoint(wp)
				return true;
			}
		}
		return false;
	}

	pathIsClear(line, wp2){
		if(wp2) line = new LineSegment(line, wp2);
		//return !this.obsticleAabb.collides(line);
		for(let k = 0; k < this.obsticles.length; k++){
			let obsticle = this.obsticles[k];
			if(line.collidesWith(obsticle)){
				return false;
			}
		}
		return true;
	}
	paddedPathIsClear(arg1, arg2){
		let line;
		let padding = this.pathPadding;
		if(arg1 instanceof LineSegment) line = arg1;
		else line = new LineSegment(arg1, arg2);
		let paddedWp1a = new Waypoint(line.a.x + padding * line.nx, line.a.y + padding * line.ny);
		let paddedWp1b = new Waypoint(line.b.x + padding * line.nx, line.b.y + padding * line.ny);
		let paddedWp2a = new Waypoint(line.a.x - padding * line.nx, line.a.y - padding * line.ny);
		let paddedWp2b = new Waypoint(line.b.x - padding * line.nx, line.b.y - padding * line.ny);
		let paddedPath1 = new LineSegment(paddedWp1a,paddedWp1b);
		let paddedPath2 = new LineSegment(paddedWp2a,paddedWp2b);
		return this.pathIsClear(line) && this.pathIsClear(paddedPath1) && this.pathIsClear(paddedPath2);
	}

	getClosestObsticle(line){
		//return this.obsticleAabb.getClosestCollision(line);
		let obsticles = [];
		for(let k = 0; k < this.obsticles.length; k++){
			let obsticle = this.obsticles[k];
			if(line.collidesWith(obsticle)){
				obsticles.push(obsticle);
			}
		}
		let closestObsticle = null;
		let closestDist = Infinity;
		for(let o in obsticles){
			let obsticle = obsticles[o];
			let dist = closestObsticle.getDistanceFromPoint(line.a);
			if(dist < closestDist){
				closestDist = dist;
				closestObsticle = obsticle;
			}
		}
		return closestObsticle;
	}

	getPath(start, goal) {
		var infiniteloopexception = 0;
	
		// The set of nodes already evaluated
		var closedSet = [];//new List<AIWaypoint>();
	
		// The set of currently discovered nodes that are not evaluated yet.
		// Initially, only the start node is known.
		var openSet = [];//new List<AIWaypoint>();
		openSet.push(start);
	
		// For each node, which node it can most efficiently be reached from.
		// If a node can be reached from many nodes, cameFrom will eventually contain the
		// most efficient previous step.
		var cameFrom = {};//new Dictionary<AIWaypoint, AIWaypoint>();//an empty map
	
		// For each node, the cost of getting from the start node to that node.
		var gScore = {};//new Dictionary<AIWaypoint, float>();//map with default value of Infinity
	
		// The cost of going from start to start is zero.
		gScore[start.id] = 0;
	
		// For each node, the total cost of getting from the start node to the goal
		// by passing by that node. That value is partly known, partly heuristic.
		//fScore := map with default value of Infinity
		var fScore = {};//new Dictionary<AIWaypoint, float>();
	
		// For the first node, that value is completely heuristic.
		fScore[start.id] = start.distanceFrom(goal);
	
		while (openSet.length > 0) {
			infiniteloopexception++;
			if (infiniteloopexception > 1000) { //Caused by infinite loop bugs.
				throw "Infinite waypoint traversal loop.";
			}
	
			var minscore = Infinity;
			let current = null;
			let currentId = null;
			for(let o in openSet) {
				let obj = openSet[o];
				var c = fScore[obj.id];
				if (c < minscore) {
					minscore = c;
					current = obj;
					currentId = o;
				}
			}
			if (current == goal) return this.reconstruct_path(cameFrom, current);
	
	
			openSet.splice(currentId, 1);
			closedSet.push(current);
	
			if(current == null){
				console.log("Explain.");
			}

			for(let n in current.connections){
				let neighbor = current.connections[n];
				if (closedSet.find(x => x == neighbor)) continue; // Ignore the neighbor which is already evaluated.
	
				if (!openSet.find(x => x == neighbor)) openSet.push(neighbor); // Discover a new node
	
				// The distance from start to a neighbor
				//the "dist_between" function may vary as per the solution requirements.
				var tentative_gScore = gScore[current.id] + current.distanceFrom(neighbor);
				if (tentative_gScore >= (gScore.hasOwnProperty(neighbor.id) ? gScore[neighbor.id] : Infinity)) continue; // This is not a better path.
	
				// This path is the best until now. Record it!
				cameFrom[neighbor.id] = current;
				gScore[neighbor.id] = tentative_gScore;
				fScore[neighbor.id] = gScore[neighbor.id] + neighbor.distanceFrom(goal);
			}
		}
		return null;
	}

	reconstruct_path(cameFrom, current) {

		var total_path = [];
		total_path.push(current);
		while (cameFrom[current.id]){
			current = cameFrom[current.id];
			total_path.push(current);
		}
		return total_path.reverse();
	}
	
	tryGetRandomNearbyWaypoint(ufo){
		let wp = this.getRandomDestination();
		if(!wp) return null;
		let line = new LineSegment(wp, ufo);
		if(this.pathIsClear(line)) return wp;
		else return null;
	}

	getRandomDestination(){
		return this.allWaypoints[Math.floor(Math.random() * this.allWaypoints.length)];
	}
	
	getNearestUnobstructedWaypoint(point){
		// for(let w in this.allWaypoints){
		// 	let wp = this.allWaypoints[w];
		// 	let lineToNearest = new LineSegment(point, wp);
		// 	if(this.pathIsClear(lineToNearest)) return wp;
		// }
		// return null;
		return this.aabb.findClosestPoint(point, (wp)=>{
			let lineToNearest = new LineSegment(point, wp);
			//return !this.obsticleAabb.collides(lineToNearest);
			return this.pathIsClear(lineToNearest); // Inefficient.
		});
	}

	/**
	 * Finds the best rout form start to waypoint, where waypoint is part of the graph, and start isn't.
	 */
	//getBackToPath(start, waypoint){let wae = [];}
}

module.exports = {
	AStarGraph: AStarGraph,
	Waypoint: Waypoint
};





//Probably don't need this.
class Path{
	constructor(arg){
		this.waypoints = []; //A stack of waypoints to follow.
		this.pathLength = 0;
		if(arg){
			if(arg instanceof Path){
				for(let i in arg.waypoints){
					let wp = arg.waypoints[i];
					this.add(wp);
				}
			}
			else if(arg instanceof Waypoint){
				this.add(arg);
			}
		}
	}

	get count(){
		return this.waypoints.length;
	}

	get last(){
		return this.waypoints[this.count - 1];
	}

	add(wp) {
		if (this.count > 0) {
			this.pathLength += this.last.distanceFrom(wp);
		}
		this.waypoints.push(wp);
	}

	pop() {
		let popped = this.waypoints.pop();
		this.pathLength -= this.last.distanceFrom(popped);
	}
}