"use strict";

import React, { Component } from "react";
import { connect } from "react-redux";
import { Button } from "react-toolbox/lib/button";
import Dialog from "react-toolbox/lib/dialog";
import Input from "react-toolbox/lib/input";
import Snackbar from "react-toolbox/lib/snackbar";
import Dropdown from "react-toolbox/lib/dropdown";
import { PUSH, REPLACE } from "redux-little-router";
import LoadingProgressBar from "../components/LoadingProgressBar";
import { Tab, Tabs } from "react-toolbox";
import {
  List,
  ListItem,
  ListSubHeader,
  ListDivider,
} from "react-toolbox/lib/list";
import { KeyLearningPoints, Modules } from "lib/sdaAPI";
import { genkey, langIdFromRoute } from "lib/util";

class KeyLearningPointsContainer extends Component {
  state = {
    keyLearningPoints: [],
    dialogActive: false,
    snackActive: false,
    snackLabel: "?",
    comment: "",
    index: 0,
    level: 1,
    description: "",
    module: "",
    modules: [],
    sortOrder: 0,
  };

  isMaster() {
    return this.props.langId === "";
  }

  handleDelete(klp) {
    if (
      confirm(
        `Deleting Key Learning Point '${klp.description}' will delete all questions and translations. Are you sure you want to proceed?`
      )
    ) {
      KeyLearningPoints.del(klp.key).then((r) => {
        const klps = this.state.keyLearningPoints.filter(
          (c) => c.id !== klp.id
        );
        this.setState({ keyLearningPoints: klps });
      });
    }
    return true;
  }

  handleEdit(klp) {
    console.log("edit ", klp);
    let sortOrder = klp.sortOrder || 0;
    this.setState({
      editKLP: klp,
      dialogActive: true,
      module: klp.module,
      description: klp.description,
      comment: klp.comment,
      level: klp.level,
      sortOrder,
    });
    return true;
  }

  handleChange(name, value) {
    this.setState({ ...this.state, [name]: value });
  }

  componentDidMount() {
    if (
      this.props.currentPathname &&
      this.props.currentHash &&
      this.props.currentHash.startsWith("#")
    ) {
      let res = this.props.currentHash.replace("#", "");
      res = res.split("-");
      const index = Number(res[0]);
      this.setState({ index: index });
      this.props.switchTab(this.props.currentPathname, "#" + index);
      if (res[1] && typeof res[1] === "string") {
        this.checkLoad(Number(res[1]));
      }
    }
  }

  checkLoad(scrollPosition) {
    if (
      this.state.keyLearningPoints.length > 0 &&
      this.state.modules.length > 0
    ) {
      window.scrollTo({ top: scrollPosition });
    } else {
      window.setTimeout(this.checkLoad.bind(this, scrollPosition), 100);
    }
  }

  componentWillMount() {
    KeyLearningPoints.all(this.props.langId).then((ps) => {
      console.log("got klps", ps);
      if (ps.length) {
        this.setState({ keyLearningPoints: ps });
      }
    });
    Modules.all(this.props.langId).then((ms) => {
      console.log("got mods", ms);
      if (ms.length) {
        this.setState({ modules: ms });
      }
    });
  }

  hideDialog = () => {
    this.setState({ dialogActive: false });
  };

  klpActions(klp) {
    return [
      <Button key={klp.key} icon="edit" onClick={() => this.handleEdit(klp)} />,
      <Button
        key={klp.key}
        icon="delete"
        onClick={() => this.handleDelete(klp)}
      />,
    ];
  }

  saveKLP = () => {
    const description = this.state.description;
    const baseKLP = this.state.editKLP || {
      langId: "",
      key: genkey(description),
      questions: [],
    };
    const klp = {
      ...baseKLP,
      module: this.state.module,
      description: description,
      comment: this.state.comment,
      level: this.state.level,
      sortOrder: this.state.sortOrder,
    };

    const method = this.state.editKLP
      ? KeyLearningPoints.put
      : KeyLearningPoints.post;
    method(klp).then((m) => {
      const klps = [...this.state.keyLearningPoints];
      const index = klps.findIndex((k) => k.key === klp.key);
      if (index >= 0) klps[index] = m;
      else klps.push(m);
      this.setState({
        keyLearningPoints: klps,
        snackLabel: `Key Learning Point '${klp.description}' saved`,
        snackActive: true,
      });
    });
    this.hideDialog();
  };

  actions = [
    { label: "Cancel", onClick: this.hideDialog },
    { label: "Save", onClick: this.saveKLP },
  ];

