import React from "react";
import styles from "./style.scss";
import { Button } from "react-toolbox/lib/button";

class Modal extends React.Component {
  render() {
    const { show, component, onClose, title, actions } = this.props;
    console.log(actions);
    return (
      <div
        id="myModal"
        className={styles.modal}
        style={{
          visibility: show ? "visible" : "hidden",
          opacity: show ? 1 : 0,
        }}
      >
        <div className={styles.modalcontent}>
          <div style={{ marginBottom: "2rem" }}>
            <span
              style={{
                padding: "1rem 1rem 1rem 0rem",
                fontSize: "1.05vw",
                fontWeight: "500",
              }}
            >
              {title}
            </span>
          </div>
          {component}
          <div
            style={{
              padding: "0.75vw",
              display: "flex",
              justifyContent: "end",
            }}
          >
            {[
              actions.map((element) => (
                <Button onClick={element.onClick}> {element.label}</Button>
              )),
            ]}
          </div>
        </div>
      </div>
    );
  }
}

export default Modal;
