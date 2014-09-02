var merge = function(objA, objB) {
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
