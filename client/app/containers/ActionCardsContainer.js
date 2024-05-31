"use strict";

import React, { Component } from "react";
import { connect } from "react-redux";
import { Button } from "react-toolbox/lib/button";
import Input from "react-toolbox/lib/input";
import Snackbar from "react-toolbox/lib/snackbar";
import { PUSH } from "redux-little-router";
import {
  List,
  ListItem,
  ListSubHeader,
  ListDivider,
} from "react-toolbox/lib/list";
import { ActionCards } from "lib/sdaAPI";
import { genkey, langIdFromRoute } from "lib/util";
import ImageList from "../components/ImageList/index";
import Modal from "../components/Modal";

class ActionCardsContainer extends Component {
  state = {
    actionCards: [],
    dialogActive: false,
    snackActive: false,
    snackLabel: "?",
    description: "",
    icon: "",
  };

  isMaster = () => this.props.langId === "";

  handleDelete(card) {
    if (
      confirm(
        `Deleting Action Card '${card.description}' will delete all translations for this card. Are you sure you want to proceed?`
      )
    ) {
      ActionCards.del(card.key).then((r) => {
        const cards = this.state.actionCards.filter((c) => c.id !== card.id);
        this.setState({ actionCards: cards });
      });
    }
    return true;
  }

  handleChange(name, value) {
    this.setState({ ...this.state, [name]: value });
  }

  componentWillMount() {
    ActionCards.all(this.props.langId).then((ps) => {
      console.log("got cards", ps);
      ps.length && this.setState({ actionCards: ps });
    });
  }

  hideDialog = () => this.setState({ dialogActive: false });

  cardActions(card) {
    return [
      <Button
        key={card.key}
        icon="delete"
        onClick={() => this.handleDelete(card)}
      />,
    ];
  }

  saveCard = () => {
    const desc = this.state.description;
    const cardKey = genkey(desc);
    const card = {
      key: cardKey,
      langId: "",
      cards: [],
      description: desc,
      icon: this.state.icon,
    };
    console.log("New card", card);
    ActionCards.post(card).then((m) => {
      this.setState({
        actionCards: [...this.state.actionCards, card],
        snackLabel: `Action Card '${card.description}' added`,
        snackActive: true,
      });
    });
    this.hideDialog();
  };

  actions = [
    { label: "Cancel", onClick: this.hideDialog },
    { label: "Save", onClick: this.saveCard },
  ];

  render() {
    const push = (l) => this.props.push(this.props.currentPathname, l);

    return (
      <section>
        {this.state.actionCards.length == 0 && !this.isMaster() && (
          <p>Please create Action Cards in master</p>
        )}

        <List selectable>
          <ListSubHeader caption="Action Cards" />
          {this.state.actionCards.map((cards) => (
            <ListItem
              key={cards.key}
              avatar={this.props.images.get(cards.icon)}
              caption={cards.description}
              onClick={() => push(`${cards.key}`)}
              rightActions={this.isMaster() ? this.cardActions(cards) : []}
            />
          ))}
          <ListDivider />
        </List>
        {this.isMaster() && (
          <Button
            label="Add Action Card"
            icon="add"
            raised
            primary
            onClick={() => this.setState({ dialogActive: true })}
          />
        )}

        <Modal
          actions={this.actions}
          show={this.state.dialogActive}
          onClose={this.hideDialog}
          title="Add Action Card"
          component={
            <div>
              <p>Enter the name of the Action Card and select an icon.</p>
              <Input
                value={this.state.description}
                onChange={this.handleChange.bind(this, "description")}
                required={true}
                label="Description"
              />
              Select Icon
              <ImageList
                images={this.props.images}
                onClick={(value) => this.handleChange("icon", value)}
              />
            </div>
          }
        />
        {/* 
        <Dialog
          actions={this.actions}
          active={this.state.dialogActive}
          onEscKeyDown={this.hideDialog}
          onOverlayClick={this.hideDialog}
          title="Add Action Card"
        >
          <p>Enter the name of the Action Card and select an icon.</p>
          <Input
            value={this.state.description}
            onChange={this.handleChange.bind(this, "description")}
            required={true}
            label="Description"
          />
          Select Icon
          <div style={{ maxHeight: "400px", overflowY: "scroll" }}>
            <ImageList
              images={this.props.images}
              onClick={(value) => this.handleChange("icon", value)}
            />
          </div>
        </Dialog> */}
        <Snackbar
          label={this.state.snackLabel}
          type="accept"
          active={this.state.snackActive}
          timeout={2000}
          onTimeout={() => this.setState({ snackActive: false })}
        />
      </section>
    );
  }
}

const mapStateToProps = (state) => ({
  langId: langIdFromRoute(state),
  currentPathname: state.router.pathname,
  images: state.images.images,
});

const mapDispatchToProps = (dispatch) => ({
  push: (curr, loc) => {
    const newLoc = loc.startsWith("/") ? loc : `${curr}/${loc}`;
    dispatch({ type: PUSH, payload: newLoc });
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ActionCardsContainer);
