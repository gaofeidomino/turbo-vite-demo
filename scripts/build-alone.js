const shell = require("shelljs");
const path = require("path");
const minimist = require("minimist");

const argvs = process.argv.slice(2) || [];
const { mode } = minimist(argvs);

if (!mode) {
    throw new Error("请指定打包模式");
}

console.log(`🔧 打包模式: ${mode}`);

// 打包单个模块
const buildModule = (moduleName = "") => {
    if (!moduleName) {
        throw new Error("请指定打包模块");
    }

    // 输出打包模块
    console.log(`打包模块 ${moduleName}`);

    // 进入模块目录
    shell.cd(path.resolve(__dirname, `../apps/${moduleName}`));

    // 清除 dist
    shell.rm("-rf", "dist");

    // 执行打包命令
    shell.exec(`npm run build-only-${mode}-alone`);

    // 如果根目录没有 dist 目录，创建
    if (!shell.test("-e", path.resolve(__dirname, "../dist"))) {
        shell.mkdir(path.resolve(__dirname, "../dist"));
    }

    // 如果模块目录没有 dist 目录，抛出异常
    if (
        !shell.test("-e", path.resolve(__dirname, `../apps/${moduleName}/dist`))
    ) {
        throw new Error(`模块 ${moduleName} 打包失败`);
    }
    // 打包完成后，复制 dist 到根目录的 dist
    shell.cp("-R", "dist", path.resolve(__dirname, `../dist/${moduleName}`));

    // 清除模块目录的 dist
    shell.rm("-rf", "dist");
};

// 清除根目录的 dist
shell.rm("-rf", path.resolve(__dirname, "../dist"));

buildModule("app-deliver");
