"use strict";
import React from "react";
import { translatedFontStyle, langIdFromRoute } from "lib/util";
import Input from "react-toolbox/lib/input";
import Button from "react-toolbox/lib/button";
import { setWindowTitle } from "../lib/util";

const Translate = ({
  title,
  subtitle,
  value,
  onChange,
  langId,
  role,
  rows,
  multiline,
}) => {
  const translatedStyle = translatedFontStyle(langId);
  subtitle = subtitle || "";
  return (
    <tr>
      <td>
        {title}
        <br />
        <small>{subtitle}</small>
      </td>
      <td>
        <Input
          value={value.content}
          onChange={onChange.bind(null, "content")}
          rows={rows}
          multiline={multiline}
          type="text"
          disabled={langId !== ""}
        />{" "}
      </td>
      {langId !== "" && (
        <td>
          <Input
            value={value.adapted}
            onChange={onChange.bind(null, "adapted")}
            rows={rows}
            multiline={multiline}
            type="text"
            disabled={role === "translator"}
          />
        </td>
      )}
      {langId !== "" && (
        <td>
          <Input
            value={value.translated}
            style={translatedStyle}
            onChange={onChange.bind(null, "translated")}
            rows={rows}
            multiline={multiline}
            type="text"
            spellCheck="false"
          />
        </td>
      )}
    </tr>
  );
};

function Header(props) {
  if (!props.show) {
    return null;
  }

  return (
    <thead>
      <tr>
        <th style={{ width: "20%" }}>&nbsp;</th>
        <th>Master</th>
        <th>Adapted</th>
        <th>Translated</th>
      </tr>
    </thead>
  );
}

export const withTranslatedQuestions = (api) =>
  class extends React.Component {
    constructor(props) {
      super(props);
      this.api = api;
      this.state = {};
    }

    componentWillMount() {
      this.api.get(this.props.parentKey, this.props.langId).then((docs) => {
        console.log("all docs", docs);
        if (docs.length > 0) {
          let doc = docs[0];
          const question = doc.questions.find(
            (q) => q.key === this.props.questionKey
          );
          if (question.question) {
            setWindowTitle(question.question.content);
          }
          this.setState({ question: question, parent: doc });
        }
      });
    }

    handleAnswerChange(index, section, value) {
      const newAnswers = [...this.state.question.answers];

      newAnswers[index].value[section] = value;
      this.setState({
        question: { ...this.state.question, answers: newAnswers },
      });
    }

    handleChange(property, section, value) {
      const prop = { ...this.state.question[property] };
      const newProp = { ...prop, [section]: value };

      this.setState({
        question: { ...this.state.question, [property]: newProp },
      });
    }

    handleSave() {
      const q = this.state.question;
      const qs = [...this.state.parent.questions];
      const index = qs.findIndex((k) => k.key === q.key);
      qs[index] = q;

      this.api.put({ ...this.state.parent, questions: qs }).then((r) => {
        console.log("saved parent", r);
        this.setState({ klp: r });
      });
    }

    render() {
      const q = this.state.question;

      return !this.state.parent ? null : (
        <div>
          <h2>Question</h2>
          <div className="grid grid-with-gutter">
            <div className="grid-cell grid-3 ">
              <table style={{ width: "100%" }}>
                <Header show={this.props.langId !== ""} />
                <tbody>
                  <Translate
                    onChange={this.handleChange.bind(this, "question")}
                    title="Question"
                    value={q.question}
                    langId={this.props.langId}
                    role={this.props.role}
                  />
                  {q.answers.map((a, i) => {
                    const subtitle = a.result
                      ? "(" + a.result + ")"
                      : a.correct
                      ? "(correct)"
                      : "(wrong)";
                    return (
                      <Translate
                        key={i}
                        onChange={this.handleAnswerChange.bind(this, i)}
                        multiline={true}
                        rows={2}
                        title={`Answer ${i + 1}`}
                        subtitle={subtitle}
                        value={a.value}
                        langId={this.props.langId}
                        role={this.props.role}
                      />
                    );
                  })}
                  <Translate
                    onChange={this.handleChange.bind(this, "description")}
                    multiline={true}
                    rows={4}
                    title="Description"
                    value={q.description}
                    langId={this.props.langId}
                    role={this.props.role}
                  />
                </tbody>
              </table>
            </div>
            <div className="grid-cell grid-right grid-3">
              <Button
                icon="ic_save"
                label="Save"
                raised
                primary
                onClick={this.handleSave.bind(this)}
              />
            </div>
          </div>
        </div>
      );
    }
  };

export const mapStateToProps = (state) => ({
  langId: langIdFromRoute(state),
  images: state.images.images,
  role: state.auth.auth.role,
  parentKey: state.router.params.parentKey || "Unknown",
  questionKey: state.router.params.questionKey || "Unknown",
});
