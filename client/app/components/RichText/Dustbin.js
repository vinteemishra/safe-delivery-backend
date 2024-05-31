import React, { PropTypes, Component } from "react";
import ItemTypes from "./ItemTypes";
import { DropTarget } from "react-dnd";

const style = {
  height: "12rem",
  width: "100%",
  marginRight: "1.5rem",
  marginBottom: "1.5rem",
  color: "white",
  padding: "1rem",
  textAlign: "center",
  fontSize: "1rem",
  lineHeight: "normal",
  float: "left",
};

const boxTarget = {
  drop(props, monitor) {
    props.onDrop(monitor.getItem());
  },
};

class Dustbin extends Component {
  static propTypes = {
    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
    canDrop: PropTypes.bool.isRequired,
  };

  render() {
    const { canDrop, isOver, connectDropTarget } = this.props;
    const isActive = canDrop && isOver;

    let backgroundColor = "blue";
    if (isActive) {
      backgroundColor = "darkgreen";
    } else if (canDrop) {
      backgroundColor = "blue";
    }

    return connectDropTarget(
      <div style={{ ...style, backgroundColor }}>
        {isActive ? "Release to drop" : "Drag a card here to delete it"}
      </div>
    );
  }
}
export default DropTarget(ItemTypes.CARD, boxTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
}))(Dustbin);
