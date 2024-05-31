"use strict";
import React from "react";
import { connect } from "react-redux";
import Dropdown from "react-toolbox/lib/dropdown";
import Input from "react-toolbox/lib/input";
import Checkbox from "react-toolbox/lib/checkbox";
import { RadioGroup } from "react-toolbox/lib/radio";
import { RadioButton } from "react-toolbox/lib/radio";
import { ActionCards, Procedures, Drugs } from "lib/sdaAPI";
import { langIdFromRoute } from "lib/util";
import LinkDestination from "./LinkDestination";

import styles from "./KeyLearningPointQuestionForm.scss";

const QuizzAnswer = ({ value, index, type, onChange }) => {
  const input = (
    <Input
      className={styles.inlineInput}
      value={value.value.content}
      hint={`Answer ${index + 1}`}
      onChange={onChange.bind(null, "value")}
    />
  );

  switch (type) {
    case "xoneCorrect":
      return (
        // BUG: RadioButton doesn't seem to work here
        <div>
          <RadioButton
            className={styles.inlineRadio}
            checked={value.correct}
            onChange={onChange.bind(null, "correct")}
          />
          {input}
        </div>
      );
      break;
    case "severalCorrect":
      return (
        <div>
          <Checkbox
            className={styles.inlineCheckbox}
            checked={value.correct}
            onChange={onChange.bind(null, "correct")}
          />
          {input}
        </div>
      );
      break;
    default:
      return input;
  }
};

class KeyLearningPointQuestionForm extends React.Component {
  constructor(props) {
    super(props);

    const v = { ...props.value };

    if (!v.answers) {
      v.answers = Array.from(
        [0, 1, 2, 3].map((i) => ({ correct: false, value: { content: "" } }))
      );
      v.question = { content: "" };
      v.description = { content: "" };
      v.quizzType = "chooseOrder";
    }

    const radioIndex = v.answers.findIndex((a) => a.correct);

    this.state = {
      procedures: [],
      drugs: [],
      actionCards: [],
      question: v,
      radioValue: "" + radioIndex,
    };
  }

  quizzTypes = [
    { value: "oneCorrect", label: "One correct answer" },
    {
      value: "severalCorrect",
      label: "Possibility for several correct answers",
    },
    { value: "chooseOrder", label: "Choose correct order" },
  ];

  componentWillMount() {
    Procedures.all(this.props.langId).then((ps) => {
      console.log("got procs", ps);
      this.setState({ procedures: ps });
    });

    Drugs.all(this.props.langId).then((ds) => {
      console.log("got drugs", ds);
      this.setState({ drugs: ds });
    });

    ActionCards.all(this.props.langId).then((cards) => {
      console.log("got actionCards", cards);
      this.setState({ actionCards: cards });
    });
  }

