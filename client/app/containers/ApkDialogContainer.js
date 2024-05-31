"use strict";

import React, { Component } from "react";
import { connect } from "react-redux";
import { Button, ProgressBar, RadioButton, RadioGroup } from "react-toolbox";
import { APKs } from "../lib/sdaAPI";

class ApkDialogContainer extends Component {
  state = {
    apks: [],
    emptyText: "Loading...",
    isWorking: false,
    isWorkingLang: undefined,
    apkType: undefined,
    apkTypeError: false,
    apkGenError: undefined,
    latestReleaseBuildInfo: undefined,
  };

  constructor(props) {
    super(props);
    // We need to keep track of timeouts
    this.timeouts = [];
    this.updateList = this.updateList.bind(this);
    this.apkGenerate = this.apkGenerate.bind(this);
    this.changeApkType = this.changeApkType.bind(this);
  }

  componentDidMount() {
    this.updateList();
    this.getStatus(1);
    this.getLatestReleaseBuild();
  }

  /**
   * We need to keep track of mounted state, since this
   * component will live on because of the long-running
   * tasks.
   */
  componentWillUnmount() {
    this.timeouts.map(clearTimeout);
  }

  getLatestReleaseBuild = () => {
    APKs.latest(this.props.language.id)
      .then(
        (result) =>
          result.downloadLocation &&
          this.setState({ latestReleaseBuildInfo: result })
      )
      .catch(() => this.setState({ latestReleaseBuildInfo: undefined }));
  };

  updateList() {
    APKs.list(this.props.language.id)
      .then((apks) => {
        const emptyText = apks.length > 0 ? "" : "No APKs found";
        this.setState({ apks, emptyText });
      })
      .catch(() =>
        this.setState({ apks: [], emptyText: "Could not load APK list" })
      );
  }

  apkLink = (filename, downloadLocation) => (
    <a href={downloadLocation}>{filename}</a>
  );

  getStatus(timeout) {
    timeout = timeout || 5000;
    const timeoutId = setTimeout(() => {
      APKs.status().then((result) => {
        if (result.status === "BUSY") {
          // Update state if has changed
          if (!this.state.isWorking) {
            this.setState({ isWorking: true, isWorkingLang: result.langId });
          }
          this.getStatus();
          return;
        }

        // At this point the progress has stopped.

        // If we were working at last check - we need to update the list
        // (in case we are showing the working language)
        if (
          this.state.isWorking &&
          this.state.isWorkingLang === this.props.language.id
        ) {
          this.updateList();
        }
        this.setState({ isWorking: false, isWorkingLang: undefined });
        return;
      });
    }, timeout);
    // We keep track of timeouts
    this.timeouts.push(timeoutId);
  }

  apkGenerate(langId) {
    // return handler
    return () => {
      if (this.state.apkType === undefined) {
        this.setState({ apkTypeError: true });
        return;
      }

      const isDraft = this.state.apkType === "draft";
      this.setState({
        isWorking: true,
        isWorkingLang: this.props.language.id,
        apkTypeError: undefined,
        apkGenError: undefined,
      });
      APKs.generate(langId, isDraft);
      this.getStatus();
    };
  }

  changeApkType = (val) =>
    this.setState({ apkType: val, apkTypeError: undefined });

  getDescFromLangId = (langId) => {
    const lang = this.props.languages.find((l) => l.id === langId);
    return lang ? lang.description : "Unknown";
  };

  renderBusyStatus() {
    if (!this.state.isWorking) {
      return null;
    }

    // If we are currently working on the selected language
    // show progressbar
    if (this.state.isWorkingLang === this.props.language.id) {
      return (
        <div style={{ width: "156px" }}>
          <ProgressBar mode="indeterminate" />
        </div>
      );
    }

    // Otherwise show message with active language.
    return (
      <div style={{ marginTop: 30 }}>
        Busy generating APK for
        <b>{this.getDescFromLangId(this.state.isWorkingLang)}</b>
      </div>
    );
  }

  render() {
    return (
      <div>
        {/* Render an empty list */}
        {this.state.apks.length == 0 && <div>{this.state.emptyText}</div>}

        {/* Show table */}
        {this.state.apks.length > 0 && (
          <div>
            <p>
              Dynamic link to latest <b>release</b> APK - use this for sharing:
              {this.state.latestReleaseBuildInfo ? (
                <a href={this.state.latestReleaseBuildInfo.downloadLocation}>
                  Download
                </a>
              ) : (
                "Unavailable"
              )}
            </p>

            <br />
            <br />

            <table style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>File</th>
                  <th style={{ textAlign: "center" }}>Draft</th>
                  <th style={{ textAlign: "center" }}>Lang Version</th>
                  <th style={{ textAlign: "right" }}>Created at</th>
                </tr>
              </thead>
              <tbody>
                {this.state.apks.map((apk) => (
                  <tr key={apk.filename}>
                    <td style={{ textAlign: "left", paddingRight: 0 }}>
                      {this.apkLink(apk.filename, apk.downloadLocation)}
                    </td>
                    <td style={{ textAlign: "center", paddingRight: 0 }}>
                      {apk.draft ? "Draft" : "Release"}
                    </td>
                    <td style={{ textAlign: "center", paddingRight: 0 }}>
                      {apk.langVersion}
                    </td>
                    <td style={{ textAlign: "right", paddingRight: 0 }}>
                      {new Date(apk.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: 30 }}>
          <h5 style={{ marginBottom: 15 }}>APK generation</h5>
          <div style={{ display: "flex" }}>
            <div style={{ flex: 1 }}>
              <Button
                onClick={this.apkGenerate(this.props.language.id)}
                disabled={this.state.isWorking}
                raised
              >
                Create APK
              </Button>
            </div>
            <div style={{ flex: 2 }}>
              <RadioGroup
                onChange={this.changeApkType}
                value={this.state.apkType}
                disabled={this.state.isWorking}
              >
                <RadioButton label="Published content" value="publish" />
                <RadioButton label="Draft content" value="draft" />
              </RadioGroup>
              <div
                style={{
                  color: "#e32a2a",
                  display: this.state.apkTypeError ? "inherit" : "none",
                }}
              >
                Please specify
              </div>
            </div>
          </div>
          {this.renderBusyStatus()}
          <div
            style={{
              display:
                this.state.apkGenError !== undefined ? "inherit" : "none",
            }}
          >
            {this.state.apkGenError}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  languages: state.lang.languages,
});

export default connect(mapStateToProps, null)(ApkDialogContainer);
