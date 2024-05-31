import React, { Component } from "react";
import update from "react/lib/update";
import EditorCard from "./EditorCard";
import { DragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import ItemTypes from "./ItemTypes";
import Button from "react-toolbox/lib/button";
import Dustbin from "./Dustbin";
import Dialog from "react-toolbox/lib/dialog";
import Input from "react-toolbox/lib/input";
import Tables from "./Tables";
import ImageList from "../ImageList";
import Modal from "../Modal";

const styles = {
  editorCard: {
    flex: 1,
    maxWidth: 375,
  },
};

const Mono = ({ children }) => {
  return (
    <span style={{ fontFamily: "monospace", color: "black" }}>{children}</span>
  );
};

class RichTextComponent extends Component {
  constructor(props) {
    super(props);

    this.moveCard = this.moveCard.bind(this);
    this.state = {
      ...this.stateFromProps(props),
      image_dialog: false,
      link_dialog: false,
      table_dialog: false,
      formula_dialog: false,
      name: "",
    };
  }

  stateFromProps(props) {
    // Safety
    let doc = { cards: [], ...props.document };

    if (typeof doc.next_id === "undefined") {
      doc.next_id =
        doc.cards.reduce((acc, c) => Math.max(acc, c.id || 0), 0) + 1;
    }

    return {
      cards: doc.cards,
      next_id: doc.next_id,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.stateFromProps(nextProps));
  }

  saveRichText(state) {
    //Save the state to database
    this.props.onSave({
      ...this.props.document,
      next_id: this.state.next_id,
      cards: this.state.cards,
    });
  }

  //Used for components that need user input on create
  addItem(type, content = {}) {
    let item = {
      id: this.state.next_id,
      content: content,
      type,
    };
    let newState = this.state.cards.concat(item);

    this.setState({ cards: newState, next_id: this.state.next_id + 1 });
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
  }

  handleInput(input, id) {
    let array = this.state.cards;
    for (let i = 0; i < array.length; i++) {
      if (array[i].id == id) {
        array[i].content = input;
        this.setState({ cards: array });
      }
    }
  }

  handleDelete(item) {
    const { cards } = this.state;
    this.setState(
      update(this.state, {
        cards: {
          $splice: [[item.index, 1]],
        },
      })
    );
  }

  handleTableDialogToggle = () => {
    this.setState({ table_dialog: !this.state.table_dialog });
  };

  handleImageDialogToggle = () => {
    const { image_dialog } = this.state;
    this.setState({ image_dialog: !image_dialog });
  };

  handleLinkDialogToggle = () => {
    this.setState({ link_dialog: !this.state.link_dialog });
  };

  handleTableChoice(table) {
    this.addItem(ItemTypes.TABLE, { html: table });
    this.handleTableDialogToggle();
  }

  table_actions = [{ label: "Cancel", onClick: this.handleTableDialogToggle }];

  image_actions = [
    { label: "Cancel", onClick: this.handleImageDialogToggle },
    {
      label: "Add Image",
      onClick: () => {
        this.handleImageDialogToggle();
        this.addItem(ItemTypes.IMAGE, { src: this.state.name });
      },
    },
  ];

  link_actions = [
    { label: "Cancel", onClick: this.handleLinkDialogToggle },
    {
      label: "Insert link",
      onClick: () => {
        this.handleLinkDialogToggle();
        this.addItem(ItemTypes.LINK, {
          link: this.state.linkUrl,
          text: this.state.linkText,
        });
        this.setState({ linkUrl: "", linkText: "" });
      },
    },
  ];

  render() {
    const { cards } = this.state;
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          backgroundColor: "#cccccc",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            maxWidth: 375,
            backgroundColor: "#ffffff",
            border: "solid 1px",
            height: "90vh",
          }}
        >
          <h2 style={{ padding: 16 }}>{this.props.title}</h2>
          <Button
            primary
            raised
            label="Save"
            onClick={() => this.saveRichText(this.state.cards)}
          />
          <Dustbin onDrop={this.handleDelete.bind(this)} />
          <Button
            label="Add Header"
            onClick={() => this.addItem(ItemTypes.HEADER)}
          />
          <Button
            label="Add Alphabetical header"
            onClick={() => this.addItem(ItemTypes.ALPHABETICAL_HEADER)}
          />
          <Button
            label="Add Subheader"
            onClick={() => this.addItem(ItemTypes.SUBHEADER)}
          />
          <Button
            label="Add Paragraph"
            onClick={() => this.addItem(ItemTypes.PARAGRAPH)}
          />
          <Button
            label="Add Important Text"
            onClick={() => this.addItem(ItemTypes.IMPORTANT_TEXT)}
          />
          <Button
            label="Add Divider"
            onClick={() => this.addItem(ItemTypes.DIVIDER)}
          />
          <Button
            label="Add Divider (No line)"
            onClick={() => this.addItem(ItemTypes.DIVIDER_NOLINE)}
          />
          <Button
            label="Add Ordered list"
            onClick={() => this.addItem(ItemTypes.ORDERED_LIST)}
          />
          <Button
            label="Add Unordered list"
            onClick={() => this.addItem(ItemTypes.UNORDERED_LIST)}
          />
          <Button
            label="Add Image"
            onClick={() => this.handleImageDialogToggle(ItemTypes.IMAGE)}
          />
          <Button
            label="Add Table"
            onClick={() => this.handleTableDialogToggle(ItemTypes.TABLE)}
          />
          <Button
            label="Add Formula"
            onClick={() =>
              this.addItem(ItemTypes.FORMULA, { html: Tables.FORMULA })
            }
          />
          <Button
            label="Add Link"
            onClick={() => this.handleLinkDialogToggle(ItemTypes.LINK)}
          />
        </div>
        <div
          style={{
            flex: 2,
            backgroundColor: "#cccccc",
            marginLeft: 8,
            overflowY: "auto",
            height: "90vh",
          }}
        >
          <div style={styles.editorCard}>
            {cards.map((card, i) => {
              return (
                <EditorCard
                  key={card.id}
                  type={card.type}
                  index={i}
                  id={card.id}
                  content={card.content}
                  imageMap={this.props.images}
                  moveCard={this.moveCard}
                  handleInput={this.handleInput.bind(this)}
                />
              );
            })}
          </div>
        </div>
        <Modal
          actions={this.image_actions}
          show={this.state.image_dialog}
          onClose={this.handleImageDialogToggle}
          title="Choose an Image"
          component={
            <ImageList
              images={this.props.images}
              onClick={(value) => this.setState({ name: value })}
            />
          }
        />

        {/* <Dialog
          actions={this.image_actions}
          active={this.state.image_dialog}
          onEscKeyDown={this.handleImageDialogToggle}
          onOverlayClick={this.handleImageDialogToggle}
          title="Choose an image"
        >
          <div style={{ maxHeight: "400px", overflowY: "scroll" }}>
            <ImageList
              images={this.props.images}
              onClick={(value) => this.setState({ name: value })}
            />
          </div>
        </Dialog> */}
        <Dialog
          actions={this.table_actions}
          active={this.state.table_dialog}
          onEscKeyDown={this.handleTableDialogToggle}
          onOverlayClick={this.handleTableDialogToggle}
          title="Choose a table"
        >
          <Button
            label="Apgar"
            onClick={this.handleTableChoice.bind(this, Tables.APGAR)}
          />
          <Button
            label="Fluids"
            onClick={this.handleTableChoice.bind(this, Tables.FLUIDS)}
          />
          <Button
            label="Fluids (old)"
            onClick={this.handleTableChoice.bind(this, Tables.FLUIDS_OLD)}
          />
          <Button
            label="Fluids (1)"
            onClick={this.handleTableChoice.bind(this, Tables.FLUIDS_1)}
          />
          <Button
            label="Jaundice"
            onClick={this.handleTableChoice.bind(this, Tables.JAUNDINCE)}
          />
        </Dialog>

        <Dialog
          actions={this.link_actions}
          active={this.state.link_dialog}
          onEscKeyDown={this.handleLinkDialogToggle}
          onOverlayClick={this.handleLinkDialogToggle}
          title="Insert link"
        >
          <p>
            Insert link. Start with <Mono>http://</Mono> or{" "}
            <Mono>https://</Mono> for external link. Start with{" "}
            <Mono>safedelivery://</Mono> for internal link.
          </p>
          <Input
            value={this.state.linkUrl || ""}
            onChange={(val) => {
              this.setState({ linkUrl: val });
            }}
            required={true}
            label="Link URL"
          />
          <Input
            value={this.state.linkText || ""}
            onChange={(val) => {
              this.setState({ linkText: val });
            }}
            required={true}
            label="Link text"
          />
        </Dialog>
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(RichTextComponent);
