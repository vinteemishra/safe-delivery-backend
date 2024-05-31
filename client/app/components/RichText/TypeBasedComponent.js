import React, { Component } from "react";
import ItemTypes from "./ItemTypes";
import RichTextEditor from "./RichTextEditor";

class TypeBasedComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      content: props.content,
    };
  }
  handleKeyUp(input) {
    this.setState({
      content: {
        html: input,
      },
    });
  }

  getRef() {
    if (this.refs.test) return this.refs.test;
  }
  render() {
    const {
      handleInput,
      type,
      id,
      style,
      readOnly,
      imageMap,
      onClick,
      content,
      isMaster,
      isAdapted,
      masterContent,
    } = this.props;
    //const {content} = this.state
    const component = (type) => {
      switch (type) {
        case ItemTypes.FORMULA:
          if (readOnly) {
            content.html = content.html.replace(/contenteditable/g, "");
          }
          return (
            <div>
              <style>
                {
                  ".formula{flex-direction: row;} .fraction{display:table-cell;} .fractionline{height: 3px; background-color: #000;} .subtraction{display:table-cell; vertical-align: middle; height: auto; padding-left: 4px;"
                }
              </style>
              <div
                style={style}
                ref={id}
                onInput={() =>
                  handleInput({ html: this.refs[id].innerHTML }, id)
                }
                className="content"
                dangerouslySetInnerHTML={{ __html: content.html }}
              ></div>
            </div>
          );
        case ItemTypes.DIVIDER:
          return (
            <div
              style={{
                height: 1,
                backgroundColor: "black",
                marginTop: 4,
                marginBottom: 4,
              }}
            />
          );
        case ItemTypes.DIVIDER_NOLINE:
          return (
            <div
              style={{
                height: 1,
                backgroundColor: "white",
                marginTop: 4,
                marginBottom: 4,
              }}
            />
          );
        case ItemTypes.IMAGE:
          return (
            <img
              style={{ maxWidth: 375 }}
              src={imageMap.get(content.src)}
              alt={`Image with key ${content.src}`}
              onClick={() => {
                if (!readOnly) {
                  onClick(id);
                }
              }}
            />
          );
        case ItemTypes.TABLE:
          if (readOnly) {
            content.html = content.html.replace(/contenteditable/g, "");
          }
          return (
            <div>
              <style>
                {
                  "table, th, td{border: 1px solid black;}table{border-collapse: collapse;}.blue{color: blue;}th, td{padding: 5px}"
                }
              </style>
              <div
                style={style}
                ref={id}
                onInput={() =>
                  handleInput({ html: this.refs[id].innerHTML }, id)
                }
                className="content"
                dangerouslySetInnerHTML={{ __html: content.html }}
              ></div>
            </div>
          );
        case ItemTypes.UNORDERED_LIST:
        case ItemTypes.ORDERED_LIST:
          return (
            <RichTextEditor
              style={style}
              handleInput={handleInput}
              type={type}
              content={content}
              id={id}
              noPlaceholder
              readOnly={readOnly}
              masterContent={masterContent}
              isMaster={isMaster}
              isAdapted={isAdapted}
            />
          );
        case ItemTypes.LINK:
          const { text, link } = content;
          return (
            <div style={{ padding: 8 }}>
              <div>
                Link URL:{" "}
                <a
                  href={link}
                  rel="noopener noreferrer nofollow"
                  target="_blank"
                >
                  {link}
                </a>
              </div>
              <div></div>
              <div>Link text:</div>
              <textarea
                value={text}
                onChange={(e) =>
                  handleInput({ text: e.target.value, link }, id)
                }
                disabled={readOnly}
                style={{
                  background: "white",
                  border: "1px solid lightgrey",
                  width: "100%",
                  color: "black",
                }}
              />
            </div>
          );
        default:
          return (
            <RichTextEditor
              style={style}
              handleInput={handleInput}
              type={type}
              content={content}
              id={id}
              readOnly={readOnly}
              masterContent={masterContent}
              isMaster={isMaster}
              isAdapted={isAdapted}
            />
          );
      }
    };
    return <div style={{ flex: 1 }}>{component(type)}</div>;
  }
}

export default TypeBasedComponent;
