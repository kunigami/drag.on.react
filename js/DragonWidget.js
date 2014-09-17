/**
 * @jsx React.DOM
 *
 * This represents a single widget element. It also contains metadata
 * about the size of the widget
 **/

var DragonWidget = React.createClass({

  propTypes: {
    data: React.PropTypes.object.isRequired,
  },

  render: function() {
    return <div className="widget">{this.props.children}</div>;
  }

});

module.exports = DragonWidget;
