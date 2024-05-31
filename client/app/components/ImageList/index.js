"use strict";

import React from "react";
import { List, ListItem, ListDivider } from "react-toolbox/lib/list";
import { Input } from "react-toolbox/lib/input";
import ReactPaginate from "react-paginate";
import theme from "./ImageList.scss";
import selectedTheme from "./ImageListSelected.scss";

class ImageList extends React.Component {
  constructor(props) {
    super(props);

    const keys = Array.from(props.images.keys()).sort();
    this.state = {
      filter: "",
      keys: keys,
      selected: keys[0],
      filteredList: keys,
      timeoutHandler: null,
      pageNo: 1,
    };

    this.updateFilter = this.updateFilter.bind(this);
  }

  itemClicked(key) {
    this.setState({ selected: key });
    this.props.onClick && this.props.onClick(key);
  }

  filterList() {
    const { keys, filter: filterText } = this.state;

    const filter = (filterText || "").trim();
    if (!filter) {
      this.setState({ filteredList: keys });
      return;
    }
    const filters = filter.split(" ");
    let result = [];
    for (let f of filters) {
      for (let k of keys) {
        k.toLowerCase().match(new RegExp(f.toLowerCase(), "gi")) &&
          result.push(k);
      }
    }
    this.setState({ filteredList: result });
  }
  myFunction() {
    const { timeoutHandler } = this.state;
    clearTimeout(timeoutHandler);
    const myVar = setTimeout(() => this.filterList(), 500);
    this.setState({ timeoutHandler: myVar });
    myVar();
  }

  updateFilter(val) {
    const { pageNo } = this.state;
    this.setState({ filter: val });
    if (pageNo !== 1) {
      this.setState({ pageNo: 1 });
    }
    this.myFunction();
  }

  render() {
    const { pageNo } = this.state;

    const startIndex = pageNo === 1 ? pageNo - 1 : Math.ceil(pageNo - 1) * 20;
    const endIndex = pageNo === 1 ? 20 : pageNo * 20;

    return (
      <section>
        <section>
          <Input
            value={this.state.filter}
            onChange={this.updateFilter}
            label="Filter list"
          />
        </section>
        <div
          style={{
            maxHeight: "400px",
            overflowY: "scroll",
            marginBottom: "1vw",
          }}
        >
          <List selectable>
            {this.state.filteredList.slice(startIndex, endIndex).map((key) => (
              <ListItem
                key={key}
                avatar={this.props.images.get(key)}
                caption={key}
                theme={key === this.state.selected ? selectedTheme : theme}
                onClick={() => this.itemClicked(key)}
              />
            ))}
            <ListDivider />
          </List>
        </div>
        <div>
          <p>Total Items: {this.state.filteredList.length}</p>
          <div>
            <ReactPaginate
              pageCount={Math.ceil(this.state.filteredList.length / 20)}
              onPageChange={(data) => {
                this.setState({ pageNo: data.selected + 1 });
              }}
              containerClassName={theme.paginate}
              activeClassName={theme.active}
            />
          </div>
        </div>
      </section>
    );
  }
}

export default ImageList;
