/**
 * Helper function to construct css classes. It accept three modes of input:
 * - string: used as it is (why would you use this?)
 * - array:  just implodes them into a string
 * - object: this is the least useless, adds the keys of the object
 *   such that the corresponding values evaluates to truthy values.
 */
var classNames = function(mixed) /*string*/ {

  if (typeof mixed === "string") {
    return mixed;
  }

  if (Object.prototype.toString.call(mixed) == '[object Array]') {
    return mixed.join(' ');
  }

  // Object
  var filteredClassNames = [];
  for (var className in mixed) {
    var condition = mixed[className];
    if (condition) {
      filteredClassNames.push(className);
    }
  }
  return filteredClassNames.join(' ');
};

module.exports = classNames;
