jest.dontMock('../Collision');

var Collision = require('../Collision');

var TestHelper = {

  id: -1,

  generateID: function() {
    return this.id--;
  },

  makeBox: function(top, left, height, width, id) {
    if (id === undefined) {
      id = this.generateID();
    }
    return {
      top: top,
      left: left,
      width: width,
      height: height,
      id: id,
    };
  },

  makeUnitBox: function(top, left, id) {
    return this.makeBox(top, left, 1, 1, id);
  },

  getRectMapById: function(rectList) {
    var rectMap = {};
    for (var ii = 0; ii < rectList.length; ii++) {
      rectMap[rectList[ii].id] = rectList[ii];
    }
    return rectMap;
  }
};

describe('Collisions', function() {

  it('should collide', function() {
    expect(Collision.isCollision(
      TestHelper.makeUnitBox(0, 0),
      TestHelper.makeBox(0, 0, 3, 3)
    )).toBe(true);
  });

  it('should displace a 1x1 rect at (0, 0) to (2, 0) when a 2x1 rect is' +
     'inserted into (0, 0)',
     function() {
       var trackID1 = 123;
       var trackID2 = 456;
       var rectList = [
         TestHelper.makeUnitBox(0, 0, trackID1),
         TestHelper.makeBox(0, 10, 4, 4),
       ];
       var newRectList = Collision.insert(
         rectList,
         TestHelper.makeBox(0, 0, 2, 1, trackID2)
       );
       var newRectMap = TestHelper.getRectMapById(newRectList);
       expect(newRectMap[trackID1].top).toBe(2);
       expect(1 + 1).toBe(2);
     }
  );

  it('should displace a 1x1 rect at (0, 0) to (2, 0) when a 2x1 rect is' +
     'inserted into (0, 0)',
     function() {
       var trackID1 = 123;
       var trackID2 = 456;
       var rectList = [
         TestHelper.makeUnitBox(0, 0, trackID1),
         TestHelper.makeBox(0, 10, 4, 4),
       ];
       var newRectList = Collision.insert(
         rectList,
         TestHelper.makeBox(0, 0, 2, 1, trackID2)
       );
       var newRectMap = TestHelper.getRectMapById(newRectList);
       expect(newRectMap[trackID1].top).toBe(2);
       expect(1 + 1).toBe(2);
     }
  );


  it('should displace a 1x1 rect at (0, 0) to (2, 0) when a 2x1 rect is' +
      'moved from (1, 0) to (0, 0)',
     function() {
       var trackID1 = 123;
       var trackID2 = 456;
       var rectList = [
         TestHelper.makeUnitBox(0, 0, trackID1),
         TestHelper.makeBox(1, 0, 2, 1, trackID2),
       ];
       var newRectList = Collision.move(
         rectList,
         rectList[1],
         TestHelper.makeBox(0, 0, 2, 1)
       );
       var newRectMap = TestHelper.getRectMapById(newRectList);
       console.log(newRectList);
       expect(newRectMap[trackID1].top).toBe(2);
     }
  );

});
