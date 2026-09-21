const { execSync } = require("child_process");

// Render 빌드 명령이 `yarn`(설치만)일 때도 프로덕션 빌드를 만든다.
if (process.env.RENDER === "true") {
  execSync("npx next build", { stdio: "inherit" });
}
