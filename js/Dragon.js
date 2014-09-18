/**
 * @jsx React.DOM
 *
 * This represents the top level React component of the drag.on
 * framework.
 **/

var Collision = require('./Collision');

var classNames = require('./classNames');
var merge = require('./merge');

/**
 * Possible states during dragging.
 */
var DragStage = {
  NONE:  'none',
  START: 'start',
  OVER:  'over',
};

var ResizingStage = {
  RESIZE_S: 'resize_s',
  RESIZE_W: 'resize_w',
  RESIZE_N: 'resize_n',
  RESIZE_E: 'resize_e',
  RESIZE_SE: 'resize_se',
  RESIZE_SW: 'resize_sw',
  RESIZE_NW: 'resize_nw',
  RESIZE_NE: 'resize_ne',
};

var Stage = merge(DragStage, ResizingStage);

var Dragon = React.createClass({

  propTypes: {
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    // How may columns our grid has. Controls the granularity of the
    // grid.
    columnsCount: React.PropTypes.number,
    margin: React.PropTypes.number,
    onDataChange: React.PropTypes.func.isRequired,
    borderWidth: React.PropTypes.number,
    // TODO: enforce children's type
  },

  getDefaultProps: function() {
    return {
      columnsCount: 20,
      borderWidth: 1,
    };
  },

  getInitialState: function() {

    window.addEventListener("mousemove", this.continueResizing);
    window.addEventListener("mouseup", this.stopResizing);

    return {
      // In cell units
      placeholderTop: null,
      // In cell units
      placeholderLeft: null,
      // ID of the widget being dragged
      draggedID: null,
      stage: Stage.NONE,
      tempData: this.data,
    };
  },

  render: function() {
    var scale = this.scale;
    var data = this.data;

    if (
      this.state.stage == Stage.OVER ||
      this.isResizingStage(this.state.stage)
    ) {
      data = this.state.tempData;
    } else {
      data = this.data;
    }

    var margin = this.props.margin;
    if (margin === undefined) {
      margin = this.getCellSizeInPx() * 0.05;
    }

    var listItems = this.props.children.map(function(widgetReact) {
      var key  = widgetReact.props.key;
      var item = data[key];
      var height = scale(item.height) - 2*margin;
      var width  = scale(item.width) - 2*margin;
      var borderWidth = this.props.borderWidth;
      var resizeGripWidth = 4;

      var isVisible = true;
      if (this.state.stage == Stage.OVER &&
          key == this.state.draggedID) {
          isVisible = false;
      }

      var blockStyle = {
        display: isVisible ? 'block': 'none',
        width: width,
        height: height,
        top: scale(item.top) + margin,
        left: scale(item.left) + margin,
        padding: borderWidth
      };
      var borderBottomStyle = {
        height: resizeGripWidth,
        top: height - resizeGripWidth,
        left: 0,
      };
      var borderRightStyle = {
        left: width - resizeGripWidth,
        top: 0,
        width: resizeGripWidth,
      };
      var borderTopStyle = {
        left: 0,
        top: 0,
        height: resizeGripWidth,
      };
      var borderLeftStyle = {
        left: 0,
        top: 0,
        width: resizeGripWidth,
      };
      var borderBottomRightStyle = {
        left: width - resizeGripWidth,
        top: height - resizeGripWidth,
        width: resizeGripWidth,
        height: resizeGripWidth,
      };
      var borderBottomLeftStyle = {
        left: 0,
        top: height - resizeGripWidth,
        width: resizeGripWidth,
        height: resizeGripWidth,
      };
      var borderTopLeftStyle = {
        left: 0,
        top: 0,
        width: resizeGripWidth,
        height: resizeGripWidth,
      };
      var borderTopRightStyle = {
        left: width - resizeGripWidth,
        top: 0,
        width: resizeGripWidth,
        height: resizeGripWidth,
      };
      return (
        <div
          key={key}
          data-id={key}
          className="widgetFrame"
          style={blockStyle}
          draggable="true"
          onMouseDown={this.registerClick}
          onDragEnd={this.dragEnd}
          onDragStart={this.dragStart}>
          {widgetReact}
          <div
            style={borderBottomStyle}
            className="widgetBorder bottom"
            onMouseDown={this.startResizing.bind(this, key, ResizingStage.RESIZE_S)}
          />
          <div
            style={borderRightStyle}
            className="widgetBorder right"
            onMouseDown={this.startResizing.bind(this, key, ResizingStage.RESIZE_E)}
          />
          <div
            style={borderTopStyle}
            className="widgetBorder top"
            onMouseDown={this.startResizing.bind(this, key, ResizingStage.RESIZE_N)}
          />
          <div
            style={borderLeftStyle}
            className="widgetBorder left"
            onMouseDown={this.startResizing.bind(this, key, ResizingStage.RESIZE_W)}
          />
          <div
            style={borderBottomRightStyle}
            className="widgetBorder bottomRight corner"
            onMouseDown={this.startResizing.bind(this, key, ResizingStage.RESIZE_SE)}
          />
          <div
            style={borderBottomLeftStyle}
            className="widgetBorder bottomLeft corner"
            onMouseDown={this.startResizing.bind(this, key, ResizingStage.RESIZE_SW)}
          />
          <div
            style={borderTopLeftStyle}
            className="widgetBorder topLeft corner"
            onMouseDown={this.startResizing.bind(this, key, ResizingStage.RESIZE_NW)}
          />
          <div
            style={borderTopRightStyle}
            className="widgetBorder topRight corner"
            onMouseDown={this.startResizing.bind(this, key, ResizingStage.RESIZE_NE)}
          />
        </div>
      );
    }.bind(this));

    var placeholderStyle = {
      display: 'none',
    };

    if (this.state.stage == Stage.OVER) {
      var dragged = this.getDraggedWidget();
      placeholderStyle.display = 'block';
      placeholderStyle.width = scale(dragged.width);
      placeholderStyle.height = scale(dragged.height);
      placeholderStyle.top = scale(this.state.placeholderTop);
      placeholderStyle.left = scale(this.state.placeholderLeft);
    }

    var placeholder =
      <div
        style={placeholderStyle}
        key={"placeholder"}
        className={classNames(["widgetFrame", "placeholder"])}
      />;

    listItems.push(placeholder);

    var containerStyle = {
      width: this.props.width + 'px',
      height: this.props.height + 'px'
    };
    return (
      <div
        data-id="container"
        className={classNames([
          "container",
          this.getClassNameFromResizeStage(this.state.stage)
        ])}
        ref={"container"}
        style={containerStyle}
        onDragOver={this.dragOver}>
          {listItems}
      </div>
    );
  },

  componentWillMount: function() {
    this.data = this.getDataFromWidgets(this.props.children);
  },

  componentWillReceiveProps: function(nextProps) {
    this.data = this.getDataFromWidgets(nextProps.children);
  },

  componentDidMount: function() {
    var containerDOM    = this.refs.container.getDOMNode();
    // Store the container offset so we can always to the math based
    // on the container's offset
    this.baseOffsetTop  = containerDOM.offsetTop;
    this.baseOffsetLeft = containerDOM.offsetLeft;
  },

  /****************************************************************************
   * Event handlers
   ****************************************************************************/

  registerClick: function(e) {
    this.target = e.target;
  },

  dragStart: function(e) {
    var draggedDOM = e.currentTarget;
    this.startX    = e.pageX;
    this.startY    = e.pageY;
    this.startTop  = draggedDOM.offsetTop;
    this.startLeft = draggedDOM.offsetLeft;
    e.dataTransfer.effectAllowed = 'move';
    // Only allow dragging from the handle
    if (!this.isHandle(this.target)) {
      e.preventDefault();
      return;
    }

    // Firefox requires calling dataTransfer.setData
    // for the drag to properly work
    e.dataTransfer.setData("text/html", e.currentTarget);

    this.setState({
      stage: Stage.START,
      placeholderTop: draggedDOM.offsetTop,
      placeholderLeft: draggedDOM.offsetLeft,
      draggedID: draggedDOM.dataset.id,
    });
  },

  dragOver: function(e) {
    e.preventDefault();
    var newOffset = this.getWidgetOffsetFromEvent(e);

    var placeholderRect = this.getPlaceholderRect();
    // Adjust other widgets to accomodate the placeholder
    var draggedID = this.state.draggedID;
    var newData = Collision.move(
      this.data,
      draggedID,
      placeholderRect
    );
    // Do not move the dragged element yet
    newData[draggedID] = newData[draggedID];

    this.setState({
      tempData: newData,
      stage: Stage.OVER,
      placeholderTop: newOffset.top,
      placeholderLeft: newOffset.left,
    });
  },

  dragEnd: function(e) {
    this.setState({
      stage: Stage.NONE,
      draggedID: null,
    });
    // Inform caller about the updated data
    this.props.onDataChange(this.state.tempData);
  },

  startResizing: function(id, stage, e) {
    // TODO: implement dragging to other directions
    this.setState({
      stage: stage,
      draggedID: id
    });
  },

  continueResizing: function(e) {
    if (!this.isResizingStage(this.state.stage)) {
      return;
    }
    var cellPosition = this.getCellPositionFromEvent(e);
    var dragged = this.getDraggedWidget();

    var newDragged = merge({}, dragged);
    switch (this.state.stage) {
      case ResizingStage.RESIZE_S:
        var newHeight = cellPosition.top - dragged.top;
        newDragged.height = newHeight;
        break;
      case ResizingStage.RESIZE_E:
        var newWidth = cellPosition.left - dragged.left;
        newDragged.width = newWidth;
        break;
      case ResizingStage.RESIZE_N:
        var newTop = cellPosition.top;
        var newHeight = dragged.height + (dragged.top - cellPosition.top);
        newDragged.height = newHeight;
        newDragged.top = newTop;
        break;
      case ResizingStage.RESIZE_W:
        var newLeft = cellPosition.left;
        var newWidth = dragged.width + (dragged.left - cellPosition.left);
        newDragged.width = newWidth;
        newDragged.left = newLeft;
        break;
      case ResizingStage.RESIZE_SE:
        var newHeight = cellPosition.top - dragged.top;
        var newWidth = cellPosition.left - dragged.left;
        newDragged.height = newHeight;
        newDragged.width = newWidth;
        break;
      case ResizingStage.RESIZE_SW:
        var newLeft = cellPosition.left;
        var newWidth = dragged.width + (dragged.left - cellPosition.left);
        var newHeight = cellPosition.top - dragged.top;
        newDragged.height = newHeight;
        newDragged.width = newWidth;
        newDragged.left = newLeft;
        break;
      case ResizingStage.RESIZE_NW:
        var newLeft = cellPosition.left;
        var newWidth = dragged.width + (dragged.left - cellPosition.left);
        var newHeight = dragged.height + (dragged.top - cellPosition.top);
        var newTop = cellPosition.top;
        newDragged.height = newHeight;
        newDragged.width = newWidth;
        newDragged.left = newLeft;
        newDragged.top = newTop;
        break;
      case ResizingStage.RESIZE_NE:
        var newHeight = dragged.height + (dragged.top - cellPosition.top);
        var newWidth = cellPosition.left - dragged.left;
        var newTop = cellPosition.top;
        newDragged.height = newHeight;
        newDragged.width = newWidth;
        newDragged.top = newTop;
        break;
    }

    // Adjust other widgets to accomodate the new size
    var draggedID = this.state.draggedID;
    var newData = Collision.move(
      this.data,
      draggedID,
      newDragged
    );
    this.setState({tempData: newData});
  },

  stopResizing: function(e) {
    if (!this.isResizingStage(this.state.stage)) {
      return;
    }
    this.props.onDataChange(this.state.tempData);
    this.setState({
      stage: Stage.NONE,
    });
  },

  /****************************************************************************
   * Helper functions
   ****************************************************************************/

  getCellSizeInPx: function() {
    cellSizeInPx = this.props.width/this.props.columnsCount;
    return cellSizeInPx;
  },

  /**
   * Converts a number in cell units to pixel units.
   */
  scale: function(x) {
    return x * this.getCellSizeInPx();
  },

  unscale: function(x) {
    return Math.round(x/this.getCellSizeInPx());
  },

  getWidgetOffsetFromEvent: function(e) {
    // Displacement since started dragging
    var deltaX = e.pageX - this.startX;
    var deltaY = e.pageY - this.startY;

    var newTopPx  = this.startTop + deltaY;
    var newLeftPx = this.startLeft + deltaX;
    var unscale = this.unscale;
    var newTop = unscale(newTopPx);
    var newLeft = unscale(newLeftPx);
    return {
      'top': newTop,
      'left': newLeft,
    };
  },

  /**
   * Returns the widget info corresponding to the dragged element, or
   * null if we're not dragging.
   */
  getDraggedWidget: function() /*?object*/ {
    if (this.state.draggedID === null) {
      return null;
    }
    return this.data[this.state.draggedID];
  },

  /**
   * Returns an object with {top, left} representing the position of
   * an event e in cell units.
   */
  getCellPositionFromEvent: function(e) /*object*/ {
    var relativeX = e.pageX - this.baseOffsetLeft;
    var relativeY = e.pageY - this.baseOffsetTop;

    var unscale = this.unscale;
    var newTop = unscale(relativeY);
    var newLeft = unscale(relativeX);
    return {
      'top': newTop,
      'left': newLeft,
    };
  },

  /**
   * Get a rectangle representing the placeholder.
   */
  getPlaceholderRect: function() {
    var draggedWidget = this.getDraggedWidget();
    return {
      left: this.state.placeholderLeft,
      top: this.state.placeholderTop,
      width: draggedWidget.width,
      height: draggedWidget.height,
    };
  },

  /**
   * Whether we're in a node or a descendant of a node with class
   * 'handle'.
   */
  isHandle: function(node) /*boolean*/ {
    if (!node || node.classList.contains('container')) {
      return false;
    }
    if (node.classList.contains('handle')) {
      return true;
    }
    return this.isHandle(node.parentNode);
  },

  isResizingStage: function(stage) {
    for (var stageName in ResizingStage) {
      if (ResizingStage[stageName] === stage) {
        return true;
      }
    }
    return false;
  },

  getClassNameFromResizeStage: function(stage) {
    var classNames = {};
    classNames[Stage.RESIZE_S] = 'resizeNS';
    classNames[Stage.RESIZE_N] = 'resizeNS';
    classNames[Stage.RESIZE_E] = 'resizeEW';
    classNames[Stage.RESIZE_W] = 'resizeEW';
    classNames[Stage.RESIZE_SE] = 'resizeNWSE';
    classNames[Stage.RESIZE_NW] = 'resizeNWSE';
    classNames[Stage.RESIZE_NE] = 'resizeNESW';
    classNames[Stage.RESIZE_SW] = 'resizeNESW';
    return classNames[stage] || '';
  },

  getDataFromWidgets: function(widgetsReact) {
    var data = {};
    widgetsReact.forEach(function(widgetReact) {
      data[widgetReact.props.key] = widgetReact.props.data;
    });
    return data;
  }

});

module.exports = Dragon;
