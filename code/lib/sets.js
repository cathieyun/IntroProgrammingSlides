// mutable set abstraction
// in addition to standard features:
// preserves order of elements for simple inserts, to make rendition in user interface smooth
// provides callbacks to keep container in sync

var createObject = function (o) {
	var F = function () {}
	F.prototype = o;
	return new F();
}

// FIXME
// for now, use abstract equality on the types in our library
// and exact equality elsewhere
var equals = function (x, y) {
	if (x instanceof Set) return x.equals(y);
	return x === y;
}

var Set = function () {
	var elts = []; // invariant: no duplicates
	var callback = function (s) {}; // default: do nothing
	var that = createObject(Set.prototype);
	// register f so that call f(that) whenever set changes
	// conservative; called on mutating ops even if no change
	that.callback = function (f) {
		callback = f;
	}
	that.each = function (body) {
		elts.forEach(function (e) {body(e);});
		}
	that.copy = function () {
		var result = Set();
		result.union(that);
		return result;
		}
	// remove all elements
	that.clear = function () {
	  elts = [];
		callback(that);
		return that;
		}
	that.insert = function (e) {
		if (!that.contains(e)) elts.push(e);
		callback(that);
		return that;
		}
	that.size = function () {
		return elts.length;
		}
	that.contains = function (e) {
		var result = false;
		that.each(function (x) {
			if (equals(x,e)) result = true;
			});
		return result;
		}
	that.union = function (s) {
		s.each(function (e) {that.insert(e);});
		callback(that);
		return that;
		}
	that.remove = function (e) {
		// for now, just copy; asymptotically no worse than bubbling
		// can't replace with top element anyway, since that breaks order
		var es = [];
		that.each(function (x) {if (!equals(e,x)) es.push(x);})
		elts = es;
		callback(that);
		return that;
		}
	that.minus = function (s) {
		s.each(function (e) {that.remove(e);});
		callback(that);
		return that;
		}
	// remove all elements from this set that don't satisfy pred
	that.filter = function (pred) {
		var es = [];
		that.each(function (e) {
			if (pred(e)) es.push(e);
			});
		elts = es;
		callback(that);
		return that;
		}
	// remove all elements from this set that are not in s
	that.intersect = function (s) {
		var es = [];
		that.each(function (e) {
			if (s.contains(e)) es.push(e);
			});
		elts = es;
		callback(that);
		return that;
		}
	// return a randomly chosen element
	that.pick = function (set) {
		var i = Math.floor((Math.random()*elts.length)+1) - 1;
		return elts[i];
		}
	that.equals = function (s) {return that == s;}
	that.similar = function (s) {
		if (!(s instanceof Set)) return false;
		if (!(s.size() == that.size())) return false;
		var result = true;
		that.each (function (e) {
			if (!s.contains(e)) result = false;
			});
		return result;
		}
	that.toString = function () {
		var result = "{";
		var first = true;
		that.each(function (e) {
			if (!first) result += ", ";
			first = false;
			result += e;
			});
		return result + "}";
		}
	Object.freeze(that); // prevent modification of object slots
	return that;
	}
	
/*
tests
s = Set();
s.insert(1).insert(2).insert(3)
console.log(s.toString())
s.remove(2);
console.log(s.toString())
t = Set().insert(5).insert(7).insert(9).insert(2)
console.log(t.toString())
p = t.copy().union(s)
console.log(p.toString())
p.intersect(t)
console.log(p.toString())
s.callback(function(s){console.log("called mutator; result is " + s.toString())})
*/	

