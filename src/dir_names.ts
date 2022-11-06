import path from "path";

export const __problem_dirname = "problems" as const;
export const get_problem_dirname = (problem_num: number) =>
  path.join(__problem_dirname, problem_num.toString());
export const get_sample_dirname = (problem_num: number) =>
  path.join(get_problem_dirname(problem_num), "sample");
export const get_solution_path = (problem_num: number, language: string) =>
  path.join(get_problem_dirname(problem_num), `solution.${language}`);
