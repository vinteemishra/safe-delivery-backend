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
import { Procedures } from "lib/sdaAPI";
import { genkey, langIdFromRoute } from "lib/util";
import ImageList from "../components/ImageList/index";
import Modal from "../components/Modal";

class ProceduresContainer extends Component {
  state = {
    procedures: [],
    dialogActive: false,
    snackActive: false,
    snackLabel: "?",
    description: "",
    icon: "",
  };

  isMaster() {
    return this.props.langId === "";
  }

  handleDelete(procedure) {
    if (
      confirm(
        `Deleting procedure '${procedure.description}' will delete all translations for this procedure. Are you sure you want to proceed?`
      )
    ) {
      Procedures.del(procedure.key).then((r) => {
        const ps = this.state.procedures.filter((p) => p.id !== procedure.id);
        this.setState({ procedures: ps });
      });
    }
    return true;
  }

  handleChange(name, value) {
    this.setState({ ...this.state, [name]: value });
  }

  componentWillMount() {
    Procedures.all(this.props.langId).then((ps) => {
      console.log("got ps", ps);
      if (ps.length) {
        this.setState({ procedures: ps });
      }
    });
  }

  hideDialog = () => {
    this.setState({ dialogActive: false });
  };

  procedureActions(procedure) {
    return [
      <Button
        key={procedure.key}
        icon="delete"
        onClick={() => this.handleDelete(procedure)}
      />,
    ];
  }

  saveProcedure = () => {
    const desc = this.state.description;
    const procedureKey = genkey(desc);
    const procedure = {
      key: procedureKey,
      langId: "",
      cards: [],
      description: desc,
      icon: this.state.icon,
    };
    console.log("New procedure", procedure);
    Procedures.post(procedure).then((m) => {
      this.setState({
        procedures: [...this.state.procedures, procedure],
        snackLabel: `Practical Procedure '${procedure.description}' added`,
        snackActive: true,
      });
    });
    this.hideDialog();
  };

  actions = [
    { label: "Cancel", onClick: this.hideDialog },
    { label: "Save", onClick: this.saveProcedure },
  ];

  render() {
    const push = (l) => this.props.push(this.props.currentPathname, l);

    return (
      <section>
        {this.state.procedures.length == 0 && !this.isMaster() && (
          <p>Please create Practical Procedures in master</p>
        )}

        <List selectable>
          <ListSubHeader caption="Practical Procedures" />
          {this.state.procedures.map((procedure) => (
            <ListItem
              key={procedure.key}
              avatar={this.props.images.get(procedure.icon)}
              caption={procedure.description}
              onClick={() => push(`${procedure.key}`)}
              rightActions={
                this.isMaster() ? this.procedureActions(procedure) : []
              }
            />
          ))}
          <ListDivider />
        </List>
        {this.isMaster() && (
          <Button
            label="Add Procedure"
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
          title="Add Practical Procedure"
          component={
            <div>
              <p>
                Enter the name of the Practical Procedure and select an icon.
              </p>
              <Input
                value={this.state.description}
                onChange={this.handleChange.bind(this, "description")}
                required={true}
                label="Description"
              />
              Select Icon
              <div style={{ maxHeight: "600px" }}>
                <ImageList
                  images={this.props.images}
                  onClick={(value) => this.handleChange("icon", value)}
                />
              </div>
            </div>
          }
        />
        {/* <Dialog
          actions={this.actions}
          active={this.state.dialogActive}
          onEscKeyDown={this.hideDialog}
          onOverlayClick={this.hideDialog}
          title="Add Practical Procedure"
        >
          <p>Enter the name of the Practical Procedure and select an icon.</p>
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
)(ProceduresContainer);
