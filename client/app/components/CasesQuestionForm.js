"use strict";
import React from "react";
import { connect } from "react-redux";
import Dropdown from "react-toolbox/lib/dropdown";
import Input from "react-toolbox/lib/input";
import { Button } from "react-toolbox/lib/button";
import { langIdFromRoute } from "lib/util";

const QuizzAnswer = ({ value, index, type, onChange }) => {
  const input = (
    <Input
      value={value.value.content}
      hint={`Answer ${index + 1}`}
      onChange={onChange.bind(null, "value")}
    />
  );

  const types = [
    { value: "correct", label: "Correct" },
    { value: "neutral", label: "Neutral" },
    { value: "harmful", label: "Harmful" },
    { value: "critically_harmful", label: "Critically harmful" },
    { value: "deadly", label: "Deadly" },
  ];
  return (
    <div style={{ display: "flex" }}>
      <div style={{ flexGrow: 1 }}>
        <Dropdown
          value={value.result}
          allowBlank={false}
          onChange={onChange.bind(this, "result")}
          source={types}
          required={true}
          label="Answer type"
        />
        {/* <Checkbox  checked={value.correct} onChange={onChange.bind(null, 'correct')}/> */}
      </div>
      <div style={{ flexGrow: 3 }}>{input}</div>
    </div>
  );
};

class CasesQuestionForm extends React.Component {
  constructor(props) {
    super(props);

    const v = { ...props.value };

    if (!v.answers) {
      v.answers = Array.from(
        [0, 1].map((_) => ({ result: "correct", value: { content: "" } }))
      );
      v.question = { content: "" };
      v.description = { content: "" };
    }
    v.quizzType = "severalCorrectWithResult";

    this.state = {
      question: v,
    };
  }

  componentWillMount() {}

  handleChange(name, value) {
    const q = this.state.question;
    let answers = q.answers;

    // Special case for nested translateable properties
    const prop = q[name];
    let newVal = value;
    console.log("type", typeof prop, name, value);
    if (typeof prop === "object") {
      newVal = { ...prop, content: value };
    }
    const newQ = { ...q, answers: answers, [name]: newVal };

    this.setState({ question: newQ });
    this.props.onChange(newQ);
  }

  handleAnswerChange(index, name, value) {
    const newAnswers = [...this.state.question.answers];

    if (name === "value") {
      newAnswers[index][name].content = value;
    } else {
      newAnswers[index][name] = value;
    }
    this.setState({
      question: { ...this.state.question, answers: newAnswers },
    });
  }

  addAnswer() {
    let newAnswers = [
      ...this.state.question.answers,
      { result: "correct", value: { content: "" } },
    ];
    let newQuestion = { ...this.state.question, answers: newAnswers };
    this.setState({ question: newQuestion });
    this.props.onChange(newQuestion);
  }

  removeAnswer() {
    let newAnswers = this.state.question.answers;
    newAnswers.splice(-1);
    let newQuestion = { ...this.state.question, answers: newAnswers };
    this.setState({ question: newQuestion });
    this.props.onChange(newQuestion);
  }

  render() {
    const q = this.state.question;
    const images = Array.from(this.props.images.keys())
      .sort()
      .map((k) => ({ value: k, label: k }));

    return (
      <section>
        <Input
          value={q.question.content}
          onChange={this.handleChange.bind(this, "question")}
          required={true}
          label="Quizz Text"
        />
        {q.answers.map((a, i) => (
          <QuizzAnswer
            value={a}
            key={i}
            index={i}
            type={q.quizzType}
            onChange={this.handleAnswerChange.bind(this, i)}
          />
        ))}
        <Button
          label="Add answer"
          icon="add"
          flat
          primary
          onClick={this.addAnswer.bind(this)}
        />
        {q.answers && q.answers.length > 2 && (
          <Button
            label="Remove last answer"
            icon="remove"
            flat
            onClick={this.removeAnswer.bind(this)}
          />
        )}
        <Dropdown
          allowBlank={false}
          label="Choose image"
          source={images}
          value={q.image}
          onChange={this.handleChange.bind(this, "image")}
        />
        <Input
          value={q.description.content}
          multiline={true}
          rows={5}
          onChange={this.handleChange.bind(this, "description")}
          required={true}
          label="Description"
        />
      </section>
    );
  }
}

const mapStateToProps = (state) => ({
  langId: langIdFromRoute(state),
  images: state.images.images,
  videos: state.videos.videos,
});

export default connect(mapStateToProps)(CasesQuestionForm);
