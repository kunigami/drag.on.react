var Collision = {
  isCollision: function(rectA, rectB) {
    var isCollisionY = this.isCollisionY(rectA, rectB);
    var isCollisionX = this.isCollisionX(rectA, rectB);
    return isCollisionY && isCollisionX;
  },

  isCollisionY: function(rectA, rectB) {
    return Math.max(rectA.top, rectB.top) <
      Math.min(rectA.top + rectA.height, rectB.top + rectB.height);
  },

  isCollisionX: function(rectA, rectB) {
    return Math.max(rectA.left, rectB.left) <
      Math.min(rectA.left + rectA.width, rectB.left + rectB.width);
  },

  compareTop: function(rectA, rectB) {
    if (rectA.top != rectB.top) {
      return rectA.top - rectB.top;
    }
    return (rectA.top + rectA.height) - (rectB.top + rectB.height);
  },

  getRectMapById: function(rectList) {
    var rectMap = {};
    for (var ii = 0; ii < rectList.length; ii++) {
      rectMap[rectList[ii].id] = rectList[ii];
    }
    return rectMap;
  },

  /**
   * Find the new position of rect if we were to shift it on the
   * Y-axis such that it doesn't collide with fixedRectList
   */
  findNewPosition: function(fixedRectList, rect) {
    var newTop = rect.top;
    for (var ii = 0; ii < fixedRectList.length; ii++) {
      var fixedRect = fixedRectList[ii];
      if (!this.isCollision(fixedRect, rect)) {
        continue;
      }
      newTop = Math.max(newTop, fixedRect.top + fixedRect.height);
    }
    var newRect = {};
    // TODO: add a merge module/function
    newRect.left = rect.left;
    newRect.top = newTop;
    newRect.width = rect.width;
    newRect.height = rect.height;
    newRect.id = rect.id;
    return newRect;
  },

  /**
   * Complexity: O(n**2). TODO: can be improved with a interval
   * tree. Worth it?
   */
  insert: function(rectList, newRect) {
    // clone and sort
    var sortedRectList = rectList.slice(0).sort(this.compareTop);
    var fixedRectList = [newRect];
    var newRectList = [];
    for (var ii = 0; ii < sortedRectList.length; ii++) {
      var rect = sortedRectList[ii];
      var newRect = this.findNewPosition(fixedRectList, rect);
      fixedRectList.push(newRect);
    }
    return fixedRectList;
  },

  /**
   * Replace fromRect (belonging to rectList) with toRect.
   */
  move: function(rectMap, fromKey, toRect) {
    var rectList = [];
    var rectKeys = Object.keys(rectMap);
    for (var ii = 0; ii < rectKeys.length; ii++) {
      var key = rectKeys[ii];
      if (key == fromKey) {
        continue;
      }
      var rect = rectMap[key];
      rect.id = key;
      rectList.push(rect);
    }
    toRect.id = fromKey;
    var newRectList = this.insert(rectList, toRect);
    // Convert back to map
    var newRectMap = this.getRectMapById(newRectList);
    return newRectMap;
  }
};

module.exports = Collision;
