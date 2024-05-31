import React, { Component } from "react";
import Input from "react-toolbox/lib/input";
import { Search } from "../lib/sdaAPI";
import { debounce } from "lodash";
import ProgressBar from "react-toolbox/lib/progress_bar";
import { PUSH } from "redux-little-router";
import { connect } from "react-redux";
import { Card } from "react-toolbox/lib/card";
import Dropdown from "react-toolbox/lib/dropdown";
import * as styles from "./GlobalSearch.scss";

class GlobalSearch extends Component {
  constructor(props) {
    super(props);
  }
  state = {
    searchString: "",
    searchResults: [],
    loadingSearch: false,
    showSuggestions: false,
    searchType: null,
  };

  render() {
    const { push } = this.props;

    const search = (searchString, searchType) => {
      this.setState({ searchString });
      if (searchString.length > 2) {
        this.setState({ loadingSearch: true });
        Search.search(searchString, searchType)
          .then((result) => this.setState({ searchResults: result }))
          .then(() => this.setState({ loadingSearch: false }));
      }
    };

    const {
      showSuggestions,
      searchResults,
      loadingSearch,
      searchString,
      searchType,
    } = this.state;

    return (
      <section
        style={{
          border: "1px solid #CDCDCD",
          padding: 20,
          marginBottom: 10,
          display: "flex",
        }}
      >
        <div style={{ position: "relative", width: "83.5%" }}>
          <Input
            label="Search Action Cards, Practical Procedures & Drugs"
            onChange={(searchString) => search(searchString, searchType)}
            value={searchString}
            onFocus={() => this.setState({ showSuggestions: true })}
            onBlur={() => this.setState({ showSuggestions: false })}
          >
            {showSuggestions && (
              <Card
                style={{
                  position: "absolute",
                  backgroundColor: "white",
                  zIndex: 1000,
                  width: "100%",
                  top: 60,
                  maxHeight: 400,
                  overflowY: "scroll",
                }}
              >
                {searchResults &&
                searchString.length >= 3 &&
                searchResults.length > 0 ? (
                  <div
                    style={{
                      paddingLeft: 10,
                      paddingRight: 10,
                      paddingBottom: 5,
                    }}
                  >
                    <div>
                      <p style={{ color: "red" }}>
                        Total Results: {searchResults.length}
                      </p>
                    </div>
                    {searchResults.map((element) => (
                      <div
                        key={`${element.key}`}
                        className={styles.searchitem}
                        onMouseDown={() =>
                          push(`/masters/${element._table}/${element.key}`)
                        }
                        style={{
                          cursor: "pointer",
                          paddingBottom: 10,
                          paddingTop: 10,
                        }}
                      >
                        <p
                          style={{
                            textTransform: "capitalize",
                            paddingLeft: 5,
                            paddingRight: 5,
                          }}
                        >
                          {element.description}{" "}
                          <span style={{ fontWeight: "bold" }}>
                            [{element._table}]
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p
                    style={{
                      padding: 20,
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {searchString.length >= 3
                      ? loadingSearch
                        ? "Fetching Search Results"
                        : "No Search Results Found"
                      : "Type More Than 3 Alphabets to Search"}
                  </p>
                )}
              </Card>
            )}
          </Input>
          {loadingSearch && (
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 20,
              }}
            >
              <ProgressBar type="circular" mode="indeterminate" multicolor />
            </div>
          )}
        </div>
        <Dropdown
          auto
          onChange={(value) => {
            this.setState({ searchType: value });
            search(searchString, value);
          }}
          style={{ marginLeft: "10%" }}
          source={[
            { value: null, label: "All" },
            { value: "action-cards", label: "Action Cards" },
            { value: "procedures", label: "Practical Procedures" },
            { value: "drugs", label: "Drugs" },
          ]}
          value={this.state.searchType}
        />
      </section>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  push: (loc) => {
    dispatch({ type: PUSH, payload: loc });
  },
});

export default connect(null, mapDispatchToProps)(GlobalSearch);
