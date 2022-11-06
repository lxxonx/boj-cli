import { spawnSync } from "child_process";
import { get_sample_dirname, get_solution_path } from "../dir_names";
import fs from "fs";
import path from "path";

const template = `const fs = require("fs");
const input = fs.readFileSync("/dev/stdin").toString();

const solution = (_input) => {
    let result = _input;

    return result;
};

console.log(solution(input));
`;

const run = async (problem_num: number) => {
  const solution_path = get_solution_path(problem_num, "js");
  const sample_path = get_sample_dirname(problem_num);

  const sample_inputs = fs.readdirSync(sample_path).filter((file) => {
    return file.startsWith("sample-input");
  });

  for (let i = 0; i < sample_inputs.length; i++) {
    const file = fs.readFileSync(path.join(sample_path, sample_inputs[i]));
    const child = spawnSync("node", [solution_path], {
      input: file,
    });
    if (child.stdout) {
      fs.writeFileSync(
        path.join(sample_path, `output-${i + 1}.txt`),
        child.stdout
      );
    }
  }
};

export default {
  template,
  run,
};
