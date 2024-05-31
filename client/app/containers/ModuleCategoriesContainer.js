import React, { Component } from "react";
import { ModuleCategories } from "../lib/sdaAPI";
import { connect } from "react-redux";
import ProgressBar from "react-toolbox/lib/progress_bar";
import {
  List,
  ListDivider,
  ListItem,
  ListSubHeader,
} from "react-toolbox/lib/list";
import Checkbox from "react-toolbox/lib/checkbox";

class ModuleCategoriesContainer extends Component {
  constructor(props) {
    super(props);
    this.state = { loading: true, moduleCategory: null, includedModules: [] };
  }

  getModuleCategory = () => {
    ModuleCategories.get(this.props.moduleCategoryKey).then((result) =>
      this.setState({ moduleCategory: result[0], loading: false })
    );
  };

  componentDidMount() {
    this.getModuleCategory();
  }

  moduleIndexInCategory = (moduleKey) => {
    const { modules } = this.state.moduleCategory;

    if (!modules) {
      return -1;
    }
    return modules.findIndex((el) => el === moduleKey);
  };

  isModuleIncluded = (moduleKey) => {
    const moduleIndex = this.moduleIndexInCategory(moduleKey);
    return moduleIndex !== -1;
  };

  handleToggleInclude = (moduleKey) => {
    var { modules } = this.state.moduleCategory;
    if (!modules) {
      modules = [];
    }
    var newModules = [...modules];
    const moduleIndex = this.moduleIndexInCategory(moduleKey);
    if (moduleIndex !== -1) {
      newModules.splice(moduleIndex, 1);
    } else {
      newModules.push(moduleKey);
    }
    ModuleCategories.patch({
      ...this.state.moduleCategory,
      modules: newModules,
    }).then(this.getModuleCategory);
  };

  moduleActions = (module) => {
    const included = this.isModuleIncluded(module.key);
    return [
      <div
        key={module.key + "-checkbox"}
        style={{ height: "100%", cursor: "pointer" }}
        onClick={() => {}}
      >
        <Checkbox
          checked={included}
          label={`${included ? "Exclude" : "Include"} Module`}
          onClick={() => {}}
          onChange={() => this.handleToggleInclude(module.key)}
        />
      </div>,
    ];
  };

  render() {
    const { loading, moduleCategory } = this.state;
    const { modules } = this.props;
    return loading ? (
      <ProgressBar mode="indeterminate" />
    ) : (
      <div>
        <h3 style={{ marginTop: "1%", marginBottom: "1%" }}>
          Module Category : {moduleCategory.description}
        </h3>
        <List>
          <ListSubHeader caption="Modules" />
          {modules.map((module) => {
            return (
              <ListItem
                key={module.key}
                avatar={this.props.images.get(module.icon)}
                caption={module.description}
                rightActions={this.moduleActions(module)}
              />
            );
          })}
          <ListDivider />
        </List>
      </div>
    );
  }
}

export const mapStateToProps = (state) => ({
  moduleCategoryKey: state.router.params.moduleCategoryKey,
  modules: state.modules.modules,
  images: state.images.images,
});

export default connect(mapStateToProps)(ModuleCategoriesContainer);
