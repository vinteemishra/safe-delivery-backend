"use strict";

import React, { Component } from "react";
import { connect } from "react-redux";
import { Button } from "react-toolbox/lib/button";
import { Card, CardTitle, CardActions } from "react-toolbox/lib/card";
import Slider from "react-toolbox/lib/slider";
import { PUSH } from "redux-little-router";
import { Certificates } from "lib/sdaAPI";
import { langIdFromRoute } from "lib/util";

class CertificatesContainer extends Component {
  state = {
    changed: false,
    cert: undefined,
  };

  isMaster() {
    return this.props.langId === "";
  }

  handleChange(name, value) {
    let newCert = { ...this.state.cert, [name]: value };
    this.setState({ cert: newCert, changed: true });
  }

  componentWillMount() {
    Certificates.all(this.props.langId).then((cs) => {
      if (cs.length > 0) {
        this.setState({ cert: cs[0] }); // Hardcoded to number one
      }
    });
  }

  saveChanges = () => {
    Certificates.put(this.state.cert).then((cert) => {
      this.setState({ cert, changed: false });
    });
  };

  render() {
    const push = (l) => this.props.push(this.props.currentPathname, l);
    // const imageList = Array.from(this.props.images.keys()).map(key => ({value: key, label: key}));

    if (!this.state.cert) {
      return <div>No cert</div>;
    }

    return (
      <div>
        <h4>Certificate properties</h4>
        <section>
          {this.isMaster() && (
            <div
              style={{
                width: 500,
                display: "inline-block",
                verticalAlign: "top",
                marginRight: 40,
              }}
            >
              <br />
              <p>Deadly anwsers required to fail</p>
              <Slider
                pinned
                snaps
                min={0}
                max={10}
                step={1}
                editable
                value={this.state.cert.deadly}
                onChange={this.handleChange.bind(this, "deadly")}
              />
              <p>Pass rate (percentage)</p>
              <Slider
                pinned
                min={0}
                max={100}
                step={1}
                editable
                value={this.state.cert.passRate}
                onChange={this.handleChange.bind(this, "passRate")}
              />
            </div>
          )}
          <div style={{ display: "inline-block", verticalAlign: "top" }}>
            <Card style={{ width: "20em", margin: "0.3em" }}>
              <CardTitle
                title="Introduction"
                subtitle="Change Certificate introduction"
              />
              <CardActions>
                <Button
                  icon="ic_mode_edit"
                  label="Edit Introduction"
                  onClick={() => push(`${this.state.cert.key}`)}
                />
              </CardActions>
            </Card>
          </div>
        </section>
        {this.isMaster() && (
          <Button
            label="Save changes"
            icon="save"
            disabled={!this.state.changed}
            raised
            primary
            onClick={this.saveChanges.bind(this)}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  langId: langIdFromRoute(state),
  currentPathname: state.router.pathname,
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
)(CertificatesContainer);
