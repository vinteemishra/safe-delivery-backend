"use strict";

import React, { Component } from "react";
import { connect } from "react-redux";
import { Card, CardText, CardActions } from "react-toolbox/lib/card";
import { FontIcon } from "react-toolbox/lib/font_icon";
import { Button } from "react-toolbox/lib/button";
import Dialog from "react-toolbox/lib/dialog";
import Snackbar from "react-toolbox/lib/snackbar";
import Input from "react-toolbox/lib/input";
import Dropdown from "react-toolbox/lib/dropdown";
import Checkbox from "react-toolbox/lib/checkbox";
import { PUSH } from "redux-little-router";
import ProgressBar from "react-toolbox/lib/progress_bar";
import { countries } from "../lib/countries";

import ApkDialogContainer from "./ApkDialogContainer";

import Tooltip from "react-toolbox/lib/tooltip";

import {
  fetchLanguages,
  deleteLanguage,
  addLanguage,
  editLanguage,
} from "modules/lang";
import { Lang } from "lib/sdaAPI";

const TooltipButton = Tooltip(Button);

const countriesAndWHO = [
  { label: "WHO", value: "WHO", latitude: 0, longitude: 0 },
  ...countries,
];

const CustomCardTitle = (props) => {
  const headerStyle = {
    float: "left",
    letterSpacing: ".02em",
    fontWeight: 400,
    lineHeight: 1.25,
    fontSize: "2.4rem",
    margin: "15px 0 0 18px",
  };

  const headerEditStyle = {
    display: "inline-block",
    minWidth: 0,
    marginTop: 5,
    padding: "0px 1px 0px 8px",
    color: "#8b8b8b",
  };

  return (
    <div>
      <h5 style={headerStyle}>{props.description}</h5>
      <Button onClick={props.onEdit} style={headerEditStyle} icon="edit" />
    </div>
  );
};

class LanguagesContainer extends Component {
  state = {
    dialogActive: false,
    publishDialogActive: false,
    unpublishDialogActive: false,
    apksDialogActive: false,
    publishDraft: false,
    snackActive: false,
    snackLabel: "?",
    description: "",
    assetVersion: "",
    countryCode: "",
    indicateMasterDifferences: false,
    latitude: "",
    longitude: "",
    editLang: undefined,
  };

  constructor(props) {
    super(props);

    this.handleCountryChange = this.handleCountryChange.bind(this);
    this.handleEditCountryChange = this.handleEditCountryChange.bind(this);
  }

  handleChange(name, value) {
    this.setState({ ...this.state, [name]: value });
  }

  handleCountryChange(value) {
    const selection = countriesAndWHO.find((c) => c.value == value);
    this.setState({
      countryCode: value,
      latitude: selection.latitude,
      longitude: selection.longitude,
    });
    console.log("Changed language:", value);
  }

  handleEditChange(name, value) {
    const { editLang } = this.state;
    if (editLang) {
      const editLangClone = Object.assign({}, editLang);
      editLangClone[name] = value;
      this.setState({ editLang: editLangClone });
    }
  }

  handleEditCountryChange(value) {
    const { editLang } = this.state;
    if (editLang) {
      const editLangClone = Object.assign({}, editLang);
      const selection = countriesAndWHO.find((c) => c.value == value);
      editLangClone.countryCode = value;
      editLangClone.latitude = selection.latitude;
      editLangClone.longitude = selection.longitude;
      this.setState({ editLang: editLangClone });
    }
  }

