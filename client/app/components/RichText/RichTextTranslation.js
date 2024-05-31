import { translatedFontStyle } from "lib/util";
import React, { Component } from "react";
import Button from "react-toolbox/lib/button";
import Dialog from "react-toolbox/lib/dialog";
import ImageList from "../ImageList";
import Modal from "../Modal";
import ItemTypes from "./ItemTypes";
import Tables from "./Tables";
import TypeBasedComponent from "./TypeBasedComponent";
const styles = {
  divStyle: {
    display: "flex",
    flexDirection: "row",
    alignContent: "space-between",
    justifyContent: "space-around",
    flexFlow: "row wrap",
    padding: 8,
    margin: 8,
    marginLeft: 0,
    borderColor: "gray",
    borderWidth: 1,
    borderStyle: "solid",
  },
  editorStyle: {
    padding: 8,
  },
  sectionHeadline: {
    display: "inline",
    flex: 1,
  },
};

class RichTextTranslation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...this.stateFromProps(props),
      image_dialog: false,
      showTableDialog: false,
      tableEditId: -1,
    };
  }

  getTranslatedEditorStyle(langId) {
    const font = translatedFontStyle(langId);
    return {
      padding: 8,
      ...font,
    };
  }

  stateFromProps(props) {
    return {
      cards: props.document.cards,
      next_id: props.document.next_id,
      translatedEditorStyle: this.getTranslatedEditorStyle(props.langId),
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.stateFromProps(nextProps));
  }

  // componentWillMount(nextProps){
  //   this.setState(this)
  // }

  saveRichText(state) {
    //Save the state to database
    this.props.onSave({
      ...this.props.document,
      next_id: this.state.next_id,
      cards: this.state.cards,
    });
  }

  handleAdaptedInput(input, id) {
    let array = this.state.cards;
    for (let i = 0; i < array.length; i++) {
      if (array[i].id == id) {
        array[i].adapted = input;
        this.setState({ cards: array });
      }
    }
  }

  handleTranslatedInput(input, id) {
    let array = this.state.cards;
    for (let i = 0; i < array.length; i++) {
      if (array[i].id == id) {
        array[i].translated = input;
        this.setState({ cards: array });
      }
    }
  }

  handleTableChoice(table) {
    const cards = this.state.cards.map((c) =>
      c.id === this.state.tableEditId
        ? { ...c, translated: { html: table } }
        : c
    );
    console.log("Cards:", cards);
    this.setState({ cards, showTableDialog: false, tableEditId: -1 });
  }

  //Allows to change images in language version
  image_actions = [
    { label: "Cancel", onClick: () => this.handleImageDialogClose() },
    {
      label: "Add Image",
      onClick: () => {
        this.handleImageDialogClose();
        let name = { src: this.state.name };
        this.handleAdaptedInput(name, this.state.clickedImage);
        this.handleTranslatedInput(name, this.state.clickedImage);
        //this.addItem(ItemTypes.IMAGE, {src: this.state.name})
      },
    },
  ];
  handleImageDialogOpen = (id) => {
    console.log("Opening dialog: ", id);
    this.setState({
      image_dialog: true,
      clickedImage: id,
    });
  };

  handleChange = (name, value) => {
    this.setState({ [name]: value });
  };
  handleImageDialogClose = () => {
    this.setState({ image_dialog: false });
  };

  render() {
    const { cards } = this.state;
    const adaptedReadOnly = this.props.role === "translator";
    if (cards.length < 1) {
      return (
        <p ref="myTest">
          {" "}
          There is no content. Create content for translation in master
        </p>
      );
    } else {
      let translationCards = cards.map((card, index) => {
        if (
          card.type == ItemTypes.DIVIDER ||
          card.type == ItemTypes.DIVIDER_NOLINE
        ) {
          return (
            <div key={index} style={styles.divStyle}>
              <TypeBasedComponent
                imageMap={this.props.images}
                style={styles.editorStyle}
                readOnly={true}
                type={card.type}
                content={card.content}
                id={card.id}
              />
            </div>
          );
        }
        if (card.type == ItemTypes.IMAGE) {
          return (
            <div key={index} style={styles.divStyle}>
              <TypeBasedComponent
                imageMap={this.props.images}
                style={styles.editorStyle}
                readOnly={true}
                type={card.type}
                content={card.content}
                id={card.id}
              />
              <TypeBasedComponent
                imageMap={this.props.images}
                style={styles.editorStyle}
                readOnly={false}
                type={card.type}
                content={card.adapted}
                id={card.id}
                onClick={this.handleImageDialogOpen.bind(this)}
              />
            </div>
          );
        }
        if (card.type == ItemTypes.TABLE) {
          return (
            <div key={index} style={styles.divStyle}>
              <TypeBasedComponent
                readOnly
                style={styles.editorStyle}
                type={card.type}
                content={card.content}
                id={card.id}
                isMaster={true}
              />
              <TypeBasedComponent
                style={styles.editorStyle}
                handleInput={this.handleTranslatedInput.bind(this)}
                readOnly={adaptedReadOnly}
                type={card.type}
                content={card.adapted}
                id={card.id}
                masterContent={card.content}
                isAdapted={true}
              />
              <div>
                <TypeBasedComponent
                  style={this.state.translatedEditorStyle}
                  handleInput={this.handleTranslatedInput.bind(this)}
                  type={card.type}
                  content={
                    typeof card.translated == "object"
                      ? card.translated
                      : card.adapted
                  }
                  id={card.id}
                  masterContent={card.content}
                />
                <Button
                  primary
                  raised
                  label="Change table"
                  onClick={() => {
                    this.setState({
                      showTableDialog: true,
                      tableEditId: card.id,
                    });
                  }}
                />
              </div>
            </div>
          );
        }
        return (
          <div key={index} style={styles.divStyle}>
            <TypeBasedComponent
              style={styles.editorStyle}
              handleInput={() => console.log("master is readOnly")}
              readOnly={true}
              type={card.type}
              content={card.content}
              id={card.id}
              isMaster={true}
            />
            <TypeBasedComponent
              style={styles.editorStyle}
              handleInput={this.handleAdaptedInput.bind(this)}
              readOnly={adaptedReadOnly}
              type={card.type}
              content={card.adapted}
              id={card.id}
              masterContent={card.content}
              isAdapted={true}
            />
            <TypeBasedComponent
              style={this.state.translatedEditorStyle}
              handleInput={this.handleTranslatedInput.bind(this)}
              type={card.type}
              content={card.translated}
              id={card.id}
              masterContent={card.content}
            />
          </div>
        );
      });

      const dismissTableDialog = () => {
        this.setState({ showTableDialog: false, tableEditId: -1 });
      };

      return (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div>
            <h2>{this.props.title}</h2>
            <Button
              primary
              raised
              label="Save"
              onClick={() => this.saveRichText(this.state.cards)}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flex: 1,
                justifyContent: "space-between",
                borderBottomWidth: 1,
                borderBottomStyle: "solid",
                borderColor: "#000",
              }}
            >
              <h4 style={styles.sectionHeadline}>Master</h4>
              <h4 style={styles.sectionHeadline}>Adapted</h4>
              <h4 style={styles.sectionHeadline}>Translated</h4>
            </div>
          </div>
          <div style={{ overflowY: "auto", height: "80vh" }}>
            {translationCards}
          </div>
          <Modal
            actions={this.image_actions}
            show={this.state.image_dialog}
            onClose={this.handleImageDialogClose}
            component={
              <ImageList
                images={this.props.images}
                onClick={(value) => this.handleChange("name", value)}
              />
            }
          />
          {/* <Dialog
            actions={this.image_actions}
            active={this.state.image_dialog}
            onEscKeyDown={this.handleImageDialogClose}
            onOverlayClick={this.handleImageDialogClose}
            title="Choose an image"
          >
            <div style={{ maxHeight: "400px", overflowY: "scroll" }}>
              <ImageList
                images={this.props.images}
                onClick={(value) => this.handleChange("name", value)}
              />
            </div>
          </Dialog> */}
          <Dialog
            actions={[{ label: "Cancel", onClick: dismissTableDialog }]}
            active={this.state.showTableDialog}
            onEscKeyDown={dismissTableDialog}
            onOverlayClick={dismissTableDialog}
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
        </div>
      );
    }
  }
}

export default RichTextTranslation;
