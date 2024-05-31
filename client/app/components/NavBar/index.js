import React, { PropTypes } from "react";
import AppBar from "react-toolbox/lib/app_bar";
import Link from "react-toolbox/lib/link";
import Button from "react-toolbox/lib/button";
import theme from "./style.scss";
import { connect } from "react-redux";
import { PUSH } from "redux-little-router";

class NavBar extends React.Component {
  static propTypes = {
    children: PropTypes.node,
  };

  render() {
    const { children, push } = this.props;

    return (
      <AppBar theme={theme}>
        <Link className={theme.appBar} active={true} href="/">
          Safe Delivery CMS
        </Link>
        {this.props.auth.role === "admin" && (
          <Button style={{ float: "right" }} onClick={(e) => push("/admin")}>
            Admin
          </Button>
        )}
        <Button href="/.auth/logout" style={{ float: "right" }}>
          Logout
        </Button>
        {children}
      </AppBar>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth.auth,
});

const mapDispatchToProps = (dispatch) => ({
  push: (loc) => {
    dispatch({ type: PUSH, payload: loc });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(NavBar);