  componentWillMount() {
    this.setState({ languages: [] });
    this.props.fetch();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.languages) {
      // Filter languages based on auth
      let languages = nextProps.languages;
      if (this.props.auth && this.props.auth.role == "translator") {
        const allowedLanguages = this.props.auth.languages;
        console.log("Sample:", nextProps.languages[0]);
        languages = nextProps.languages.filter(
          (l) => allowedLanguages.indexOf(l.id) !== -1
        );
      }

      this.setState({
        languages,
      });
    }
  }

  hideDialog = () => {
    this.setState({ dialogActive: false });
  };

  hidePublishDialog = () => {
    this.setState({ publishDialogActive: false });
  };

  hideUnpublishDialog = () => {
    this.setState({ unpublishDialogActive: false });
  };

  hideApkDialog = () => {
    this.setState({ apksDialogActive: false });
  };

  saveLang = () => {
    const {
      description,
      assetVersion,
      countryCode,
      latitude,
      longitude,
      indicateMasterDifferences,
    } = this.state;

    const lang = {
      description,
      assetVersion,
      countryCode,
      latitude,
      longitude,
      indicateMasterDifferences,
    };
    Lang.post(lang).then((l) => {
      this.setState({
        snackLabel: `Language '${this.state.description}' added`,
        snackActive: true,
      });
      this.props.add(l);
    });
    this.hideDialog();
  };

  handleDelete(langId, desc) {
    if (
      confirm(
        `Deleting language '${desc}' will also delete all translations for this language. Are you sure you want to proceed?`
      )
    ) {
      Lang.del(langId).then((r) => {
        this.props.delete(langId);
      });
    }
  }

  handlePublish = () => {
    this.hidePublishDialog();

    const lang = this.state.publishLang;

    // HACK
    lang.isPublishing = true;
    this.setState({ languages: this.state.languages });
    Lang.publish(lang.id, { draft: this.state.publishDraft }).then((r) => {
      console.log("published", r);
      lang.isPublishing = false;
      this.props.fetch();
      const draft = this.state.publishDraft ? " as draft" : "";
      this.setState({
        languages: this.state.languages,
        snackLabel: `Language '${lang.description}' published${draft}`,
        snackActive: true,
      });
    });
  };

  handleUnpublish = () => {
    this.hideUnpublishDialog();

    const lang = this.state.publishLang;

    // HACK
    lang.isPublishing = true;
    this.setState({ languages: this.state.languages });
    Lang.unpublish(lang.id).then((r) => {
      console.log("unpublished", r);
      lang.isPublishing = false;
      this.props.fetch();
      this.setState({
        languages: this.state.languages,
        snackLabel: `Language '${lang.description}' unpublished`,
        snackActive: true,
      });
    });
  };

  editStart = (langId) => {
    const editLang = this.props.languages.find((l) => l.id === langId);
    this.setState({ editLang });
  };

  editDone = () => {
    const { editLang } = this.state;
    if (editLang) {
      const copy = Object.assign({}, editLang);
      console.log("Edit done:", { editLang });
      Lang.post(copy).then((l) => {
        this.setState({
          editLang: undefined,
          snackLabel: `Language was updated: ${l.description}`,
          snackActive: true,
        });
        this.props.edit(l);
      });
    }
  };

  editCancel = () => {
    this.setState({ editLang: undefined });
  };

  actions = [
    { label: "Cancel", onClick: this.hideDialog },
    { label: "Save", onClick: this.saveLang },
  ];

  editActions = [
    { label: "Cancel", onClick: this.editCancel },
    { label: "Save", onClick: this.editDone },
  ];

  publishActions = [
    { label: "Cancel", onClick: this.hidePublishDialog },
    { label: "Publish", onClick: this.handlePublish },
  ];

  unpublishActions = [
    { label: "Cancel", onClick: this.hideUnpublishDialog },
    { label: "Unpublish", onClick: this.handleUnpublish },
  ];

  assetVersions = [
    { value: "default", label: "Default" },
    { value: "africa", label: "African" },
    { value: "asia", label: "Asian" },
    { value: "central_asia", label: "Central Asia" },
    { value: "south_europe", label: "Europe" },
    { value: "india", label: "India" },
    { value: "mena", label: "MENA" },
    { value: "pacific", label: "Pacific" },
    { value: "latin_america", label: "Latin America" },
    { value: "eastern_europe", label: "Eastern Europe" }
  ];

  prettyAssetVersion(value) {
    const needle = this.assetVersions.find((v) => v.value === value);
    if (needle) {
      return needle.label;
    }
    return <FontIcon value="warning" style={{ color: "red" }} />;
  }

  prettyPrintCountryCode(countryCode) {
    const lang = countriesAndWHO.find((l) => l.value === countryCode);
    if (lang) {
      let mapLink = (
        <a
          href={`https://www.google.com/maps/@?api=1&map_action=map&center=${lang.latitude}%2C${lang.longitude}&zoom=6`}
          target="_blank"
        >
          <FontIcon value="my_location" style={{ color: "blue" }} />
        </a>
      );
      if (lang.value === "WHO") {
        mapLink = <span>(Global)</span>;
      }
      return (
        <span>
          {lang.label}&nbsp;{mapLink}
        </span>
      );
    }
    return <FontIcon value="warning" style={{ color: "red" }} />;
  }

  renderFilterBox() {
    if (this.props.auth.role !== "admin") {
      return null;
    }

    return (
      <div style={{ marginLeft: 30, display: "flex", alignItems: "center" }}>
        <Input
          value={this.state.langFilter}
          onChange={(val) => this.setState({ langFilter: val })}
          label="Filter languages"
        />
        {this.state.langFilter !== undefined &&
          this.state.langFilter.trim() !== "" && (
            <Button
              style={{ minWidth: "1em" }}
              primary
              raised
              label="X"
              onClick={() => this.setState({ langFilter: "" })}
            />
          )}
      </div>
    );
  }

  render() {
    const push = this.props.push;

    const { languages, langFilter } = this.state;

    let listToRender = languages;
    if (langFilter !== undefined && langFilter.trim() !== "") {
      listToRender = languages.filter(
        (l) =>
          (l.description || "")
            .toLowerCase()
            .indexOf(langFilter.toLowerCase()) !== -1
      );
    }

    return (
      <section>
        <div style={{ display: "flex" }}>
          <h1 style={{ display: "inline-block" }}>Languages</h1>
          {this.renderFilterBox()}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {/* {this.state.languages.map (l => { */}
          {listToRender.map((l) => {
            const publishedVersion = l.lastPublished ? (
              <span>
                {l.version} ({new Date(l.lastPublished).toLocaleString()})
              </span>
            ) : (
              <span>Not published yet</span>
            );
            const draftVersion = l.draftLastPublished ? (
              <span>
                {l.draftVersion} (
                {new Date(l.draftLastPublished).toLocaleString()})
              </span>
            ) : (
              <span>Not published yet</span>
            );
            return (
              <Card
                key={l.id}
                style={{ margin: 15, width: "400px", minHeight: "200px" }}
              >
                <CustomCardTitle
                  onEdit={() => this.editStart(l.id)}
                  description={l.description}
                />
                <CardText>
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          <b>Version</b>
                        </td>
                        <td>{publishedVersion}</td>
                      </tr>
                      <tr>
                        <td>
                          <b>Draft version</b>
                        </td>
                        <td>{draftVersion}</td>
                      </tr>
                      <tr>
                        <td>
                          <b>Asset version</b>
                        </td>
                        <td>{this.prettyAssetVersion(l.assetVersion)}</td>
                      </tr>
                      <tr>
                        <td>
                          <b>Associated country</b>
                        </td>
                        <td>{this.prettyPrintCountryCode(l.countryCode)}</td>
                      </tr>
                    </tbody>
                  </table>
                </CardText>
                {l.isPublishing && <ProgressBar mode="indeterminate" />}

                <CardActions>
                  <Button
                    raised
                    label="Edit draft"
                    onClick={() => push(`/languages/${l.id}`)}
                  />
                  {this.props.auth.role == "admin" && (
                    <Button
                      raised
                      label="Publish"
                      onClick={() =>
                        this.setState({
                          publishDialogActive: true,
                          publishDraft: true,
                          publishLang: l,
                        })
                      }
                    />
                  )}
                  {this.props.auth.role == "admin" && (
                    <Button
                      raised
                      label="Unpublish"
                      onClick={() =>
                        this.setState({
                          unpublishDialogActive: true,
                          publishLang: l,
                        })
                      }
                    />
                  )}
                  {this.props.auth.role == "admin" && (
                    <Button
                      raised
                      label="APKs"
                      onClick={() =>
                        this.setState({
                          apksDialogActive: true,
                          publishLang: l,
                        })
                      }
                    />
                  )}
                  {this.props.auth.role == "admin" && (
                    <TooltipButton
                      tooltipDelay={500}
                      tooltip="Delete language"
                      icon="delete"
                      onClick={() => this.handleDelete(l.id, l.description)}
                    />
                  )}
                </CardActions>
              </Card>
            );
          })}
        </div>

        {this.props.auth.role == "admin" && (
          <div style={{ display: "block" }}>
            <Button
              label="Add language"
              icon="add"
              raised
              primary
              onClick={() => this.setState({ dialogActive: true })}
            />
          </div>
        )}

        {/* Add Language Dialog */}
        <Dialog
          actions={this.actions}
          active={this.state.dialogActive}
          onEscKeyDown={this.hideDialog}
          onOverlayClick={this.hideDialog}
          title="Add language"
        >
          <p>
            Enter the name of the language and the asset version used when
            publishing.
          </p>
          <Input
            value={this.state.description}
            onChange={this.handleChange.bind(this, "description")}
            required={true}
            label="Description"
          />
          <Dropdown
            auto={false}
            source={this.assetVersions}
            onChange={this.handleChange.bind(this, "assetVersion")}
            label="Select asset version"
            value={this.state.assetVersion}
          />
          <Dropdown
            auto={false}
            source={countriesAndWHO}
            onChange={this.handleCountryChange}
            label="Select associated country"
            value={this.state.countryCode}
          />
          <Checkbox
            checked={this.state.indicateMasterDifferences}
            label="Indicate when Adapted content differs from Master (Red Box)"
            onChange={this.handleChange.bind(this, "indicateMasterDifferences")}
          />
        </Dialog>

        {/* Edit Language Dialog */}
        <Dialog
          actions={this.editActions}
          active={this.state.editLang !== undefined}
          onEscKeyDown={this.editCancel}
          onOverlayClick={this.editCancel}
          title="Edit language"
        >
          {/* <p>Edit the name of the language and the asset version used when publishing.</p> */}
          <Input
            value={(this.state.editLang || {}).description || ""}
            onChange={this.handleEditChange.bind(this, "description")}
            required={true}
            label="Description"
          />
          <Dropdown
            auto={false}
            source={this.assetVersions}
            onChange={this.handleEditChange.bind(this, "assetVersion")}
            label="Select asset version"
            value={(this.state.editLang || {}).assetVersion || ""}
          />
          <Dropdown
            auto={false}
            source={countriesAndWHO}
            onChange={this.handleEditCountryChange}
            label="Select associated country"
            value={(this.state.editLang || {}).countryCode || ""}
          />
          <Checkbox
            checked={
              (this.state.editLang || {}).indicateMasterDifferences || false
            }
            label="Indicate when Master differs from Adapted (Red Box)"
            onChange={this.handleEditChange.bind(
              this,
              "indicateMasterDifferences"
            )}
          />
        </Dialog>

        {/* Publish language dialog */}
        <Dialog
          actions={this.publishActions}
          active={this.state.publishDialogActive}
          onEscKeyDown={this.hidePublishDialog}
          onOverlayClick={this.hidePublishDialog}
          title="Publish Language"
        >
          <p>
            This will publish a new version of the language. Unless you select
            to publish a draft, the new version will be visible immediately. A
            draft version is only visible to select users.
          </p>
          <Checkbox
            checked={this.state.publishDraft}
            label="Publish draft version"
            onChange={this.handleChange.bind(this, "publishDraft")}
          />
        </Dialog>

        {/* Unpublish dialog */}
        <Dialog
          actions={this.unpublishActions}
          active={this.state.unpublishDialogActive}
          onEscKeyDown={this.hideUnpublishDialog}
          onOverlayClick={this.hideUnpublishDialog}
          title="Unpublish Language"
        >
          <p>
            This will remove the published version of the language. New users
            will not be able to see the language, but it will still be visible
            to users who have already downloaded it.
          </p>
        </Dialog>

        {/* APK generation dialog */}
        <Dialog
          style={{ width: "100%" }}
          actions={[{ label: "Ok, done", onClick: this.hideApkDialog }]}
          active={this.state.apksDialogActive}
          onEscKeyDown={this.hideApkDialog}
          onOverlayClick={this.hideApkDialog}
          title="APKs"
        >
          <ApkDialogContainer language={this.state.publishLang} />
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

const mapStateToProps = (state) => {
  return {
    dialogActive: false,
    auth: state.auth.auth,
    languages: state.lang.languages,
  };
};

const mapDispatchToProps = (dispatch) => ({
  fetch: () => dispatch(fetchLanguages()),
  add: (l) => dispatch(addLanguage(l)),
  edit: (l) => dispatch(editLanguage(l)),
  delete: (langId) => dispatch(deleteLanguage(langId)),
  push: (loc) => dispatch({ type: PUSH, payload: loc }),
});

export default connect(mapStateToProps, mapDispatchToProps)(LanguagesContainer);
