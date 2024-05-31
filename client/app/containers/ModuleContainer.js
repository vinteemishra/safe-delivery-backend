"use strict";

import React, { Component } from "react";
import { Card, CardTitle, CardActions } from "react-toolbox/lib/card";
import { connect } from "react-redux";
import { Button } from "react-toolbox/lib/button";
import Snackbar from "react-toolbox/lib/snackbar";
import ProgressBar from "react-toolbox/lib/progress_bar";
import { PUSH } from "redux-little-router";
import SelectItemsDialog from "../components/SelectItemsDialog";
import {
  ActionCards,
  Modules,
  Procedures,
  Drugs,
  KeyLearningPoints,
} from "lib/sdaAPI";
import { langIdFromRoute } from "lib/util";
import { setWindowTitle } from "../lib/util";

const EditCard = ({ title, subtitle, onClick }) => (
  <div style={{ display: "inline-block" }}>
    <Card style={{ width: "350px" }}>
      <CardTitle title={title} subtitle={subtitle} />
      <CardActions>
        <Button icon="ic_edit" label="Edit" onClick={onClick} />
      </CardActions>
    </Card>
  </div>
);

class ModuleContainer extends Component {
  state = {
    videoDialogActive: false,
    actionCardsDialogActive: false,
    procedureDialogActive: false,
    drugsDialogActive: false,
    keyLearningPointsDialogActive: false,
    snackActive: false,
    snackLabel: "?",
  };

  componentWillMount() {
    console.log("vids", this.props.videos);
    Modules.get(this.props.moduleKey, this.props.langId).then((ms) => {
      console.log("got mod", ms);
      if (ms.length) {
        const m = ms[0];
        if (m.description) {
          setWindowTitle("Module - " + m.description);
        }

        this.setState({ module: m });
      }
    });

    Procedures.all(this.props.langId, true).then((ps) => {
      console.log("got procs", ps);
      this.setState({ procedures: ps });
    });

    KeyLearningPoints.all(this.props.langId, true).then((klps) => {
      console.log("got klps", klps);
      this.setState({ keyLearningPoints: klps });
    });

    Drugs.all(this.props.langId).then((ds) => {
      console.log("got drugs", ds);
      this.setState({ drugs: ds });
    });

    ActionCards.all(this.props.langId, true).then((cards) => {
      console.log("got actionCards", cards);
      this.setState({ actionCards: cards });
    });
  }

  saveProceduresModule(selectedProcedures) {
    const module = this.state.module;
    const newModule = { ...module, procedures: selectedProcedures };
    console.log("New module", newModule);
    Modules.put(newModule).then((m) => {
      this.setState({
        module: m,
        snackLabel: `Practical procedures saved`,
        snackActive: true,
        procedureDialogActive: false,
      });
    });
  }

  saveDrugsModule(selectedDrugs) {
    const module = this.state.module;
    const newModule = { ...module, drugs: selectedDrugs };
    console.log("New module", newModule);
    Modules.put(newModule).then((m) => {
      this.setState({
        module: m,
        snackLabel: `Essential drugs saved`,
        snackActive: true,
        drugsDialogActive: false,
      });
    });
  }

  saveActionCardsModule(selectedCards) {
    const module = this.state.module;
    const newModule = { ...module, actionCards: selectedCards };
    console.log("New module", newModule);
    Modules.put(newModule).then((m) => {
      console.log("Got upd", m, selectedCards);
      this.setState({
        module: m,
        snackLabel: `Action Cards saved`,
        snackActive: true,
        actionCardsDialogActive: false,
      });
    });
  }

  saveKeyLearningPointsModule(selectedKLPs) {
    const module = this.state.module;
    const newModule = { ...module, keyLearningPoints: selectedKLPs };
    console.log("New module", newModule);
    Modules.put(newModule).then((m) => {
      console.log("Got upd", m, selectedKLPs);
      this.setState({
        module: m,
        snackLabel: `Key Learning Points saved`,
        snackActive: true,
        keyLearningPointsDialogActive: false,
      });
    });
  }

