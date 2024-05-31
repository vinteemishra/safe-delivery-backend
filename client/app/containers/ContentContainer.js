"use strict";

import React, { Component } from "react";
import { connect } from "react-redux";
import { Card, CardTitle, CardText, CardActions } from "react-toolbox/lib/card";
import {
  List,
  ListItem,
  ListSubHeader,
  ListDivider,
} from "react-toolbox/lib/list";
import { genkey, langIdFromRoute, setWindowTitle } from "lib/util";
import { Button } from "react-toolbox/lib/button";
import Snackbar from "react-toolbox/lib/snackbar";
import Input from "react-toolbox/lib/input";
import { PUSH } from "redux-little-router";
import { Modules, Lang, ModuleCategories } from "lib/sdaAPI";
import { fetchModules, deleteModule, addModule } from "modules/modules";
import {
  fetchModuleCategories,
  addModuleCategory,
  deleteModuleCategory,
} from "modules/module-categories";
import ImageList from "../components/ImageList/index";
import Modal from "../components/Modal";

import GlobalSearch from "../components/GlobalSearch";
import { fetchImages } from "../modules/images";

class ContentContainer extends Component {
  constructor(props) {
    super(props);
    this.isLearningPlatformActive = this.isLearningPlatformActive.bind(this);
  }

  state = {
    dialogActive: false,
    snackActive: false,
    snackLabel: "?",
    description: "",
    icon: "",
    lang: null,
    searchString: "",
    addModuleCategoryDialogActive: false,
    moduleCategoryDescription: "",
    moduleCategoryIcon: "",
  };

  handleChange(name, value) {
    this.setState({ ...this.state, [name]: value });
  }

  hideDialog = () => {
    this.setState({ dialogActive: false });
  };

  hideModuleCategoryDialog = () => {
    this.setState({ addModuleCategoryDialogActive: false });
  };

  saveModule = () => {
    const desc = this.state.description;
    const moduleKey = genkey(desc);
    const module = {
      key: moduleKey,
      description: desc,
      icon: this.state.icon,
      langId: "",
    };

    Modules.post(module).then((m) => {
      this.setState({
        snackLabel: `Module '${desc}' added`,
        snackActive: true,
      });
      this.props.add(m);
    });
    this.hideDialog();
  };

  saveModuleCategory = () => {
    const desc = this.state.moduleCategoryDescription;
    const moduleKey = genkey(desc);
    const module = {
      key: moduleKey,
      description: this.state.moduleCategoryDescription,
      icon: this.state.moduleCategoryIcon,
    };

    ModuleCategories.post(module).then((m) => {
      this.setState({
        snackLabel: `Module Category '${desc}' added`,
        snackActive: true,
      });
      this.props.addCategory(m);
    });
    this.hideModuleCategoryDialog();
  };

