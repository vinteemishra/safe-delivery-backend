"use strict";

import React, { Component } from "react";
import { connect } from "react-redux";
import { Button } from "react-toolbox/lib/button";
import Dialog from "react-toolbox/lib/dialog";
import Input from "react-toolbox/lib/input";
import Snackbar from "react-toolbox/lib/snackbar";
import { PUSH } from "redux-little-router";
import {
  List,
  ListItem,
  ListSubHeader,
  ListDivider,
} from "react-toolbox/lib/list";
import { Onboarding } from "lib/sdaAPI";
import { genkey, langIdFromRoute } from "lib/util";

class OnboardingContainer extends Component {
  constructor(props) {
    super(props);

    this.handleAnswerChange = this.handleAnswerChange.bind(this);
    this.deleteAnswer = this.deleteAnswer.bind(this);

    this.state = {
      onboradingSreens: [],
      dialogActive: false,
      snackActive: false,
      snackLabel: "?",
      description: "",
      content: "",
      image: "",
      icon: "",
      question: "",
      linkTextPre: "",
      linkText: "",
      linkTextPost: "",
      linkURL: "",
      answers: [],
      comment: "",
    };
  }

  isMaster() {
    return this.props.langId === "";
  }

  handleDelete(onboradingSreen) {
    if (
      confirm(
        `Deleting onborading screen '${onboradingSreen.description.content}' will delete all translations for this onboarding screen. Are you sure you want to proceed?`
      )
    ) {
      Onboarding.del(onboradingSreen.key).then((r) => {
        const ps = this.state.onboradingSreens.filter(
          (p) => p.id !== onboradingSreen.id
        );
        this.setState({ onboradingSreens: ps });
      });
    }
    return true;
  }

  handleChange(name, value) {
    this.setState({ ...this.state, [name]: value });
  }

  componentWillMount() {
    Onboarding.all(this.props.langId, true).then((obs) => {
      if (obs.length) {
        this.setState({
          onboradingSreens: obs,
          answers: obs.answers || this.state.answers.concat([{ content: "" }]),
        });
      }
    });
  }

  hideDialog = () => {
    this.setState({ answers: [], dialogActive: false });
  };

  screenActions(screen) {
    if (this.isMaster()) {
      return [
        <Button
          key={screen.key + "-deleteButton"}
          icon="delete"
          onClick={() => this.handleDelete(screen)}
        />,
      ];
    }
    return [];
  }

  saveScreen = () => {
    if (this.state.description.length === 0) {
      window.alert(
        "You need to fill out the Description box, before you can save the new screen!"
      );
      return;
    }

    const desc = this.state.description;
    const question = this.state.question;
    const answers = this.state.answers;
    const image = this.state.image;
    const icon = this.state.icon;
    const comment = this.state.comment;

    const screenKey = genkey(desc);

    const screen = {
      key: screenKey,
      langId: "",
      image: image,
      icon: icon,
      description: { content: desc },
      comment: comment,
      question: { content: question },
      answers: answers,
    };
    console.log("New onboarding screen", screen);
    Onboarding.post(screen).then((m) => {
      this.setState({
        onboradingSreens: [...this.state.onboradingSreens, screen],
        snackLabel: `Screen '${screen.description.content}' added`,
        snackActive: true,
      });
    });
    this.setState({ description: "" });
    this.hideDialog();
  };

  actions = [
    { label: "Cancel", onClick: this.hideDialog },
    { label: "Save", onClick: this.saveScreen },
  ];

  deleteAnswer() {
    this.setState({
      answer: this.state.answers.splice(this.state.answers.length - 1, 1),
    });
  }

  addAnswer() {
    this.setState({
      answers: this.state.answers.concat([{ content: "" }]),
    });
  }

  handleAnswerChange(index, value, from) {
    const answers = [...this.state.answers];

    if (from === "content") {
      answers[index].content = value;
      return this.setState({ answers });
    }
  }

  renderAnswerForm() {
    return this.state.answers.map((answer, index) => {
      return (
        <div key={index}>
          <tr>
            <td style={{ width: "20%" }}>Answer</td>
            <td>
              <Input
                type="text"
                label={"Answer"}
                disabled={this.props.langId !== ""}
                onChange={(value) =>
                  this.handleAnswerChange(index, value, "content")
                }
              />
            </td>
            <td>
              {this.isMaster() && this.state.answers.length - 1 === index && (
                <Button icon="delete" onClick={() => this.deleteAnswer()} />
              )}
            </td>
          </tr>
        </div>
      );
    });
  }

  render() {
    const push = (l) => this.props.push(this.props.currentPathname, l);

    return (
      <section>
        {this.state.onboradingSreens.length == 0 && !this.isMaster() && (
          <p>Please create Onboarding sceens in master</p>
        )}
        <List selectable>
          <ListSubHeader caption="Screens" />
          {this.state.onboradingSreens.map((screen) => {
            return (
              <ListItem
                key={screen.key}
                caption={screen.description.content}
                // caption={screen.description}
                onClick={() => push(`${screen.key}`)}
                rightActions={this.screenActions(screen)}
              />
            );
          })}
          <ListDivider />
        </List>
        {this.isMaster() && (
          <Button
            label="Add Screen"
            icon="add"
            raised
            primary
            onClick={() => this.setState({ dialogActive: true })}
          />
        )}
        <Dialog
          actions={this.actions}
          active={this.state.dialogActive}
          onEscKeyDown={this.hideDialog}
          onOverlayClick={this.hideDialog}
          title="Add Onboarding Screen"
        >
          <p>Enter the name of the Onboarding Screen</p>
          <Input
            onChange={this.handleChange.bind(this, "description")}
            required={true}
            label="Name of screen"
          />
          <p>Enter the value of the question</p>
          <Input
            onChange={this.handleChange.bind(this, "question")}
            required={false}
            label="Question"
          />
          {this.renderAnswerForm()}
          <Button
            icon="add"
            label="Add answer"
            onClick={this.addAnswer.bind(this)}
          />
        </Dialog>
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
)(OnboardingContainer);
