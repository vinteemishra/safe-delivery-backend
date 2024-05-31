"use strict";

import React from "react";
import Dialog from "react-toolbox/lib/dialog";
import Input from "react-toolbox/lib/input";
import LinkDestination from "./LinkDestination";

class NotificationDialog extends React.Component {
  constructor(props) {
    super(props);

    console.log("active", this.props.dialog);
    this.state = {
      active: props.active,
      shortDescription: "",
      longDescription: "",
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ active: nextProps.active });
  }

  saveNotification = () => {
    this.props.onSave(this.state);
  };

  hideDialog = () => {
    this.setState({ active: false, shortDescription: "", longDescription: "" });
    if (typeof this.props.onHide == "function") this.props.onHide();
  };

  handleChange(name, value) {
    console.log("change", name, value);
    this.setState({ ...this.state, [name]: value });
  }

  render() {
    const actions = [
      { label: "Cancel", onClick: this.hideDialog },
      { label: "Save", onClick: this.saveNotification },
    ];

    return (
      <Dialog
        actions={actions}
        active={this.state.active}
        onEscKeyDown={this.hideDialog}
        onOverlayClick={this.hideDialog}
        title="Add Notification"
      >
        <Input
          value={this.state.shortDescription}
          onChange={this.handleChange.bind(this, "shortDescription")}
          required={true}
          label="Description"
        />
        <Input
          value={this.state.longDescription}
          onChange={this.handleChange.bind(this, "longDescription")}
          required={true}
          label="Content"
        />
        <LinkDestination
          onChange={this.handleChange.bind(this, "link")}
          {...this.props}
        />
      </Dialog>
    );
  }
}

export default NotificationDialog;
