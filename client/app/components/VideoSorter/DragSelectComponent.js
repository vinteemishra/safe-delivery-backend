import React, { Component } from "react";
import { DragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import SortableComponent from "./SortableComponent";

class DragSelectComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      available: props.available.map((a) => ({
        id: a.key,
        text: a.description || a.key,
      })),
      selected: props.selected.map((a) => ({
        id: a.key,
        text: a.description || a.key,
      })),
    };
  }

  render() {
    const style = {
      display: "flex",
      justifyContent: "space-around",
      paddingTop: "20px",
    };

    return (
      <div style={{ ...style }}>
        <section style={{ width: "48%" }}>
          <h5>Available</h5>
          <SortableComponent
            style={{ width: "100%", marginRight: "4px" }}
            title="Available"
            id={1}
            list={this.state.available}
            filter={this.props.filter}
          />
        </section>
        <section style={{ width: "48%" }}>
          <h5>Selected</h5>
          <SortableComponent
            style={{ width: "100%" }}
            id={2}
            list={this.state.selected}
            onChange={this.props.onChange}
            filter={this.props.filter}
          />
        </section>
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(DragSelectComponent);