  handleChange(name, value) {
    const q = this.state.question;
    let answers = q.answers;

    if (name === "quizzType" && value === "oneCorrect") {
      // Clear other values when type is radio
      const newAnswers = [...answers];
      newAnswers[0].correct = true;
      [1, 2, 3].forEach((i) => (newAnswers[i].correct = false));
      answers = newAnswers;
    }

    // Special case for nested translatable properties
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

  handleRadioChange(value) {
    const newAnswers = [...this.state.question.answers];

    for (let i = 0; i < 4; i++) {
      newAnswers[i].correct = false;
    }
    newAnswers[value].correct = true;
    this.setState({
      radioValue: value,
      question: { ...this.state.question, answers: newAnswers },
    });
  }

  render() {
    const q = this.state.question;
    const images = Array.from(this.props.images.keys())
      .sort()
      .map((k) => ({ value: k, label: k }));

    const videoKeys = Array.from(this.props.videos.keys());
    const noPrefix = videoKeys.map(
      (k) => "/" + k.split("/").splice(2).join("/")
    );
    const uniqueVideos = new Set(noPrefix);
    const availableVideos = [...uniqueVideos]
      .sort()
      .map((v) => ({ value: v, label: v }));

    const isLoaded =
      this.state.drugs.length > 0 &&
      this.state.procedures.length > 0 &&
      this.state.actionCards.length > 0;

    return (
      <section>
        {isLoaded && (
          <section>
            <Input
              value={q.question.content}
              onChange={this.handleChange.bind(this, "question")}
              required={true}
              label="Quizz Text"
            />

            <h4>Answers</h4>
            <br />
            <Dropdown
              value={q.quizzType}
              auto
              allowBlank={false}
              onChange={this.handleChange.bind(this, "quizzType")}
              source={this.quizzTypes}
              required={true}
              label="Quiz Type"
            />

            {q.quizzType === "oneCorrect" && (
              <RadioGroup
                name="xx"
                value={this.state.radioValue}
                onChange={this.handleRadioChange.bind(this)}
              >
                <RadioButton
                  className={styles.inlineRadio}
                  label=""
                  value="0"
                />
                <Input
                  className={styles.inlineInput}
                  value={q.answers[0].value.content}
                  hint={`Answer 1`}
                  onChange={this.handleAnswerChange.bind(this, 0, "value")}
                />

                <RadioButton
                  className={styles.inlineRadio}
                  label=""
                  value="1"
                />
                <Input
                  className={styles.inlineInput}
                  value={q.answers[1].value.content}
                  hint={`Answer 2`}
                  onChange={this.handleAnswerChange.bind(this, 1, "value")}
                />

                <RadioButton
                  className={styles.inlineRadio}
                  label=""
                  value="2"
                />
                <Input
                  className={styles.inlineInput}
                  value={q.answers[2].value.content}
                  hint={`Answer 3`}
                  onChange={this.handleAnswerChange.bind(this, 2, "value")}
                />

                <RadioButton
                  className={styles.inlineRadio}
                  label=""
                  value="3"
                />
                <Input
                  className={styles.inlineInput}
                  value={q.answers[3].value.content}
                  hint={`Answer 4`}
                  onChange={this.handleAnswerChange.bind(this, 3, "value")}
                />
              </RadioGroup>
            )}
            {q.quizzType !== "oneCorrect" &&
              [0, 1, 2, 3].map((i) => (
                <QuizzAnswer
                  value={q.answers[i]}
                  key={i}
                  index={i}
                  type={q.quizzType}
                  onChange={this.handleAnswerChange.bind(this, i)}
                />
              ))}

            <h4>Configuration</h4>
            <br />
            <Checkbox
              label="Essential question"
              checked={q.essential}
              onChange={this.handleChange.bind(this, "essential")}
            />

            <Dropdown
              allowBlank={false}
              label="Choose image"
              source={images}
              value={q.image}
              onChange={this.handleChange.bind(this, "image")}
            />
            <section>
              <Checkbox
                label="Show image toggle"
                checked={q.showToggle}
                onChange={this.handleChange.bind(this, "showToggle")}
              />
              <LinkDestination
                onChange={this.handleChange.bind(this, "link")}
                value={q.link}
                availableVideos={availableVideos}
                availableDrugs={this.state.drugs.map((d) => ({
                  value: d.key,
                  label: d.description,
                }))}
                availableActionCards={this.state.actionCards.map((d) => ({
                  value: d.key,
                  label: d.description,
                }))}
                availableProcedures={this.state.procedures.map((d) => ({
                  value: d.key,
                  label: d.description,
                }))}
              />
            </section>
            <Input
              value={q.description.content}
              multiline={true}
              rows={5}
              onChange={this.handleChange.bind(this, "description")}
              required={true}
              label="Description"
            />
          </section>
        )}
      </section>
    );
  }
}

const mapStateToProps = (state) => ({
  langId: langIdFromRoute(state),
  images: state.images.images,
  videos: state.videos.videos,
});

export default connect(mapStateToProps)(KeyLearningPointQuestionForm);
