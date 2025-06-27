const fs = require("fs");
const path = require("path");

/**
 * @description 写入 vscode settings.json
 */
function writeVSCodeSettings() {
    const getSubDirs = (dir) =>
        fs
            .readdirSync(path.resolve(__dirname, `../${dir}`))
            .filter((name) => {
                const fullPath = path.resolve(__dirname, `../${dir}/${name}`);
                return (
                    fs.statSync(fullPath).isDirectory() &&
                    ![".DS_Store", "node_modules"].includes(name)
                );
            })
            .map((name) => `${dir}/${name}`);

    const workingDirs = [...getSubDirs("packages"), ...getSubDirs("apps")];

    const settings = {
        "eslint.useFlatConfig": false,
        "eslint.workingDirectories": workingDirs,
    };

    if (!fs.existsSync(".vscode")) {
        fs.mkdirSync(".vscode");
    }

    fs.writeFileSync(".vscode/settings.json", JSON.stringify(settings, null, 2));
}

writeVSCodeSettings();
