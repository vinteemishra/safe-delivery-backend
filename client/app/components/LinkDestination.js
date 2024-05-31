"use strict";

import React from "react";
import Dropdown from "react-toolbox/lib/dropdown";

class LinkDestination extends React.Component {
  constructor(props) {
    super(props);

    if (props.value) {
      const [linkType, selectedDestination] = props.value.split(":");

      this.state = {
        linkType: linkType,
        selectedDestination: selectedDestination,
        availableDestinations: this.getAvailableDestinations(linkType),
      };
    } else {
      this.state = {
        linkType: "video",
        selectedDestination: "",
        availableDestinations: props.availableVideos,
      };
    }
    console.log("props", props);

    console.log("state", this.state);
  }

  handleChange(name, value) {
    console.log("link change", name, value);
    this.setState({ ...this.state, [name]: value });
    if (name == "linkType") {
      this.setState({
        availableDestinations: this.getAvailableDestinations(value),
      });
    }

    const n = {
      linkType: this.state.linkType,
      selectedDestination: this.state.selectedDestination,
      [name]: value,
    };
    const link = `${n.linkType}:${n.selectedDestination}`;
    this.props.onChange && this.props.onChange(link);
  }

  getAvailableDestinations(linkType) {
    switch (linkType) {
      case "video":
        return this.props.availableVideos;
      case "drug":
        return this.props.availableDrugs;
      case "action-card":
        return this.props.availableActionCards;
      case "procedure":
        return this.props.availableProcedures;
      default:
        return ["?"];
    }
  }

  render() {
    const linkTypes = [
      { value: "drug", label: "Drug" },
      { value: "video", label: "Video" },
      { value: "action-card", label: "Action Card" },
      { value: "procedure", label: "Practical Procedure" },
    ];
    return (
      <section>
        <Dropdown
          auto
          onChange={this.handleChange.bind(this, "linkType")}
          source={linkTypes}
          value={this.state.linkType}
          label="Link Type"
        />
        <Dropdown
          auto
          onChange={this.handleChange.bind(this, "selectedDestination")}
          source={this.state.availableDestinations}
          value={this.state.selectedDestination}
          label="Link Destination"
        />
      </section>
    );
  }
}

export default LinkDestination;
