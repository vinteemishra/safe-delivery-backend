"use strict";

import React, { Component } from "react";
import { Button } from "react-toolbox/lib/button";
import { Card } from "react-toolbox/lib/card";
import Input from "react-toolbox/lib/input";
import Dialog from "react-toolbox/lib/dialog";
import Snackbar from "react-toolbox/lib/snackbar";
import { PUSH } from "redux-little-router";
import { List, ListItem, ListDivider } from "react-toolbox/lib/list";
import KeyLearningPointQuestionForm from "../components/KeyLearningPointQuestionForm";
import CasesQuestionForm from "../components/CasesQuestionForm";
import { genkey, langIdFromRoute, setWindowTitle } from "../lib/util";

export const withQuestions = (api, questionForm) =>
  class extends Component {
    constructor(props) {
      super(props);
      this.api = api;
      this.questionForm = questionForm;
    }

    state = {
      questions: [],
      editQuestion: {},
      dialogActive: false,
      snackActive: false,
      snackLabel: "?",
      description: "",
      title: "",
      parent: {},
    };

    isMaster() {
      return this.props.langId === "";
    }

    handleDelete(question) {
      if (
        confirm(
          `Deleting Question '${question.quizzText}' will delete all translations. Are you sure you want to proceed?`
        )
      ) {
        const newQuestions = this.state.questions.filter(
          (q) => q.key !== question.key
        );
        this.updateParent(newQuestions);
      }
      return true;
    }

    handleChange(name, value) {
      // console.log("change", arguments)
      this.setState({ ...this.state, [name]: value });
    }

    handleEdit(q) {
      this.setState({ editQuestion: q, dialogActive: true });
      return true;
    }

    componentWillMount() {
      this.api.get(this.props.parentKey, this.props.langId).then((ps) => {
        console.log("got parent", ps);
        if (ps.length) {
          const p = ps[0];
          setWindowTitle(p.description);
          this.setState({
            parent: p,
            questions: p.questions,
            description: p.description,
          });
        }
      });
    }

    hideDialog = () => {
      this.setState({ dialogActive: false });
    };

    questionActions(question) {
      return [
        <Button
          key={question.key}
          icon="edit"
          onClick={() => this.handleEdit(question)}
        />,
        <Button
          key={question.key}
          icon="delete"
          onClick={() => this.handleDelete(question)}
        />,
      ];
    }

    saveQuestion = () => {
      const questionKey = this.state.editQuestion.key;
      const question = {
        ...this.state.editQuestion,
        key: questionKey || genkey(this.state.editQuestion.question.content),
      };
      console.log("New question", question);

      const qs = [...this.state.questions];
      const index = qs.findIndex((k) => k.key === question.key);
      if (index >= 0) qs[index] = question;
      else qs.push(question);

      this.updateParent(qs).then(() => {
        this.setState({
          snackLabel: `Question '${question.question.content}' saved`,
          snackActive: true,
        });
      });
      this.hideDialog();
    };

    updateParent(newQuestions) {
      const newParent = { ...this.state.parent, questions: newQuestions };

      return this.api.put(newParent).then((p) => {
        this.setState({ parent: p, questions: p.questions });
      });
    }

    updateDescription() {
      const newParent = {
        ...this.state.parent,
        description: this.state.description,
      };

      return this.api.put(newParent).then((p) => {
        this.setState({ snackLabel: `Description saved`, snackActive: true });
      });
    }

    actions = [
      { label: "Cancel", onClick: this.hideDialog },
      { label: "Save", onClick: this.saveQuestion },
    ];

    renderEditDescription() {
      if (this.isMaster() || this.questionForm !== "CasesQuestionForm") {
        return <p>{this.state.parent.description}</p>;
      }

      return (
        <Card style={{ width: "100%", padding: 15, background: "#f0f0f0" }}>
          <h4>Case description</h4>
          <table style={{ width: "100%" }}>
            <thead>
              <tr>
                <td>
                  <h5>Master</h5>
                </td>
                <td>
                  <h5>Translation</h5>
                </td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Input
                    value={this.state.parent.masterDescription}
                    style={{ background: "#fff" }}
                    rows={3}
                    multiline
                    type="text"
                    disabled
                  />
                </td>
                <td>
                  <Input
                    value={this.state.description}
                    style={{ background: "#fff" }}
                    onChange={this.handleChange.bind(this, "description")}
                    rows={3}
                    multiline
                    type="text"
                  />
                </td>
              </tr>
              <tr>
                <td colSpan="2">
                  <Button
                    label="Save description"
                    raised
                    primary
                    onClick={this.updateDescription.bind(this)}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </Card>
      );
    }

    render() {
      const push = (l) => this.props.push(this.props.currentPathname, l);

      const QuestionForms = {
        CasesQuestionForm: CasesQuestionForm,
        KeyLearningPointQuestionForm: KeyLearningPointQuestionForm,
      };

      const QuestionForm = QuestionForms[this.questionForm];

      return (
        <section>
          {this.state.questions.length === 0 && !this.isMaster() && (
            <p>Please create Questions in master</p>
          )}

          {this.renderEditDescription()}

          <br />
          <List selectable>
            <h4>Questions</h4>
            {/* <ListSubHeader caption='Questions' /> */}
            {this.state.questions.map((q) => (
              <ListItem
                key={q.key}
                avatar={this.props.images.get(q.icon)}
                caption={q.question.content}
                onClick={() => (this.isMaster() ? {} : push(`${q.key}`))}
                rightActions={this.isMaster() ? this.questionActions(q) : []}
              />
            ))}
            <ListDivider />
          </List>
          {this.isMaster() && (
            <Button
              label="Add Question"
              icon="add"
              raised
              primary
              onClick={() =>
                this.setState({ editQuestion: undefined, dialogActive: true })
              }
            />
          )}

          <Dialog
            actions={this.actions}
            active={this.state.dialogActive}
            onEscKeyDown={this.hideDialog}
            onOverlayClick={this.hideDialog}
            title={`${this.state.editQuestion ? "Edit" : "Add"} Question`}
          >
            <QuestionForm
              value={this.state.editQuestion}
              onChange={this.handleChange.bind(this, "editQuestion")}
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
  };

export const mapStateToProps = (state) => ({
  langId: langIdFromRoute(state),
  currentPathname: state.router.pathname,
  images: state.images.images,
  parentKey: state.router.params.parentKey,
});

export const mapDispatchToProps = (dispatch) => ({
  push: (curr, loc) => {
    const newLoc = loc.startsWith("/") ? loc : `${curr}/${loc}`;
    dispatch({ type: PUSH, payload: newLoc });
  },
});
