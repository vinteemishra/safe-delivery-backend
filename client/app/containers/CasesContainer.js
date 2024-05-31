"use strict";

import React, { Component } from "react";
import { connect } from "react-redux";
import { Button } from "react-toolbox/lib/button";
import Dialog from "react-toolbox/lib/dialog";
import Input from "react-toolbox/lib/input";
import Snackbar from "react-toolbox/lib/snackbar";
import Dropdown from "react-toolbox/lib/dropdown";
import { PUSH } from "redux-little-router";
import { List, ListItem, ListDivider } from "react-toolbox/lib/list";
import { Cases } from "lib/sdaAPI";
import { genkey, langIdFromRoute } from "lib/util";

class CasesContainer extends Component {
  state = {
    cases: [],
    dialogActive: false,
    snackActive: false,
    snackLabel: "?",
    comment: "",
    description: "",
    image: "",
    sortOrder: 0,
  };

  isMaster() {
    return this.props.langId === "";
  }

  handleDelete(caze) {
    if (
      confirm(
        `Deleting Case '${caze.description}' will delete all questions and translations. Are you sure you want to proceed?`
      )
    ) {
      Cases.del(caze.key).then((r) => {
        const cases = this.state.cases.filter((c) => c.id !== caze.id);
        this.setState({ cases: cases });
      });
    }
    return true;
  }

  handleEdit(caze) {
    let sortOrder = caze.sortOrder || 0;
    this.setState({
      editCase: caze,
      dialogActive: true,
      description: caze.description,
      comment: caze.comment,
      image: caze.image,
      sortOrder,
    });
    return true;
  }

  handleChange(name, value) {
    this.setState({ ...this.state, [name]: value });
  }

  componentWillMount() {
    Cases.all(this.props.langId).then((cs) => {
      if (cs.length) {
        this.setState({ cases: cs });
      }
    });
  }

  hideDialog = () => {
    this.setState({ dialogActive: false });
  };

  caseActions(caze) {
    return [
      <Button
        key={caze.key}
        icon="edit"
        onClick={() => this.handleEdit(caze)}
      />,
      <Button
        key={caze.key}
        icon="delete"
        onClick={() => this.handleDelete(caze)}
      />,
    ];
  }

  saveCase = () => {
    const description = this.state.description;
    const baseCase = this.state.editCase || {
      langId: "",
      key: genkey(description),
      questions: [],
    };
    const caze = {
      ...baseCase,
      description: description,
      comment: this.state.comment,
      image: this.state.image,
      sortOrder: this.state.sortOrder,
    };
    Cases.post(caze).then((m) => {
      const cases = [...this.state.cases];
      const index = cases.findIndex((k) => k.key === caze.key);
      if (index >= 0) cases[index] = m;
      else cases.push(m);
      this.setState({
        cases: cases,
        snackLabel: `Case '${caze.comment}' saved`,
        snackActive: true,
      });
    });
    this.hideDialog();
  };

  actions = [
    { label: "Cancel", onClick: this.hideDialog },
    { label: "Save", onClick: this.saveCase },
  ];

  render() {
    const push = (l) => this.props.push(this.props.currentPathname, l);
    const imageList = Array.from(this.props.images.keys()).map((key) => ({
      value: key,
      label: key,
    }));

    const cases = this.state.cases.sort(
      (a, b) => (a.sortOrder || 1e20) - (b.sortOrder || 1e20)
    );

    return (
      <section style={{ clear: "both" }}>
        <h4>Cases</h4>
        {this.state.cases.length == 0 && !this.isMaster() && (
          <p>Please create Cases in master</p>
        )}
        <List selectable>
          {cases.map((caze) => (
            <ListItem
              key={caze.key}
              avatar={this.props.images.get(caze.icon)}
              caption={caze.comment}
              onClick={() => push(`${caze.key}`)}
              rightActions={this.isMaster() ? this.caseActions(caze) : []}
            />
          ))}
          <ListDivider />
        </List>
        {this.isMaster() && (
          <Button
            label="Add Case"
            icon="add"
            raised
            primary
            onClick={() =>
              this.setState({ editCase: undefined, dialogActive: true })
            }
          />
        )}

        <Dialog
          actions={this.actions}
          active={this.state.dialogActive}
          onEscKeyDown={this.hideDialog}
          onOverlayClick={this.hideDialog}
          title={`${this.state.editCase ? "Edit" : "Add"} Case`}
        >
          <Input
            value={this.state.comment}
            onChange={this.handleChange.bind(this, "comment")}
            required={true}
            label="CMS name"
          />
          <Input
            value={this.state.description}
            multiline={true}
            rows={6}
            onChange={this.handleChange.bind(this, "description")}
            required={true}
            label="Description"
          />
          <Dropdown
            value={this.state.image}
            auto
            onChange={this.handleChange.bind(this, "image")}
            source={imageList}
            required={true}
            label="Image"
          />
          <Input
            value={this.state.sortOrder}
            onChange={this.handleChange.bind(this, "sortOrder")}
            required={true}
            label="Sort order"
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

export default connect(mapStateToProps, mapDispatchToProps)(CasesContainer);
