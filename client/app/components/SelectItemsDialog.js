"use strict";
import React from "react";
import Dialog from "react-toolbox/lib/dialog";
import { Input } from "react-toolbox/lib/input";
import DragSelectComponent from "../components/VideoSorter/DragSelectComponent";

class SelectItemsDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      filter: "",
      dialogActive: props.dialogActive,
      selectedKeys: props.selectedKeys || [],
    };

    this.updateFilter = this.updateFilter.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.dialogActive) {
      this.setState({ dialogActive: nextProps.dialogActive });
    }
    if (nextProps.selectedKeys) {
      this.setState({ selectedKeys: nextProps.selectedKeys });
    }
  }

  updateFilter(val) {
    this.setState({ filter: val });
  }

  save = () => {
    if (typeof this.props.onSave == "function")
      this.props.onSave(this.state.selectedKeys);
    this.hideDialog();
  };

  hideDialog = () => {
    this.setState({ dialogActive: false });
    if (typeof this.props.onHide == "function") this.props.onHide();
  };

  handleChange(vs) {
    const value = vs.cards.map((v) => v.id);
    this.setState({ selectedKeys: value });
  }

  actions = [
    { label: "Cancel", onClick: this.hideDialog },
    { label: "Save", onClick: this.save },
  ];

  render() {
    const availableMap = new Map(this.props.available.map((v) => [v.key, v]));

    const s = new Set(this.props.selectedKeys);
    const selected = this.props.selectedKeys
      .map((key) => availableMap.get(key))
      .filter((v) => !!v);
    const nonSelected = this.props.available.filter((v) => !s.has(v.key));
    const filterText = this.state.filter;

    return (
      <Dialog
        actions={this.actions}
        active={this.state.dialogActive}
        onEscKeyDown={this.hideDialog}
        onOverlayClick={this.hideDialog}
        title={this.props.title}
      >
        <Input
          value={this.state.filter}
          onChange={this.updateFilter}
          label="Filter list"
        />
        <DragSelectComponent
          available={nonSelected}
          selected={selected}
          onChange={(v) => this.handleChange(v)}
          filter={filterText}
        />
      </Dialog>
    );
  }
}

export default SelectItemsDialog;
