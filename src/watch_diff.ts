import chalk from "chalk";
import { diffLines } from "diff";
import fs from "fs";
import watch from "node-watch";
import path from "path";
import { get_sample_dirname, get_solution_path } from "./dir_names";
import { javascript } from "./templates";
import puppeteer from "puppeteer";
import { setTimeout } from "timers";
import config from "./config";

export const watch_solution = async (problem_num: number) => {
  const solution_path = get_solution_path(problem_num, "js");
  const watcher = watch(solution_path, { recursive: false });

  (await javascript).run(problem_num);
  compare(problem_num);
  watcher.on("change", async () => {
    (await javascript).run(problem_num);
    compare(problem_num);
  });

  watcher.on("error", (err) => {
    console.log(err);
  });
};

const compare = (problem_num: number) => {
  const sample_path = get_sample_dirname(problem_num);
  const sample_outputs = fs.readdirSync(sample_path).filter((file) => {
    return file.startsWith("sample-output");
  });
  const outputs = fs.readdirSync(sample_path).filter((file) => {
    return file.startsWith("output");
  });
  if (sample_outputs.length !== outputs.length) {
    process.stderr.write(chalk.red("테스트 케이스의 개수가 다릅니다."));
  }
  let pass_count = 0;

  for (let i = 0; i < sample_outputs.length; i++) {
    const sample = fs.readFileSync(path.join(sample_path, sample_outputs[i]));
    const answer = fs.readFileSync(path.join(sample_path, outputs[i]));
    const diff = diffLines(sample.toString(), answer.toString());
    const title = "Test Case " + (i + 1);
    if (diff.length === 1) {
      console.log(chalk.green("✅ " + title));
      pass_count++;
      continue;
    }

    const exp = diff.find((d) => d.removed)?.value.split("\n") || [];
    const act = diff.find((d) => d.added)?.value.split("\n") || [];

    let result = "";
    for (let i = 0; i < Math.max(exp?.length, act?.length); i++) {
      result +=
        chalk.green(exp[i] || "") +
        " ".repeat(16 - exp[i]?.length) +
        chalk.red(act[i] || "") +
        "\n";
    }
    result = result.trim();

    console.log(chalk.red("❌ " + title));
    console.log(chalk.green("Expected\t") + chalk.red("Actual"));
    console.log(result);
  }

  if (pass_count === sample_outputs.length) {
    console.log(chalk.green("✅ All Pass"));
    const readline = require("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      "백준에 바로 업로드 하시겠습니까? ",
      async (ans: "Y" | "y" | "N" | "n") => {
        if (ans === "Y" || ans === "y") {
          console.log("업로드합니다.");
          await upload(problem_num);
        } else {
          console.log("업로드를 취소합니다.");
        }
        rl.close();
      }
    );
  }
};

const upload = async (problem_num: number) => {
  const url = "https://www.acmicpc.net/submit/" + problem_num;
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setCookie({
    name: "bojautologin",
    value: config.auto_login_key,
    domain: ".acmicpc.net",
    path: "/",
    priority: "Medium",
    secure: true,
    httpOnly: true,
  });
  await page.goto(url);

  await page.setRequestInterception(true);

  await page.waitForSelector('input[name="csrf_key"]');
  const csrf = await page.$eval('input[name="csrf_key"]', (el) =>
    el.getAttribute("value")
  );

  page.on("request", (interceptedRequest) => {
    const solution_path = get_solution_path(problem_num, "js");
    const sol = fs.readFileSync(solution_path);
    interceptedRequest.continue({
      method: "POST",
      postData: `language=17&problem_id=${problem_num}&code_open=onlyaccepted&source=${encodeURIComponent(
        sol.toString()
      )}&csrf_key=${csrf}`,
    });
  });

  await page.click("#submit_button");

  // await page.waitForNavigation();

  console.log(
    `https://www.acmicpc.net/status?problem_id=${problem_num}&language_id=17`
  );
  setTimeout(async () => {
    await browser.close();
  }, 1000);
};
