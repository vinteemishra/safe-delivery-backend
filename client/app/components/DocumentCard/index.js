"use strict";

import React from "react";
import { connect } from "react-redux";
import { Card, CardTitle, CardText, CardActions } from "react-toolbox/lib/card";
import { Button } from "react-toolbox/lib/button";
import { PUSH } from "redux-little-router";

const placeholder = require("./image-placeholder.png");

class DocumentCard extends React.Component {
  render() {
    return (
      <Card style={{ width: "350px" }}>
        <CardTitle
          title={this.props.title}
          subtitle={this.props.subtitle}
          avatar={placeholder}
        />
        <CardText>Last update: Someday</CardText>
        <CardActions>
          <Button
            icon="ic_edit"
            label="Edit"
            onClick={() => this.props.push(this.props.editUrl)}
          />
        </CardActions>
      </Card>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  push: (path) => dispatch({ type: PUSH, payload: path }),
});

export default connect(null, mapDispatchToProps)(DocumentCard);
