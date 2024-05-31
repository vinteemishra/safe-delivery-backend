import React, { Component } from "react";
import update from "react/lib/update";
import { DropTarget } from "react-dnd";
import ItemCard from "./ItemCard";

class SortableComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { cards: props.list };
  }

  moveCard(dragIndex, hoverIndex) {
    const { cards } = this.state;
    const dragCard = cards[dragIndex];
    this.setState(
      update(this.state, {
        cards: {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragCard],
          ],
        },
      })
    );
    this.onChange();
  }

  pushCard(card) {
    this.setState(
      update(this.state, {
        cards: {
          $push: [card],
        },
      })
    );
    this.onChange();
  }

  removeCard(index) {
    this.setState(
      update(this.state, {
        cards: {
          $splice: [[index, 1]],
        },
      })
    );
    this.onChange();
  }

  onChange() {
    if (typeof this.props.onChange == "function") {
      this.props.onChange(this.state);
    }
  }

  filterCards(list, filterText) {
    filterText = (filterText || "").trim();
    if (!filterText) {
      return list;
    }

    const filters = filterText.split(" ");
    let result = [].concat(list);
    for (let f of filters) {
      result = result.filter(
        (card) => card.text.toLowerCase().indexOf(f.toLowerCase()) !== -1
      );
    }
    return result;
  }

  render() {
    const { cards } = this.state;
    const { canDrop, isOver, connectDropTarget } = this.props;
    const isActive = canDrop && isOver;
    const style = {
      height: "424px",
      border: "1px solid gray",
    };

    const filteredCards = this.filterCards(cards, this.props.filter);

    const backgroundColor = isActive ? "lightgreen" : "#FFF";
    return connectDropTarget(
      <div
        style={{
          ...style,
          backgroundColor,
          ...this.props.style,
          overflow: "scroll",
        }}
      >
        {filteredCards.map((card, i) => {
          return (
            <ItemCard
              key={card.id}
              index={cards.indexOf(card)}
              listId={this.props.id}
              card={card}
              removeCard={this.removeCard.bind(this)}
              moveCard={this.moveCard.bind(this)}
            />
          );
        })}
      </div>
    );
  }
}

const cardTarget = {
  drop(props, monitor, component) {
    const { id } = props;
    const sourceObj = monitor.getItem();
    if (id !== sourceObj.listId) component.pushCard(sourceObj.card);
    return {
      listId: id,
    };
  },
};

export default DropTarget("CARD", cardTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
}))(SortableComponent);
