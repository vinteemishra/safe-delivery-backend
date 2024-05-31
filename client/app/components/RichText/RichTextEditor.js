"use strict";

import {
  convertFromRaw,
  convertToRaw,
  Editor,
  EditorState,
  RichUtils,
} from "draft-js";
import React from "react";
import { connect } from "react-redux";
import { langIdFromRoute, ARABIC } from "../../lib/util";
import ItemType from "./ItemTypes";
import StyleButton from "./StyleButton";

class RichTextEditor extends React.Component {
  constructor(props) {
    super(props);

    // this.state = (this.props.content.blocks) ? {editorState: EditorState.createWithContent(convertFromRaw(contentState))} : {editorState:EditorState.createEmpty()}
    this.state = props.content.blocks
      ? {
          editorState: EditorState.createWithContent(
            convertFromRaw(this.props.content)
          ),
        }
      : { editorState: this.createEmpty(props.type) };

    //this.toggleBlockType(this.props.type)

    this.onChange = (change) => {
      this.setState({ editorState: change });
      this.props.handleInput(
        convertToRaw(this.state.editorState.getCurrentContent()),
        this.props.id
      );
    };
    this.handleKeyCommand = this.handleKeyCommand.bind(this);
    this.toggleInlineStyle = this.toggleInlineStyle.bind(this);
    this.getModifiedStyle = this.getModifiedStyle.bind(this);
    this.getTextAlign = this.getTextAlign.bind(this);
  }

  createEmpty(type) {
    let contentState;
    switch (type) {
      case ItemType.UNORDERED_LIST:
        contentState = {
          entityMap: {},
          blocks: [
            {
              key: "18ql9",
              text: "",
              type: "unordered-list-item",
              depth: 0,
              inlineStyleRanges: [],
              entityRanges: [],
            },
          ],
        };
        return EditorState.createWithContent(convertFromRaw(contentState));
      case ItemType.ORDERED_LIST:
        contentState = {
          entityMap: {},
          blocks: [
            {
              key: "18ql9",
              text: "",
              type: "ordered-list-item",
              depth: 0,
              inlineStyleRanges: [],
              entityRanges: [],
            },
          ],
        };
        return EditorState.createWithContent(convertFromRaw(contentState));
      default:
        return EditorState.createEmpty();
    }
  }
  onBoldClick() {
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, "BOLD"));
  }
  onColorClick() {
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, "BLUE"));
  }
  onResetClick() {
    this.onChange(
      EditorState.push(
        this.state.editorState,
        convertFromRaw(this.props.masterContent)
      )
    );
    setTimeout(() => this.focus(), 100);
  }
  handleKeyCommand(command) {
    const newState = RichUtils.handleKeyCommand(
      this.state.editorState,
      command
    );
    if (newState) {
      this.onChange(newState);
      return "handled";
    }
    return "not-handled";
  }
  toggleInlineStyle(inlineStyle) {
    this.onChange(
      RichUtils.toggleInlineStyle(this.state.editorState, inlineStyle)
    );
  }

  toggleBlockType(type) {
    let blockType;
    switch (type) {
      case ItemType.UNORDERED_LIST:
        blockType = "unordered-list-item";
        RichUtils.toggleBlockType(this.state.editorState, blockType);
        break;
      case ItemType.ORDERED_LIST:
        blockType = "ordered-list-item";
        RichUtils.toggleBlockType(this.state.editorState, blockType);
        break;
    }
  }
  focus() {
    this.refs.editor.focus();
  }

  isEqual(a, b) {
    if (a === undefined || b === undefined) {
      return a === b;
    }
    return JSON.stringify(a.blocks) === JSON.stringify(b.blocks);
  }

  getModifiedStyle(content) {
    const { indicateMasterDifferences, isAdapted, masterContent } = this.props;
    // Does this language even care?
    if (!indicateMasterDifferences) {
      return {};
    }
    // We only care about the adapted column
    if (!isAdapted) {
      return {};
    }
    if (content === undefined || masterContent === undefined) {
      return {};
    }
    if (this.isEqual(content, masterContent)) {
      return {};
    }

    return { backgroundColor: "#ffc1c1" };
  }

  getTextAlign() {
    const { isMaster, isAdapted, langId } = this.props;
    if (!isMaster && !isAdapted && langId === ARABIC) {
      return "right";
    }
    return "left";
  }

  render() {
    const { type, style, isMaster, readOnly } = this.props;
    const { editorState } = this.state;
    const cardStyle = getCardStyle(type);
    const textAlign = this.getTextAlign();

    const currentContent = convertToRaw(
      this.state.editorState.getCurrentContent()
    );
    const modifiedStyle = this.getModifiedStyle(currentContent);

    return (
      <div style={{ ...style, ...cardStyle, ...modifiedStyle }}>
        {(type == ItemType.PARAGRAPH ||
          type == ItemType.UNORDERED_LIST ||
          type == ItemType.ORDERED_LIST) &&
        !readOnly ? (
          <InlineStyleControls
            editorState={editorState}
            onToggle={this.toggleInlineStyle}
            onResetClick={this.onResetClick.bind(this)}
            isMaster={isMaster}
          />
        ) : (
          <div style={{ paddingBottom: 30 }} />
        )}
        <Editor
          textAlignment={textAlign}
          stripPastedStyles={true}
          handleDrop={() => true}
          editorState={editorState}
          onChange={this.onChange}
          handleKeyCommand={
            type == ItemType.PARAGRAPH ||
            type == ItemType.ORDERED_LIST ||
            type == ItemType.UNORDERED_LIST
              ? this.handleKeyCommand
              : null
          }
          customStyleMap={styleMap}
          placeholder={
            this.props.noPlaceholder
              ? null
              : this.props.type + ", " + this.props.id
          }
          spellCheck={false}
          readOnly={readOnly}
          ref="editor"
          stripPastedStyles={true}
        />
      </div>
    );
  }
}