  levels = [
    { value: "1", label: "Level 1" },
    { value: "2", label: "Level 2" },
    { value: "3", label: "Level 3" },
  ];

  renderKLPs(module) {
    const moduleKLPs = this.state.keyLearningPoints.filter(
      (klp) => klp.module === module
    );
    moduleKLPs.sort((a, b) => (a.sortOrder || 1e20) - (b.sortOrder || 1e20));
    const push = (l) => this.props.push(this.props.currentPathname, l);
    const getKlpPosition = (l) =>
      this.props.getKlpPosition(
        this.props.currentPathname,
        this.props.currentHash,
        l
      );

    return (
      <List selectable>
        <ListSubHeader caption="Key Learning Points" />
        {moduleKLPs.map((klp) => (
          <ListItem
            key={klp.key}
            ref={klp.key}
            avatar={this.props.images.get(klp.icon)}
            caption={klp.description}
            onClick={(event) => {
              getKlpPosition(document.documentElement.scrollTop.toString());
              push(`${klp.key}`);
            }}
            rightActions={this.isMaster() ? this.klpActions(klp) : []}
          />
        ))}
        <ListDivider />
      </List>
    );
  }

  render() {
    const switchTab = (l) =>
      this.props.switchTab(this.props.currentPathname, l);
    const mods = this.state.modules.map((m) => ({
      value: m.key,
      label: m.description,
    }));

    return (
      <LoadingProgressBar
        isLoaded={this.state.keyLearningPoints.length > 0 && mods.length > 0}
      >
        {this.state.keyLearningPoints.length === 0 && !this.isMaster() && (
          <p>Please create Key Learning Points in master</p>
        )}
        <Tabs
          index={this.state.index}
          onChange={(index) => {
            switchTab(index.toString());
            this.setState({ index: index });
          }}
        >
          {mods.map((m) => (
            <Tab key={m.value} label={m.label}>
              {this.renderKLPs(m.value)}
            </Tab>
          ))}
        </Tabs>

        {this.isMaster() && (
          <Button
            label="Add Key Learning Point "
            icon="add"
            raised
            primary
            onClick={() =>
              this.setState({ editKLP: undefined, dialogActive: true })
            }
          />
        )}

        <Dialog
          actions={this.actions}
          active={this.state.dialogActive}
          onEscKeyDown={this.hideDialog}
          onOverlayClick={this.hideDialog}
          description="Add Key Learning Point"
        >
          <Dropdown
            value={this.state.module}
            auto
            onChange={this.handleChange.bind(this, "module")}
            source={mods}
            required={true}
            label="Module"
          />
          <Input
            value={this.state.description}
            onChange={this.handleChange.bind(this, "description")}
            required={true}
            label="Description"
          />
          <Dropdown
            value={this.state.level}
            auto
            onChange={this.handleChange.bind(this, "level")}
            source={this.levels}
            required={true}
            label="Level"
          />
          <Input
            value={this.state.sortOrder}
            onChange={this.handleChange.bind(this, "sortOrder")}
            required={true}
            label="Sort order"
          />
          <Input
            value={this.state.comment}
            multiline={true}
            rows={5}
            onChange={this.handleChange.bind(this, "comment")}
            required={true}
            label="Comment"
          />
        </Dialog>
        <Snackbar
          label={this.state.snackLabel}
          type="accept"
          active={this.state.snackActive}
          timeout={2000}
          onTimeout={() => this.setState({ snackActive: false })}
        />
      </LoadingProgressBar>
    );
  }
}

const mapStateToProps = (state) => ({
  langId: langIdFromRoute(state),
  currentPathname: state.router.pathname,
  currentHash: window.location.hash,
  images: state.images.images,
});

const mapDispatchToProps = (dispatch) => ({
  push: (curr, loc) => {
    const newLoc = loc.startsWith("/") ? loc : `${curr}/${loc}`;
    dispatch({ type: PUSH, payload: newLoc });
  },
  switchTab: (curr, loc) => {
    const newLoc = loc.startsWith("#") ? curr + loc : `${curr}#${loc}`;
    dispatch({ type: REPLACE, payload: newLoc });
  },
  getKlpPosition: (curr, curr_hash, new_hash) => {
    const newLoc = curr_hash.startsWith("#")
      ? curr + curr_hash + "-" + new_hash
      : `${curr}#${curr_hash}-${new_hash}`;
    dispatch({ type: REPLACE, payload: newLoc });
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(KeyLearningPointsContainer);
