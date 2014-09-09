/**
 * @jsx React.DOM
 *
 **/

var Dragon = require('./Dragon');

// Example with a list of hard-coded with these widgets
var widgets = {
  10: {
    top: 0,
    left: 0,
    height: 3,
    width: 3,
  },
  11: {
    top: 0,
    left: 3,
    height: 4,
    width: 5,
  },
  12: {
    top: 4,
    left: 4,
    height: 4,
    width: 1,
    id: 2,
  },
};

var Example = React.createClass({

  getInitialState: function() {
    return {
      widgetMap: widgets,
    };
  },

  render: function() {
    return (
      <div>
        <h1>Drag.on - A Drag-n-drop dashboard framework</h1>
        <Dragon
          data={this.state.widgetMap}
          width={800}
          height={600}
          onDataChange={this.updateWidgetMap}>
          <div className="body">
            <div className="handle title">
              Title (grip)
            </div>
            <div className="content">
              hello world
            </div>
          </div>
        </Dragon>
      </div>
    );
  },

  updateWidgetMap: function(newWidgetMap) {
    this.setState({widgetMap: newWidgetMap});
  },

});

React.renderComponent(
  <Example />,
  document.getElementById('example')
);
