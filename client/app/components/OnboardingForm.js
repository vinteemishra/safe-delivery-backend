"use strict";
import React from "react";
import { connect } from "react-redux";
import { translatedFontStyle, langIdFromRoute } from "lib/util";
import { Onboarding } from "lib/sdaAPI";
import Input from "react-toolbox/lib/input";
import Button from "react-toolbox/lib/button";
import { ListSubHeader } from "react-toolbox/lib/list";

function Header(props) {
  if (!props.show) {
    return null;
  }

  return (
    <thead>
      <tr>
        <th>&nbsp;</th>
        <th>Master</th>
        <th>Adapted</th>
        <th>Translated</th>
      </tr>
    </thead>
  );
}

class OnboardingForm extends React.Component {
  constructor(props) {
    super(props);

    this.handleAnswerChange = this.handleAnswerChange.bind(this);
    this.deleteAnswer = this.deleteAnswer.bind(this);

    this.state = {
      onboarding: null,
      description: "",
      answers: [],
      translatedFontStyle: translatedFontStyle(props.langId),
      dialogActive: false,
      langId: props.langId,
    };
  }

  isMaster() {
    return this.props.langId === "";
  }

  componentWillMount() {
    Onboarding.get(this.props.onbKey, this.props.langId)
      .then((docs) => {
        console.log("all docs", docs);
        if (docs.length > 0) {
          let doc = docs[0];
          this.setState({
            onboarding: doc,
            description: doc.description.content,
            question: doc.question.content,
            questionAdapted: doc.question.adapted || doc.question.content,
            questionTranslated: doc.question.translated || doc.question.content,
            answers: doc.answers,
          });
        }
      })
      .catch((err) => console.error(err));
  }

  handleChange(name, value) {
    this.setState({ ...this.state, [name]: value });
  }

  handleAnswerChange(index, value, from) {
    const answers = [...this.state.answers];

    if (from === "adapted") {
      answers[index].adapted = value;
      return this.setState({ answers });
    } else if (from === "translated") {
      answers[index].translated = value;
      return this.setState({ answers });
    } else if (from === "content") {
      answers[index].content = value;
      return this.setState({ answers });
    }
  }

  handleSave() {
    const s = this.state;

    const not = !this.isMaster()
      ? {
          //If on a laungurage version, then save with adapted and translated
          ...s.onboarding,
          question: {
            content: s.question,
            adapted: s.questionAdapted,
            translated: s.questionTranslated,
          },
          answers: s.answers,
        }
      : {
          //If on a master, then save only the content
          ...s.onboarding,
          description: { content: s.description },
          question: { content: s.question },
          answers: s.answers,
        };
    Onboarding.put(not).then((r) => {
      console.log("saved onboarding", r);
      this.setState({ onboarding: r });
    });
  }

  addAnswer() {
    this.setState({
      answers: this.state.answers.concat([{ content: "" }]),
    });
  }

  deleteAnswer() {
    this.setState({
      answer: this.state.answers.splice(this.state.answers.length - 1, 1),
    });
  }

  renderAnswerForm() {
    return this.state.answers.map((answer, index) => {
      return (
        <tr key={index}>
          <td style={{ width: "20%" }}>Answer</td>
          <td>
            {" "}
            <Input
              type="text"
              label={this.isMaster() ? "Here goes the text for an answer" : ""}
              disabled={this.props.langId !== ""}
              value={answer.content || ""}
              onChange={(value) =>
                this.handleAnswerChange(index, value, "content")
              }
            />{" "}
          </td>
          {this.props.langId !== "" && (
            <td>
              {" "}
              <Input
                type="text"
                disabled={this.props.role === "translator"}
                value={answer.adapted || ""}
                onChange={(value) =>
                  this.handleAnswerChange(index, value, "adapted")
                }
              />{" "}
            </td>
          )}
          {this.props.langId !== "" && (
            <td>
              {" "}
              <Input
                type="text"
                value={answer.translated || ""}
                style={this.state.translatedFontStyle}
                onChange={(value) =>
                  this.handleAnswerChange(index, value, "translated")
                }
              />{" "}
            </td>
          )}
          <td>
            {this.isMaster() && this.state.answers.length - 1 === index && (
              <Button icon="delete" onClick={() => this.deleteAnswer()} />
            )}
          </td>
        </tr>
      );
    });
  }

  render() {
    const s = this.state;

    if (!this.state.onboarding) {
      return null;
    }

    return (
      <div>
        <h2>Onboarding</h2>
        <div className="grid grid-with-gutter">
          <div className="grid-cell grid-3 ">
            <table style={{ width: "100%" }}>
              <Header show={this.props.langId !== ""} />
              <tbody>
                {this.isMaster() && (
                  <tr>
                    <td style={{ width: "20%" }}>Description</td>
                    <td>
                      <Input
                        type="text"
                        multiline={true}
                        label={
                          this.isMaster()
                            ? "Enter the name of the Onboarding Screen"
                            : ""
                        }
                        disabled={this.props.langId !== ""}
                        name="description"
                        value={s.description || ""}
                        onChange={this.handleChange.bind(this, "description")}
                      />
                    </td>
                  </tr>
                )}
                {this.isMaster() ||
                s.question ||
                s.questionAdapted ||
                s.questionTranslated ? (
                  <tr>
                    <td style={{ width: "20%" }}>Question</td>
                    <td>
                      <Input
                        type="text"
                        multiline={true}
                        label={
                          this.isMaster()
                            ? "Enter the text for the question"
                            : ""
                        }
                        disabled={this.props.langId !== ""}
                        name="question"
                        value={s.question || ""}
                        onChange={this.handleChange.bind(this, "question")}
                      />
                    </td>
                    {this.props.langId !== "" && (
                      <td>
                        <Input
                          type="text"
                          multiline={true}
                          disabled={this.props.role === "translator"}
                          value={s.questionAdapted || ""}
                          onChange={this.handleChange.bind(
                            this,
                            "questionAdapted"
                          )}
                        />
                      </td>
                    )}
                    {this.props.langId !== "" && (
                      <td>
                        <Input
                          type="text"
                          multiline={true}
                          style={this.state.translatedFontStyle}
                          spellCheck="false"
                          value={s.questionTranslated || ""}
                          onChange={this.handleChange.bind(
                            this,
                            "questionTranslated"
                          )}
                        />
                      </td>
                    )}
                  </tr>
                ) : null}
                <ListSubHeader caption="Answers" />
                {this.renderAnswerForm()}
                <div>
                  {this.isMaster() && (
                    <Button
                      icon="add"
                      label="Add answer"
                      onClick={this.addAnswer.bind(this)}
                    />
                  )}
                </div>
              </tbody>
            </table>
          </div>
          <br />
          <div className="grid-cell grid-right grid-3">
            {this.isMaster() && (
              <Button
                icon="ic_save"
                label="Save"
                raised
                primary
                onClick={this.handleSave.bind(this)}
              />
            )}
            {!this.isMaster() && (
              <Button
                icon="ic_save"
                label="Save_lang"
                raised
                primary
                onClick={this.handleSave.bind(this)}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  langId: langIdFromRoute(state),
  images: state.images.images,
  role: state.auth.auth.role,
  onbKey: state.router.params.onbKey || "Unknown",
});

const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(OnboardingForm);
