import React from "react";
import { LogActions } from "../lib/sdaAPI";
import { Card, CardText, CardTitle } from "react-toolbox/lib/card";
import ReactPaginate from "react-paginate";
import STYLES from "./ImageList/ImageList.scss";
import ProgressBar from "react-toolbox/lib/progress_bar";
import * as styles from "./Actions.scss";
import JSONTree from "react-json-tree";

class Actions extends React.Component {
  state = {
    items: null,
    count: 0,
    pageNo: 1,
    showLoader: true,
  };

  fetchActions = async (pageNo) =>
    await LogActions.getActions(pageNo).then((result) =>
      this.setState({
        items: result.items,
        count: result.count,
      })
    );

  componentDidMount() {
    this.state.items === null &&
      this.fetchActions(1).then(() => this.setState({ showLoader: false }));
  }

  getBodyString = (body) => {
    let retval = "";
    const bodyKeys = Object.keys(body);
    for (var i = 0; i < bodyKeys.length; i++) {
      retval += ` ${bodyKeys[i]}=${JSON.stringify(body[bodyKeys[i]])} |`;
    }
    retval = retval.substring(0, retval.length - 1);
    return retval;
  };
  render() {
    console.log(this.state.items);

    return (
      <Card>
        <CardTitle title="CMS Logs" />
        <CardText>
          {this.state.showLoader || this.state.items === null ? (
            <ProgressBar mode="indeterminate" />
          ) : (
            <div>
              <strong> Total Logs: {this.state.count}</strong>
              <div style={{ height: "40rem", overflowY: "scroll" }}>
                <table
                  style={{ textAlign: "center", width: "100%" }}
                  className={styles.actionTable}
                >
                  <thead>
                    <tr>
                      <th>METHOD</th>
                      <th>URL</th>
                      <th>BODY</th>
                      <th>STATUS</th>
                      <th>MESSAGE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.items.map((key, index) => (
                      <tr key={`activity-log-${index}`}>
                        <td>{`${key.method}`}</td>
                        <td>{`${key.url}`}</td>
                        {/* <td>{JSON.stringify()}</td> */}
                        <td>
                          <JSONTree
                            data={key.body || key.bodyParams}
                            theme={{
                              scheme: "monokai",
                              author: "wimer hazenberg (http://www.monokai.nl)",
                              base00: "#272822",
                              base01: "#383830",
                              base02: "#49483e",
                              base03: "#75715e",
                              base04: "#a59f85",
                              base05: "#f8f8f2",
                              base06: "#f5f4f1",
                              base07: "#f9f8f5",
                              base08: "#f92672",
                              base09: "#fd971f",
                              base0A: "#f4bf75",
                              base0B: "#a6e22e",
                              base0C: "#a1efe4",
                              base0D: "#66d9ef",
                              base0E: "#ae81ff",
                              base0F: "#cc6633",
                            }}
                            labelRenderer={([key]) => <strong>{key}</strong>}
                            hideRoot={true}
                          />
                        </td>
                        <td>{`${key.response.status}`}</td>
                        <td>{`${key.response.message}`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <ReactPaginate
            pageCount={Math.ceil(this.state.count / 20)}
            onPageChange={async (data) => {
              this.setState({ showLoader: true });
              this.fetchActions(data.selected + 1).then(() =>
                this.setState({
                  pageNo: data.selected + 1,
                  showLoader: false,
                })
              );
            }}
            containerClassName={STYLES.paginate}
            activeClassName={STYLES.active}
          />
        </CardText>
      </Card>
    );
  }
}

export default Actions;
