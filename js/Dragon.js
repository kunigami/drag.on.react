/**
 * @jsx React.DOM
 *
 * This represents the top level React component of the drag.on
 * framework.
 **/

var Collision = require('./Collision');
var merge = require('./merge');

/**
 * Possible states during dragging.
 */
var DragState = {
  'NONE':  'none',
  'START': 'start',
  'OVER':  'over',
  'RESIZE_S': 'resize_s',
};

var Dragon = React.createClass({

  // This represents a temporary state when we're during the dragging
  // process. We don't change the props.data until the drag is done
  tempData: {},

  propTypes: {
    data: React.PropTypes.object.isRequired,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    // How may columns our grid has. Controls the granularity of the
    // grid.
    columnsCount: React.PropTypes.number,
    margin: React.PropTypes.number,
    onDataChange: React.PropTypes.func.isRequired,
    borderWidth: React.PropTypes.number,
  },

  getDefaultProps: function() {
    return {
      columnsCount: 20,
      borderWidth: 2,
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
      dragState: DragState.NONE,
    };
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    // TODO: optimize and return false if nothing changed
    return true;
  },

  render: function() {
    var scale = this.scale;
    var data = this.props.data;

    if (this.state.dragState == DragState.OVER) {
      var placeholderRect = this.getPlaceholderRect();
      // Adjust other widgets to accomodate the placeholder
      var draggedID = this.state.draggedID;
      var newData = Collision.move(
        this.props.data,
        draggedID,
        placeholderRect
      );
      this.tempData = newData;
      // Do not move 'from' yet
      this.tempData[draggedID] = this.props.data[draggedID];
      data = this.tempData;
    } else {
      data = this.props.data;
    }

    var margin = this.props.margin;
    if (margin === undefined) {
      margin = this.getCellSizeInPx() * 0.05;
    }

    var widgetKeys = Object.keys(data);
    var listItems = widgetKeys.map(function(key) {
      var item = data[key];
      var height = scale(item.height) - 2*margin;
      var width  = scale(item.width) - 2*margin;
      var borderWidth = this.props.borderWidth;
      var blockStyle = {
        // TODO: verify why this doesn't work
        //visibility: key == this.state.draggedID ? 'hidden': 'visible',
        width: width,
        height: height,
        top: scale(item.top) + margin,
        left: scale(item.left) + margin,
        padding: borderWidth
      };
      var borderBottomStyle = {
        height: borderWidth,
        top: height - borderWidth,
        left: 0,
      }
      this.props.children.containerHeight = height;
      this.props.children.containerWidth = width;
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
          <div
            className="widget">
              {this.props.children}
            </div>
          <div
            style={borderBottomStyle}
            className="widgetBorderBottom"
            onMouseDown={this.startResizing}
          />
        </div>
      );
    }.bind(this));

    var placeholderStyle = {
      display: 'none',
    };

    if (this.state.dragState == DragState.OVER) {
      placeholderStyle.display = 'block';
      placeholderStyle.width = this.dragged.style.width;
      placeholderStyle.height = this.dragged.style.height;
      placeholderStyle.top = scale(this.state.placeholderTop);
      placeholderStyle.left = scale(this.state.placeholderLeft);
    } else if (this.state.dragState == DragState.RESIZE_S) {
      placeholderStyle.display = 'block';
      placeholderStyle.width =
      placeholderStyle.height =
      placeholderStyle.top = scale(this.state.placeholderTop);
      placeholderStyle.left = scale(this.state.placeholderLeft);
    }

    var placeholder =
      <div
        style={placeholderStyle}
        key={"placeholder"}
        className="widgetFrame placeholder"
      />;

    listItems.push(placeholder);

    var containerStyle = {
      width: this.props.width + 'px',
      height: this.props.height + 'px'
    };
    return (
      <div
        data-id="container"
        className="container"
        ref={"container"}
        style={containerStyle}
        onDragOver={this.dragOver}>
          {listItems}
      </div>
    );
  },

  /****************************************************************************
   * Event handlers
   ****************************************************************************/

  registerClick: function(e) {
    this.target = e.target;
  },

  dragStart: function(e) {
    this.dragged   = e.currentTarget;
    this.startX    = e.clientX;
    this.startY    = e.clientY;
    this.startTop  = this.dragged.offsetTop;
    this.startLeft = this.dragged.offsetLeft;
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
      dragState: DragState.START,
      placeholderTop: this.dragged.offsetTop,
      placeholderLeft: this.dragged.offsetLeft,
      draggedID: this.dragged.dataset.id,
    });
  },

  dragOver: function(e) {
    e.preventDefault();
    var newOffset = this.getCellPositionFromEvent(e);
    this.dragged.style.display = 'none';
    this.setState({
      dragState: DragState.OVER,
      placeholderTop: newOffset.top,
      placeholderLeft: newOffset.left,
    });
  },

  dragEnd: function(e) {
    this.dragged.style.display = "block";

    var data = this.props.data;
    var from = Number(this.dragged.dataset.id);

    data[from].top = this.state.placeholderTop;
    data[from].left = this.state.placeholderLeft;

    this.setState({
      dragState: DragState.NONE,
    });
    // Inform caller about the updated data
    this.props.onDataChange(this.tempData);
    return;
  },

  startResizing: function(e) {
    this.setState({
      dragState: DragState.RESIZE_S
    });
  },

  continueResizing: function(e) {
    if (this.state.dragState != DragState.RESIZE_S) {
      return;
    }
    var containerDOM = this.refs.container.getDOMNode();
    var x = e.clientX - containerDOM.offsetLeft;
    var y = e.clientY - containerDOM.offsetTop;
  },

  stopResizing: function(e) {
    if (this.state.dragState != DragState.RESIZE_S) {
      return;
    }
    this.setState({
      dragState: DragState.NONE,
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

  getCellPositionFromEvent: function(e) {
    // Displacement since started dragging
    var deltaX = e.clientX - this.startX;
    var deltaY = e.clientY - this.startY;
    // New offset
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
   * Get a rectangle representing the placeholder.
   */
  getPlaceholderRect: function() {
    var from = Number(this.dragged.dataset.id);
    var fromRect = this.props.data[from];
    return {
      left: this.state.placeholderLeft,
      top: this.state.placeholderTop,
      width: fromRect.width,
      height: fromRect.height,
    };
  },

  isHandle: function(node) {
    if (!node || node.classList.contains('container')) {
      return false;
    }
    if (node.classList.contains('handle')) {
      return true;
    }
    return this.isHandle(node.parentNode);
  }
});

module.exports = Dragon;