  saveVideos(videos) {
    const module = this.state.module;
    const newModule = { ...module, videos: videos };
    console.log("New module", newModule);
    Modules.put(newModule).then((m) => {
      this.setState({
        module: m,
        snackLabel: `Videos saved`,
        snackActive: true,
        videoDialogActive: false,
      });
    });
  }

  render() {
    const isLoaded =
      this.state.actionCards &&
      this.state.module &&
      this.state.procedures &&
      this.state.drugs &&
      this.state.keyLearningPoints;

    return (
      <section>
        {isLoaded ? (
          <section>
            <EditCard
              title="Videos"
              subtitle="Select videos to include in this module"
              onClick={() => this.setState({ videoDialogActive: true })}
            />
            <EditCard
              title="Essential Drugs"
              subtitle="Select the essential drugs for this module"
              onClick={() => this.setState({ drugsDialogActive: true })}
            />
            <EditCard
              title="Practical Procedures"
              subtitle="Select procedures to include in this module"
              onClick={() => this.setState({ procedureDialogActive: true })}
            />
            <EditCard
              title="Action Cards"
              subtitle="Select action cards to include in this module"
              onClick={() => this.setState({ actionCardsDialogActive: true })}
            />
            <EditCard
              title="Key Learning Points"
              subtitle="Select Key Learning Points to include in this module"
              onClick={() =>
                this.setState({ keyLearningPointsDialogActive: true })
              }
            />

            <SelectItemsDialog
              title="Select Practical Procedures"
              dialogActive={this.state.procedureDialogActive}
              available={this.state.procedures}
              selectedKeys={this.state.module.procedures}
              onSave={(s) => this.saveProceduresModule(s)}
              onHide={() => this.setState({ procedureDialogActive: false })}
            />

            <SelectItemsDialog
              title="Select Key Learning Points"
              dialogActive={this.state.keyLearningPointsDialogActive}
              available={this.state.keyLearningPoints}
              selectedKeys={this.state.module.keyLearningPoints}
              onSave={(s) => this.saveKeyLearningPointsModule(s)}
              onHide={() =>
                this.setState({ keyLearningPointsDialogActive: false })
              }
            />

            <SelectItemsDialog
              title="Select Action Cards"
              dialogActive={this.state.actionCardsDialogActive}
              available={this.state.actionCards}
              selectedKeys={this.state.module.actionCards}
              onSave={(s) => this.saveActionCardsModule(s)}
              onHide={() => this.setState({ actionCardsDialogActive: false })}
            />

            <SelectItemsDialog
              title="Select Essential Drugs"
              dialogActive={this.state.drugsDialogActive}
              available={this.state.drugs}
              selectedKeys={this.state.module.drugs}
              onSave={(s) => this.saveDrugsModule(s)}
              onHide={() => this.setState({ drugsDialogActive: false })}
            />

            <SelectItemsDialog
              title="Select Videos"
              dialogActive={this.state.videoDialogActive}
              available={this.props.videos}
              selectedKeys={this.state.module.videos}
              onSave={(vs) => this.saveVideos(vs)}
              onHide={() => this.setState({ videoDialogActive: false })}
            />
            <Snackbar
              label={this.state.snackLabel}
              type="accept"
              active={this.state.snackActive}
              timeout={2000}
              onTimeout={() => this.setState({ snackActive: false })}
            />
          </section>
        ) : (
          <ProgressBar mode="indeterminate" />
        )}
      </section>
    );
  }
}

const mapStateToProps = (state) => ({
  langId: langIdFromRoute(state),
  currentPathname: state.router.pathname,
  moduleKey: state.router.params.moduleKey,
  images: state.images.images || [],
  videos: Array.from(state.videos.videos.keys()).map((v) => ({ key: v })),
});

const mapDispatchToProps = (dispatch) => ({
  push: (curr, loc) => {
    const newLoc = loc.startsWith("/") ? loc : `${curr}/${loc}`;
    dispatch({ type: PUSH, payload: newLoc });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ModuleContainer);
