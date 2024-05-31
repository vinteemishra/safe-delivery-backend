"use strict";

import React, { Component } from "react";
import { connect } from "react-redux";
import { Button } from "react-toolbox/lib/button";
import Snackbar from "react-toolbox/lib/snackbar";
import { PUSH } from "redux-little-router";
import NotificationsDialog from "../components/NotificationDialog";
import {
  List,
  ListItem,
  ListSubHeader,
  ListDivider,
} from "react-toolbox/lib/list";
import { ActionCards, Notifications, Procedures, Drugs } from "lib/sdaAPI";
import { genkey, langIdFromRoute } from "lib/util";

class NotificationsContainer extends Component {
  state = {
    notifications: [],
    dialogActive: false,
    snackActive: false,
    snackLabel: "?",
    procedures: [],
    drugs: [],
    actionCards: [],
  };

  isMaster() {
    return this.props.langId === "";
  }

  handleDelete(notification) {
    if (
      confirm(
        `Deleting notification '${notification.content.shortDescription}' will delete all translations for this notification. Are you sure you want to proceed?`
      )
    ) {
      Notifications.del(notification.key).then((r) => {
        const ps = this.state.notifications.filter(
          (p) => p.id !== notification.id
        );
        this.setState({ notifications: ps });
      });
    }
    return true;
  }

  componentWillMount() {
    Notifications.all(this.props.langId).then((ds) => {
      console.log("got notifications", ds);
      if (ds.length) {
        this.setState({ notifications: ds });
      }
    });
    Procedures.all(this.props.langId).then((ps) => {
      console.log("got procs", ps);
      this.setState({ procedures: ps });
    });

    Drugs.all(this.props.langId).then((ds) => {
      console.log("got drugs", ds);
      this.setState({ drugs: ds });
    });

    ActionCards.all(this.props.langId).then((cards) => {
      console.log("got actionCards", cards);
      this.setState({ actionCards: cards });
    });
  }

  notificationActions(notification) {
    return [
      <Button
        key={notification.key}
        icon="delete"
        onClick={() => this.handleDelete(notification)}
      />,
    ];
  }

  saveNotification = (n) => {
    const desc = n.shortDescription;
    const notificationKey = genkey(desc);
    const content = {
      shortDescription: desc,
      longDescription: n.longDescription,
    };
    const notification = {
      key: notificationKey,
      langId: "",
      content: content,
      adapted: content,
      translated: content,
      link: n.link,
    };
    console.log("New notification", notification);
    Notifications.post(notification).then((m) => {
      this.setState({
        dialogActive: false,
        notifications: [...this.state.notifications, notification],
        snackLabel: `Notification '${desc}' added`,
        snackActive: true,
      });
    });
  };

  render() {
    const push = (l) => this.props.push(this.props.currentPathname, l);
    const videoKeys = Array.from(this.props.videos.keys());
    const noPrefix = videoKeys.map(
      (k) => "/" + k.split("/").splice(2).join("/")
    );
    const uniqueVideos = new Set(noPrefix);
    const availableVideos = [...uniqueVideos]
      .sort()
      .map((v) => ({ value: v, label: v }));
    const description = (n) =>
      (n.content.shortDescription || "").trim() !== ""
        ? n.content.shortDescription
        : (n.content.longDescription || "").substring(0, 150);
    return (
      <section>
        {this.state.notifications.length == 0 && !this.isMaster() && (
          <p>Please create Notifications in master</p>
        )}

        <List selectable>
          <ListSubHeader caption="Notifications" />
          {this.state.notifications.map((n) => (
            <ListItem
              key={n.key}
              caption={description(n)}
              onClick={() => push(`${n.key}`)}
              rightActions={this.isMaster() ? this.notificationActions(n) : []}
            />
          ))}
          <ListDivider />
        </List>
        {this.isMaster() && (
          <Button
            label="Add Notification"
            icon="add"
            raised
            primary
            onClick={() => this.setState({ dialogActive: true })}
          />
        )}

        <NotificationsDialog
          active={this.state.dialogActive}
          onSave={this.saveNotification}
          onHide={() => this.setState({ dialogActive: false })}
          availableVideos={availableVideos}
          availableDrugs={this.state.drugs.map((d) => ({
            value: d.key,
            label: d.description,
          }))}
          availableActionCards={this.state.actionCards.map((d) => ({
            value: d.key,
            label: d.description,
          }))}
          availableProcedures={this.state.procedures.map((d) => ({
            value: d.key,
            label: d.description,
          }))}
        />
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
  videos: state.videos.videos,
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
)(NotificationsContainer);
