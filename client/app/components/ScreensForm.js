"use strict";
import React, { PropTypes } from "react";
import Input from "react-toolbox/lib/input";
import Button from "react-toolbox/lib/button";
import { Tab, Tabs } from "react-toolbox";

import { connect } from "react-redux";
import { fetchScreens, updateScreens } from "modules/screens";
import { Screens } from "lib/sdaAPI";
import { langIdFromRoute } from "lib/util";
import { translatedFontStyle } from "lib/util";
import theme from "./ScreensForm.scss";

function Header(props) {
  if (!props.show) {
    return null;
  }

  return (
    <thead>
      <tr>
        <th>Master</th>
        <th>Adapted</th>
        <th>Translated</th>
      </tr>
    </thead>
  );
}

class ScreensForm extends React.Component {
  state = {
    index: 0,
  };

  handleSave() {
    const modified = this.state.items
      .filter((i) => i.modified)
      .map((i) => {
        let { modified, ...res } = i;
        return res;
      });
    if (modified.length > 0) {
      Screens.put(modified).then((r) => {
        this.props.updateScreens(this.state.items);
      });
    }
  }

  componentWillMount() {
    this.setState({ items: [] });
    this.props.fetchScreens(this.props.langId);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.items) {
      this.setState({
        items: nextProps.items,
      });
    }
  }

  handleTabChange = (index) => {
    this.setState({ index });
  };

  handleChange(key, prop, val) {
    let items = this.state.items.map((i) => {
      if (i.key === key) {
        i.modified = true;
        i[prop] = val;
        return i;
      } else return i;
    });

    this.setState({ items: items });
  }

  renderSection(prefix) {
    const items = this.state.items.filter((i) =>
      prefix === "" ? i.key.indexOf(":") == -1 : i.key.startsWith(prefix)
    );
    const fontStyle = translatedFontStyle(this.props.langId);

    return (
      <div className="grid grid-with-gutter">
        <div className="grid-cell grid-3 ">
          <table style={{ width: "100%" }}>
            <Header show={this.props.langId !== ""} />
            <tbody>
              {items.map((s) => {
                return (
                  <tr key={s.key}>
                    {this.props.langId === "" && (
                      <td className={theme.cell}>{s.key}</td>
                    )}
                    <td className={theme.cell}>
                      <Input
                        type="text"
                        disabled={this.props.langId !== ""}
                        name={s.key}
                        value={s.content}
                        onChange={this.handleChange.bind(
                          this,
                          s.key,
                          "content"
                        )}
                      />
                    </td>
                    {this.props.langId !== "" && (
                      <td className={theme.cell}>
                        <Input
                          type="text"
                          disabled={this.props.role === "translator"}
                          value={s.adapted}
                          onChange={this.handleChange.bind(
                            this,
                            s.key,
                            "adapted"
                          )}
                        />
                      </td>
                    )}
                    {this.props.langId !== "" && (
                      <td className={theme.cell}>
                        <Input
                          type="text"
                          style={fontStyle}
                          spellCheck="false"
                          value={s.translated}
                          onChange={this.handleChange.bind(
                            this,
                            s.key,
                            "translated"
                          )}
                        />
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div>
        <h2>Screens</h2>
        <Button
          icon="ic_save"
          label="Save"
          raised
          primary
          onClick={this.handleSave.bind(this)}
        />
        <Tabs index={this.state.index} onChange={this.handleTabChange}>
          <Tab label="General">{this.renderSection("")}</Tab>
          <Tab label="Modules">{this.renderSection("module:")}</Tab>
          <Tab label="Action Cards">{this.renderSection("action-card:")}</Tab>
          <Tab label="Practical Procedures">
            {this.renderSection("procedure:")}
          </Tab>
          <Tab label="Videos">{this.renderSection("video:")}</Tab>
          <Tab label="Drugs">{this.renderSection("drug:")}</Tab>
          <Tab label="Chapters">{this.renderSection("chapter:")}</Tab>
          <Tab label="User Profile Question">{this.renderSection("upq:")}</Tab>
          <Tab label="Learning Platform">{this.renderSection("lp:")}</Tab>
          <Tab label="Onboarding">{this.renderSection("onb:")}</Tab>
          <Tab label="User Feedback Form">{this.renderSection("ufq:")}</Tab>
        </Tabs>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  items: state.screens.items,
  langId: langIdFromRoute(state),
  role: state.auth.auth.role,
});

const mapDispatchToProps = (dispatch) => ({
  fetchScreens: (lang) => dispatch(fetchScreens(lang)),
  updateScreens: (lang, items) => dispatch(updateScreens(lang, items)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ScreensForm);
