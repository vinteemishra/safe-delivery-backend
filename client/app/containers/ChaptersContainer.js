"use strict";

import React, { Component } from "react";
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
import { genkey, langIdFromRoute, setWindowTitle } from "../lib/util";

export const withChapters = (api) =>
  class extends Component {
    constructor(props) {
      super(props);
      this.api = api;
    }

    state = {
      chapters: [],
      dialogActive: false,
      snackActive: false,
      snackLabel: "?",
      description: "",
      icon: "",
    };

    isMaster() {
      return this.props.langId === "";
    }

    handleDelete(chapter) {
      if (
        confirm(
          `Deleting Chapter '${chapter.description}' will delete all translations for this chapter. Are you sure you want to proceed?`
        )
      ) {
        const newChapters = this.state.chapters.filter(
          (c) => c.key !== chapter.key
        );
        this.updateDoc(newChapters);
      }
      return true;
    }

    handleChange(name, value) {
      this.setState({ ...this.state, [name]: value });
    }

    componentWillMount() {
      this.api.get(this.props.docKey, this.props.langId).then((docs) => {
        console.log("got doc", docs);
        if (docs.length) {
          const doc = docs[0];
          setWindowTitle(doc.description);
          this.setState({ doc: doc, chapters: doc.chapters });
        }
      });
    }

    hideDialog = () => {
      this.setState({ dialogActive: false });
    };

    chapterActions(chapter) {
      return [
        <Button
          key={chapter.key}
          icon="delete"
          onClick={() => this.handleDelete(chapter)}
        />,
      ];
    }

    saveChapter = () => {
      const desc = this.state.description;
      const chapterKey = genkey(desc);
      const chapter = {
        key: chapterKey,
        langId: "",
        cards: [],
        description: desc,
      };
      console.log("New chapter", chapter);
      this.updateDoc([...this.state.chapters, chapter]).then(() => {
        this.setState({
          snackLabel: `Chapter '${chapter.description}' added`,
          snackActive: true,
        });
      });
      this.hideDialog();
    };

    updateDoc(newChapters) {
      const newDoc = { ...this.state.doc, chapters: newChapters };

      return this.api.put(newDoc).then((doc) => {
        this.setState({ doc: doc, chapters: doc.chapters });
      });
    }
    actions = [
      { label: "Cancel", onClick: this.hideDialog },
      { label: "Save", onClick: this.saveChapter },
    ];

    chapterDescription(chapter) {
      if (chapter.description) {
        return chapter.description;
      }
      try {
        if (chapter.cards && chapter.cards.length > 0) {
          return chapter.cards[0].content.blocks[0].text;
        }
      } catch (e) {}
      return "Chapter";
    }

    render() {
      const push = (l) => this.props.push(this.props.currentPathname, l);

      return (
        <section>
          {this.state.chapters.length == 0 && !this.isMaster() && (
            <p>Please create Chapters in master</p>
          )}

          <List selectable>
            <ListSubHeader caption="Chapters" />
            {this.state.chapters.map((chapter) => {
              return (
                <ListItem
                  key={chapter.key}
                  caption={this.chapterDescription(chapter)}
                  onClick={() => push(`${chapter.key}`)}
                  rightActions={
                    this.isMaster() ? this.chapterActions(chapter) : []
                  }
                />
              );
            })}
            <ListDivider />
          </List>
          {this.isMaster() && (
            <Button
              label="Add Chapter"
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
            title="Add Chapter"
          >
            <p>Enter the name of the Chapter.</p>
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
  };

export const mapStateToProps = (state) => ({
  langId: langIdFromRoute(state),
  currentPathname: state.router.pathname,
  images: state.images.images,
  docKey: state.router.params.docKey,
});

export const mapDispatchToProps = (dispatch) => ({
  push: (curr, loc) => {
    const newLoc = loc.startsWith("/") ? loc : `${curr}/${loc}`;
    dispatch({ type: PUSH, payload: newLoc });
  },
});
