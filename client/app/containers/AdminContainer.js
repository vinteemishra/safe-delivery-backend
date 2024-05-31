"use strict";

import React, { Component } from "react";
import { connect } from "react-redux";
import { Button } from "react-toolbox/lib/button";
import { Card, CardActions, CardText, CardTitle } from "react-toolbox/lib/card";
import Input from "react-toolbox/lib/input";
import { PUSH } from "redux-little-router";
import Actions from "../components/Actions";
import CertificateGenerator from "../components/CertificateGenerator";
import { getCertInfo } from "../lib/certId";

import { Admin } from "../lib/sdaAPI";

const CertValidationResult = ({ result }) =>
  !result ? null : (
    <div>
      <h5 style={{ marginTop: 30 }}>Id validation</h5>
      <table cellSpacing={13}>
        <tbody>
          <tr>
            <td>Valid</td>
            <td>
              {result.valid ? (
                <span style={{ color: "green" }}>Valid</span>
              ) : (
                <span style={{ color: "red" }}>Invalid</span>
              )}
            </td>
          </tr>
          <tr>
            <td>Claim date</td>
            <td>{result.date}</td>
          </tr>
          <tr>
            <td>Country</td>
            <td>{result.country}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

class SharedCertResult extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sharedResult: undefined,
    };
  }

  componentDidUpdate(oldProps) {
    const { certId } = this.props;
    if (oldProps.certId !== certId && certId && certId.trim() !== "") {
      const certIdProp = certId.replace(/-/g, "").toLowerCase();
      Admin.certsById(certIdProp).then((r) =>
        this.setState({ sharedResult: r })
      );
    }
  }

  render() {
    const { certId } = this.props;
    const { sharedResult } = this.state;
    if (!certId || !sharedResult) {
      return null;
    }

    if (this.state.sharedResult.length === 0) {
      return (
        <div>
          <h5 style={{ marginTop: 30 }}>Shared results</h5>
          <p>No shared certificate results found</p>
        </div>
      );
    }

    return (
      <div>
        <h5 style={{ marginTop: 30 }}>Shared results</h5>
        <table cellSpacing={13}>
          <thead>
            <tr>
              {[
                "Email",
                "Member ID",
                "Cert ID",
                "Name",
                "Job Titile",
                "Language",
                "Country",
              ].map((element) => (
                <th key={element}>{element}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {this.state.sharedResult.map((result) => (
              <tr key={result.id}>
                {[
                  result.email,
                  result.memberId || "N/A",
                  result.uniqueId || "N/A",
                  result.name,
                  result.jobTitle,
                  result.language || "N/A",
                  result.country || "N/A",
                ].map((element) => (
                  <td key={element}>{element}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

class AdminContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      certId: "",
    };
  }

  render() {
    const { push } = this.props;
    const { certId, lookupId, result } = this.state;

    return (
      <section>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Card style={{ width: "640px", minWidth: 350, marginRight: 10 }}>
            <CardTitle title="Event Check" />
            <CardActions>
              <Button
                raised
                label="Go to Event Check"
                onClick={() => push("/admin/events")}
              />
            </CardActions>
          </Card>
          <Card style={{ width: "640px", minWidth: 350, marginLeft: 10 }}>
            <CardTitle title="Certificate verifier" />
            <CardText>
              Unique Certificate ID #:
              <Input
                label="CertId"
                onChange={(certId) =>
                  this.setState({
                    certId,
                    result: undefined,
                    lookupId: undefined,
                  })
                }
                value={certId}
              />
              <Button
                raised
                label="Get info"
                onClick={() =>
                  this.setState({
                    result: getCertInfo(certId),
                    lookupId: certId,
                  })
                }
              />
              <CertValidationResult result={result} />
              <SharedCertResult certId={lookupId} />
            </CardText>
          </Card>
          <div style={{ marginTop: 20, marginBottom: 20 }}>
            <CertificateGenerator />
          </div>
          <Actions />
        </div>
      </section>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  push: (loc) => dispatch({ type: PUSH, payload: loc }),
});

export default connect(null, mapDispatchToProps)(AdminContainer);
