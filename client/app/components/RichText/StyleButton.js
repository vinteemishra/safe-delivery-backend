import React from "react";

const buttonStyle = {
  padding: 5,
};
class StyleButton extends React.Component {
  constructor(props) {
    super(props);
    this.onToggle = (e) => {
      e.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }

  render() {
    let spanStyle = buttonStyle;
    if (this.props.active) {
      spanStyle = {
        ...spanStyle,
        color: "blue",
      };
    }

    return (
      <span style={spanStyle} onMouseDown={this.onToggle}>
        {this.props.label}
      </span>
    );
  }
}

export default StyleButton;
