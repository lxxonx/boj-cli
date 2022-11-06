#!/usr/bin/env node
import process from "process";
import chalk from "chalk";
import { create_prob } from "./create_prob";
import { watch_solution } from "./watch_diff";

const init = async () => {
  if (isNaN(Number(process.argv[2]))) {
    console.log(chalk.red("문제 번호를 입력해주세요."));
    return;
  }

  await create_prob(Number(process.argv[2]));
  await watch_solution(Number(process.argv[2]));
};

init();
