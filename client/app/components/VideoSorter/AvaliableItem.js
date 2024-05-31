import React, { Component, PropTypes } from "react";
import { DragSource } from "react-dnd";
import ItemTypes from "./ItemTypes";
const style = {
  border: "1px dashed gray",
  padding: "0.5rem 1rem",
  marginBottom: ".5rem",
  backgroundColor: "white",
  cursor: "move",
  fontFamily: "Verdana",
};

const cardSource = {
  beginDrag(props) {
    return {
      id: props.id,
      index: props.index,
    };
  },
  endDrag(props, monitor) {
    const item = monitor.getItem();
    const dropResult = monitor.getDropResult();
    const didDrop = monitor.didDrop();
  },
};

class AvaliableItem extends Component {
  static propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    isDragging: PropTypes.bool.isRequired,
    id: PropTypes.any.isRequired,
    moveCard: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
  }

  render() {
    const { connectDragSource, connectDropTarget, id, isDragging, text } =
      this.props;
    const opacity = isDragging ? 0 : 1;

    return connectDragSource(
      <div style={{ ...style, opacity }}>
        <p>{text}</p>
      </div>
    );
  }
}

export default DragSource(ItemTypes.CARD, cardSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
}))(AvaliableItem);
