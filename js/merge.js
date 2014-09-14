/**
 * Merge all enumarable keys from @objA and @objB into a new object. If
 * a key exists in both, @objB takes precedence.
 */
var merge = function(/*object*/ objA, /*object*/ objB) /*object*/ {
  var merged = {};
  for (var key in objA) {
    merged[key] = objA[key];
  }
  for (var key in objB) {
    merged[key] = objB[key];
  }
  return merged;
}

module.exports = merge;