  componentWillMount() {
    this.setState({ modules: [], moduleCategories: [] });
    this.props.fetch(this.props.langId);
    this.props.fetchCategories();
    Lang.get(this.props.langId).then((l) => {
      // Update title
      setWindowTitle(l.description);

      // Default learning platform to disabled.
      l.learningPlatform = l.learningPlatform || false;
      this.setState({ lang: l });
      this.props.getImages(l.assetVersion);
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.modules) {
      this.setState({ modules: nextProps.modules });
    }
    if (nextProps.moduleCategories) {
      this.setState({ moduleCategories: nextProps.moduleCategories });
    }
  }

  toggleLearningPlatform() {
    let lang = this.state.lang;
    lang.learningPlatform = !lang.learningPlatform;
    Lang.post(lang).then(() => {
      this.setState({ lang });
    });
  }

  boolToEnable(bool) {
    return bool ? "enable" : "disable";
  }

  isMaster() {
    return this.props.langId === "";
  }

  handleDelete(module) {
    if (
      confirm(
        `Deleting module '${module.description}' will delete all action cards and translations for this module. Are you sure you want to proceed?`
      )
    ) {
      Modules.del(module.key).then((r) => {
        this.props.delete(module.id);
      });
    }
    return true;
  }

  handleDeleteCategory(moduleCategory) {
    if (
      confirm(
        `Deleting module category '${moduleCategory.description}' will not delete the associated modules but the modules will not be categorised. Are you sure you want to proceed?`
      )
    ) {
      ModuleCategories.del(moduleCategory.key).then(() =>
        this.props.deleteCategory(moduleCategory.id)
      );
    }
    return true;
  }

  publishModuleCategories() {}

  handleConfirmPublishModuleCateogories() {
    if (
      confirm(
        "This will pulish the module categories and create a new version. Are you sure you want to go ahead?"
      )
    ) {
      this.publishModuleCategories();
    }
    return true;
  }

  moduleActions(module) {
    return [
      <Button
        key={module.key}
        icon="delete"
        onClick={() => this.handleDelete(module)}
      />,
    ];
  }

  moduleCategoryActions(moduleCategory) {
    return [
      <Button
        key={moduleCategory.key}
        icon="delete"
        onClick={() => this.handleDeleteCategory(moduleCategory)}
      />,
    ];
  }
  actions = [
    { label: "Cancel", onClick: this.hideDialog },
    { label: "Save", onClick: this.saveModule },
  ];

  isLearningPlatformActive() {
    if (this.isMaster()) {
      return true;
    }

    if (this.state.lang) {
      return this.state.lang.learningPlatform;
    }

    return false;
  }

  render() {
    const push = (l) => this.props.push(this.props.currentPathname, l);
    const HorizontalLine = () => (
      <hr
        style={{
          height: "1px",
          backgroundColor: "#ababab",
          marginTop: "1.5em",
          marginBottom: "1.5em",
        }}
      />
    );

    const sections = [
      {
        title: "Screens",
        subtitle: "Common text used in the app",
        url: "screens",
      },
      { title: "About", subtitle: "Texts for the about section", url: "about" },
      {
        title: "Notifications",
        subtitle: "App-generated notifications",
        url: "notifications",
      },
      { title: "Drugs", subtitle: "Global list of drugs", url: "drugs" },
      {
        title: "Action Cards",
        subtitle: "Global list of action cards",
        url: "action-cards",
      },
      {
        title: "Practical Procedures",
        subtitle: "Global list of practical procedures",
        url: "procedures",
      },
      {
        title: "Onboarding",
        subtitle: "Text and questions within onboarding",
        url: "onboarding",
      },
    ];

    const learningPlatform = [
      {
        title: "Key Learning Points",
        subtitle: "Global list of key learning points",
        url: "key-learning-points",
      },
      {
        title: "Cases",
        subtitle: "Global list of cases for certificate",
        url: "cases",
      },
      {
        title: "Certificate",
        subtitle: "Properties of certificate",
        url: "certificates",
      },
    ];

    const langName = this.state.lang ? this.state.lang.description : "";
    const lmActive = this.isLearningPlatformActive();
    const lmStyle = lmActive
      ? {} // Enabled
      : { backgroundColor: "#dbdbdb", color: "#a3a3a3" }; // Disabled
    return (
      <div>
        {!this.isMaster() && <h1>Translation of '{langName}'</h1>}
        {this.isMaster() && <GlobalSearch />}
        <section>
          {sections.map((s) => (
            <div key={s.url} style={{ display: "inline-block" }}>
              <Card style={{ width: "20em", margin: "0.3em" }}>
                <CardTitle title={s.title} subtitle={s.subtitle} />
                <CardActions>
                  <Button
                    icon="ic_mode_edit"
                    label="Edit Draft"
                    onClick={() => push(s.url)}
                  />
                </CardActions>
              </Card>
            </div>
          ))}
        </section>
        <HorizontalLine />
        <section>
          <h3>Learning Platform</h3>
          {!this.isMaster() && this.props.role === "admin" && (
            <div key="lm_config" style={{ display: "inline-block" }}>
              <Card style={{ width: "20em", margin: "0.3em", minHeight: 178 }}>
                <CardTitle
                  title="Configuration"
                  subtitle={"Enable Learning Platform for " + langName + "?"}
                />
                <CardText>
                  Learning Platform is currently{" "}
                  <i>{this.boolToEnable(lmActive) + "d"}</i> for {langName}.
                </CardText>
                <CardActions>
                  <Button
                    label={this.boolToEnable(!lmActive)}
                    onClick={this.toggleLearningPlatform.bind(this)}
                  />
                </CardActions>
              </Card>
            </div>
          )}
          {(this.props.role === "admin" || lmActive) &&
            learningPlatform.map((s) => (
              <div key={s.url} style={{ display: "inline-block" }}>
                <Card style={{ width: "20em", margin: "0.3em", ...lmStyle }}>
                  <CardTitle title={s.title} subtitle={s.subtitle} />
                  <CardText>&nbsp;</CardText>
                  <CardActions>
                    <Button
                      icon="ic_mode_edit"
                      label="Edit Draft"
                      disabled={!lmActive}
                      onClick={() => push(s.url)}
                    />
                  </CardActions>
                </Card>
              </div>
            ))}
        </section>
        <section>
          <HorizontalLine />
          {this.state.moduleCategories.length == 0 && !this.isMaster() && (
            <p>Please create modules categories in master</p>
          )}
          {this.props.role === "admin" && (
            <List selectable>
              <ListSubHeader caption="Module Categories" />
              {this.state.moduleCategories.map((m) => (
                <ListItem
                  key={m.key}
                  avatar={this.props.images.get(m.icon)}
                  caption={m.description}
                  onClick={
                    this.isMaster()
                      ? () => push(`module-categories/${m.key}`)
                      : undefined
                  }
                  rightActions={
                    this.isMaster() ? this.moduleCategoryActions(m) : []
                  }
                />
              ))}
              <ListDivider />
            </List>
          )}
          {this.isMaster() && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Button
                label="Add Module Category"
                icon="add"
                raised
                primary
                onClick={() =>
                  this.setState({ addModuleCategoryDialogActive: true })
                }
              />
              <Button
                label="Publish"
                icon="save"
                raised
                primary
                onClick={this.handleConfirmPublishModuleCateogories}
              />
            </div>
          )}
          <Modal
            actions={[
              { label: "Cancel", onClick: this.hideModuleCategoryDialog },
              { label: "Save", onClick: this.saveModuleCategory },
            ]}
            show={this.state.addModuleCategoryDialogActive}
            onClose={this.hideModuleCategoryDialog}
            title="Add Module Category"
            component={
              <div>
                <p>Enter the name of the module category and select an icon.</p>
                <Input
                  value={this.state.moduleCategoryDescription}
                  onChange={this.handleChange.bind(
                    this,
                    "moduleCategoryDescription"
                  )}
                  required={true}
                  label="Module Category"
                />
                Select Icon
                <div style={{ maxHeight: "600px" }}>
                  <ImageList
                    images={this.props.images}
                    onClick={(value) =>
                      this.handleChange("moduleCategoryIcon", value)
                    }
                  />
                </div>
              </div>
            }
          />

          <Snackbar
            label={this.state.snackLabel}
            type="accept"
            active={this.state.snackActive}
            timeout={2000}
            onTimeout={() => this.setState({ snackActive: false })}
          />
        </section>
        <section>
          <HorizontalLine />
          {this.state.modules.length == 0 && !this.isMaster() && (
            <p>Please create modules in master</p>
          )}
          {this.props.role === "admin" && (
            <List selectable>
              <ListSubHeader caption="Modules" />
              {this.state.modules.map((m) => (
                <ListItem
                  key={m.key}
                  avatar={this.props.images.get(m.icon)}
                  caption={m.description}
                  onClick={
                    this.isMaster() ? undefined : () => push(`modules/${m.key}`)
                  }
                  rightActions={this.isMaster() ? this.moduleActions(m) : []}
                />
              ))}
              <ListDivider />
            </List>
          )}
          {this.isMaster() && (
            <Button
              label="Add Module"
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
            title="Add Module"
            component={
              <div>
                <p>Enter the name of the module and select an icon.</p>
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
            title="Add Module"
          >
            <p>Enter the name of the module and select an icon.</p>
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
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  currentPathname: state.router.pathname,
  langId: langIdFromRoute(state),
  modules: state.modules.modules,
  images: state.images.images,
  role: state.auth.auth.role,
  moduleCategories: state.moduleCategories.moduleCategories,
});

const mapDispatchToProps = (dispatch) => ({
  push: (curr, loc) => {
    const newLoc = loc.startsWith("/") ? loc : `${curr}/${loc}`;
    dispatch({ type: PUSH, payload: newLoc });
  },
  fetch: (langId) => dispatch(fetchModules(langId)),
  add: (m) => dispatch(addModule(m)),
  delete: (moduleId) => dispatch(deleteModule(moduleId)),
  getImages: (assetVersion) => fetchImages({ assetVersion })(dispatch),
  fetchCategories: () => dispatch(fetchModuleCategories()),
  addCategory: (category) => dispatch(addModuleCategory(category)),
  deleteCategory: (id) => dispatch(deleteModuleCategory(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ContentContainer);
