"use strict";

import React, { Component } from "react";
import { connect } from "react-redux";
import { Button } from "react-toolbox/lib/button";
import Checkbox from "react-toolbox/lib/checkbox";
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
import { Drugs } from "lib/sdaAPI";
import { genkey, langIdFromRoute } from "lib/util";

class DrugsContainer extends Component {
  state = {
    drugs: [],
    dialogActive: false,
    snackActive: false,
    snackLabel: "?",
    description: "",
    icon: "",
  };

  isMaster() {
    return this.props.langId === "";
  }

  handleDelete(drug) {
    if (
      confirm(
        `Deleting drug '${drug.description}' will delete all translations for this drug. Are you sure you want to proceed?`
      )
    ) {
      Drugs.del(drug.key).then((r) => {
        const ps = this.state.drugs.filter((p) => p.id !== drug.id);
        this.setState({ drugs: ps });
      });
    }
    return true;
  }

  handleToggleInclude(drug) {
    const drugs = [].concat(this.state.drugs);
    const d = drugs.find((dr) => dr.key == drug.key);
    d.included = !d.included;
    this.setState({ drugs });
    Drugs.post(d).then((m) => {
      this.setState({ drugs });
    });
  }

  handleChange(name, value) {
    this.setState({ ...this.state, [name]: value });
  }

  componentWillMount() {
    Drugs.all(this.props.langId, true).then((ds) => {
      console.log("got drugs", ds);
      if (ds.length) {
        this.setState({ drugs: ds });
      }
    });
  }

  hideDialog = () => {
    this.setState({ dialogActive: false });
  };

  drugActions(drug) {
    if (this.isMaster()) {
      return [
        <Button
          key={drug.key + "-deleteButton"}
          icon="delete"
          onClick={() => this.handleDelete(drug)}
        />,
      ];
    }
    return [
      // <div style={{height: "100%", cursor: "pointer"}} onClick={() => {this.handleToggleInclude(drug)}}>
      <div
        key={drug.key + "-checkbox"}
        style={{ height: "100%", cursor: "pointer" }}
        onClick={() => {}}
      >
        <Checkbox
          checked={drug.included || false}
          label="Include drug"
          onClick={() => {}}
          onChange={() => this.handleToggleInclude(drug)}
        />
      </div>,
    ];
  }

  saveDrug = () => {
    const desc = this.state.description;
    const drugKey = genkey(desc);
    const drug = { key: drugKey, langId: "", cards: [], description: desc };
    console.log("New drug", drug);
    Drugs.post(drug).then((m) => {
      this.setState({
        drugs: [...this.state.drugs, drug],
        snackLabel: `Drug '${drug.description}' added`,
        snackActive: true,
      });
    });
    this.hideDialog();
  };

  actions = [
    { label: "Cancel", onClick: this.hideDialog },
    { label: "Save", onClick: this.saveDrug },
  ];

  render() {
    const push = (l) => this.props.push(this.props.currentPathname, l);

    // const drugKeys = [];
    // return (
    //   <pre>{JSON.stringify(this.state.drugs, null, 2)}</pre>
    // );

    return (
      <section>
        {this.state.drugs.length == 0 && !this.isMaster() && (
          <p>Please create Drugs in master</p>
        )}

        <List selectable>
          <ListSubHeader caption="Drugs" />
          {this.state.drugs.map((drug) => {
            // if (drugKeys.indexOf(drug.key) === -1) {
            //   console.log("Not duplicate:", drug.key);
            //   drugKeys.push(drug.key);
            // } else {
            //   console.log("Duplicate", drug.key);
            // }
            return (
              <ListItem
                key={drug.key}
                caption={drug.description}
                onClick={() => push(`${drug.key}`)}
                rightActions={this.drugActions(drug)}
              />
            );
          })}
          <ListDivider />
        </List>
        {this.isMaster() && (
          <Button
            label="Add Drug"
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
          title="Add Drug"
        >
          <p>Enter the name of the Drug.</p>
          <Input
            value={this.state.description}
            onChange={this.handleChange.bind(this, "description")}
            required={true}
            label="Description"
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

export default connect(mapStateToProps, mapDispatchToProps)(DrugsContainer);
