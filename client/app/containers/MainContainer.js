"use strict";

import React, { Component } from "react";
import { connect } from "react-redux";
import { Card, CardTitle, CardActions } from "react-toolbox/lib/card";
import { Button } from "react-toolbox/lib/button";
import { PUSH } from "redux-little-router";

class MainContainer extends Component {
  render() {
    const push = this.props.push;

    return (
      <section>
        <div style={{ display: "inline-block" }}>
          <Card style={{ width: "350px" }}>
            <CardTitle title="Masters" />
            <CardActions>
              <Button
                raised
                label="Go to Masters"
                onClick={() => push("/masters")}
              />
            </CardActions>
          </Card>
        </div>
        <div style={{ display: "inline-block" }}>
          <Card style={{ width: "350px" }}>
            <CardTitle title="Language Versions" />
            <CardActions>
              <Button
                raised
                label="Go to Language Versions"
                onClick={() => push("/languages")}
              />
            </CardActions>
          </Card>
        </div>
      </section>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  push: (loc) => dispatch({ type: PUSH, payload: loc }),
});

export default connect(null, mapDispatchToProps)(MainContainer);
