import axios from "axios";
import fs from "fs";
import path from "path";
import cheerio from "cheerio";
import { get_sample_dirname, __problem_dirname } from "./dir_names";
import { javascript } from "./templates";

export const create_prob = async (problem_num: number) => {
  if (!fs.existsSync(__problem_dirname)) {
    fs.mkdirSync(__problem_dirname);
  }
  await create_dir(problem_num);
};

const create_dir = async (problem_num: number) => {
  const dir = path.join(__problem_dirname, problem_num.toString());
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    await download_html(problem_num);
    await create_solution(problem_num, "js");
  }
};

const download_html = async (problem_num: number) => {
  const url = `https://www.acmicpc.net/problem/${problem_num}`;
  const sample_path = get_sample_dirname(problem_num);
  const html_path = path.join(sample_path, `${problem_num}.html`);
  if (!fs.existsSync(sample_path)) {
    fs.mkdirSync(sample_path, { recursive: true });
  }
  const outfile = fs.createWriteStream(html_path);
  const res = await axios.get(url);
  const data = await res.data;
  outfile.write(data);

  const $ = cheerio.load(data);

  const sampledata = $(".sampledata").toArray();
  for (const sample of sampledata) {
    const id = sample.attribs.id;
    const data_path = path.join(sample_path, `${id}.txt`);
    const data = $(`#${id}`).text();
    fs.writeFileSync(data_path, data);
  }
};

const create_solution = async (problem_num: number, language: string) => {
  const solution_path = path.join(
    __problem_dirname,
    problem_num.toString(),
    "solution." + language
  );
  switch (language) {
    case "js":
    case "javascript":
      {
        fs.writeFileSync(solution_path, (await javascript).template);
      }
      break;

    default:
      {
        fs.writeFileSync(solution_path, (await javascript).template);
      }
      break;
  }
};
