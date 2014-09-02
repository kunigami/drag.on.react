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
  },

  getDefaultProps: function() {
    return {
      columnsCount: 20,
    };
  },

  getInitialState: function() {
    return {
      placeholderTop: null,
      placeholderLeft: null,
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
      data = this.tempData;
    }

    var margin = this.props.margin;
    if (margin === undefined) {
      margin = this.getCellSizeInPx() * 0.05;
    }

    var widgetKeys = Object.keys(data);
    var listItems = widgetKeys.map(function(key) {
      var item = data[key];
      var blockStyle = {
        width: scale(item.width) - 2*margin,
        height: scale(item.height) - 2*margin,
        top: scale(item.top) + margin,
        left: scale(item.left) + margin,
      };
      return (
        <div
          style={blockStyle}
          data-id={key}
          key={key}
          className="widget"
          draggable="true"
          onDragEnd={this.dragEnd}
          onDragStart={this.dragStart}>
            #{key}
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
    }

    var placeholder =
      <div
        style={placeholderStyle}
        key={"placeholder"}
        className="widget placeholder"
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
        style={containerStyle}
        onDragOver={this.dragOver}>
          {listItems}
      </div>
    );
  },

  dragStart: function(e) {
    this.dragged   = e.currentTarget;
    this.startX    = e.clientX;
    this.startY    = e.clientY;
    this.startTop  = this.dragged.offsetTop;
    this.startLeft = this.dragged.offsetLeft;
    e.dataTransfer.effectAllowed = 'move';

    // Firefox requires calling dataTransfer.setData
    // for the drag to properly work
    e.dataTransfer.setData("text/html", e.currentTarget);

    this.setState({
      dragState: DragState.START,
      placeholderTop: this.dragged.offsetTop,
      placeholderLeft: this.dragged.offsetLeft,
    });
  },

  dragOver: function(e) {
    e.preventDefault();
    this.dragged.style.display = "none";

    var from = this.dragged.dataset.id;

    var newOffset = this.getCellPositionFromEvent(e);

    if (this.state.dragState == DragState.OVER) {
      var placeholderRect  = this.getPlaceholderRect();
      placeholderRect.top  = newOffset.top;
      placeholderRect.left = newOffset.left;
      var newData = Collision.move(
        this.props.data,
        from,
        placeholderRect
      );
      this.tempData = newData;
      // Do not move 'from' yet
      this.tempData[from] = this.props.data[from];
    } else {
      this.tempData = this.props.data;
    }

    this.setState({
      dragState: DragState.OVER,
      placeholderTop: newOffset.top,
      placeholderLeft: newOffset.left,
    });
    return;
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

  getCellSizeInPx: function() {
    cellSizeInPx = this.props.width/this.props.columnsCount;
    return cellSizeInPx;
  },

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

  getPlaceholderRect: function() {
    var from = Number(this.dragged.dataset.id);
    var fromRect = this.props.data[from];
    return {
      left: this.state.placeholderLeft,
      top: this.state.placeholderTop,
      width: fromRect.width,
      height: fromRect.height,
    };
  }
});

module.exports = Dragon;