const INLINE_STYLES = [
  { label: "Bold", style: "BOLD" },
  { label: "Blue", style: "BLUE" },
];

const InlineStyleControls = (props) => {
  var currentStyle = props.editorState.getCurrentInlineStyle();
  return (
    <div style={{ paddingBottom: 10, fontFamily: "Roboto, sans-serif" }}>
      {INLINE_STYLES.map((type) => (
        <StyleButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      ))}
      {!props.isMaster ? (
        <span
          style={{ color: "red", marginLeft: 20 }}
          onClick={() => props.onResetClick()}
        >
          Reset
        </span>
      ) : null}
      <div
        style={{ height: 1, width: "100%", backgroundColor: "rgba(0,0,0,.5)" }}
      />
    </div>
  );
};

const styleMap = {
  BLUE: {
    color: "blue",
  },
};

const getCardStyle = (type) => {
  switch (type) {
    case ItemType.HEADER:
      return { fontSize: "1.5em", fontWeight: "bold" };
    case ItemType.SUBHEADER:
      return { fontSize: "1.2em", fontWeight: "bold" };
    case ItemType.IMPORTANT_TEXT:
      return { color: "red", textAlign: "center" };
    case ItemType.ALPHABETICAL_HEADER:
      return { color: "blue", fontWeight: "bold", fontSize: "1.2em" };
    default:
      return {};
  }
};

// TODO: Maybe look into moving this connection outside of the actual editor.
//       May cause some performance issues.
const mapStateToProps = (state) => {
  const langId = langIdFromRoute(state);
  const language = state.lang.languages.find((l) => l.id === langId);
  const indicateMasterDifferences =
    language && language.indicateMasterDifferences;

  return {
    indicateMasterDifferences,
    langId,
  };
};

export default connect(mapStateToProps)(RichTextEditor);
