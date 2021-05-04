const https = require('https');
const child_process = require('child_process');
const fs = require("fs");
const readline = require('readline');
const path = require('path');
const rootPath = path.join(__dirname, '../');

var PluginsPath, plugin;

/* Downloads Config */
if(fs.existsSync(`${rootPath}scripts/Plugins.json`)) {
	PluginsPath = JSON.parse(fs.readFileSync(`${rootPath}scripts/Plugins.json`));
}

/* Functions */
function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}

function installPlugin(PL_ID){
    if(!fs.existsSync(`${rootPath}data/${PluginsPath[PL_ID].Folder}`)) {
        fs.mkdirSync(`${rootPath}data/${PluginsPath[PL_ID].Folder}`);
        console.log('[Installer] \x1b[32m[OK]\x1b[0m',`Folder ${PluginsPath[PL_ID].Folder} was created.`)
    }

     PluginsPath[PL_ID].Files.map(File => {
        const file = fs.createWriteStream(`${rootPath}/${File.Path}`);
         https.get(`${File.File}`, response => {
            let stream = response.pipe(file);

            stream.on("finish", function() {
                console.log('[Installer] \x1b[32m[OK]\x1b[0m',`Downloaded file ${File.Path}`)
            });
        });
    });

    child_process.execSync(`npm install ${PluginsPath[PL_ID].npm}`,{stdio:[0,1,2]});

    let Vorlage = fs.readFileSync(`${rootPath}.env`).toString();
    Vorlage = `${Vorlage}\n${PluginsPath[PL_ID].env}`
    fs.writeFile(`${rootPath}.env`, Vorlage, (err) => {if (err) console.log(err);
        console.log('[Installer] \x1b[32m[OK]\x1b[0m',`Added ${PluginsPath[PL_ID].env} to .env File.`)
    });

}

/* Questions */
async function Start() {
    plugin = await askQuestion("Please choose the plugin you want to install\n1: MSH-Config-Generator\n2: PPS (Pterodactyl-ServerStarter)\n> ");
    if(!fs.existsSync(`${rootPath}/${PluginsPath[plugin].Files[0].Path}`)) {
        installPlugin(plugin)
    }else{
        console.log('[Installer] \x1b[31m[IO]\x1b[0m',`This plugin is already installed!`)
    }
    console.log('[Installer] \x1b[31m[IO]\x1b[0m',`${PluginsPath[plugin].Done}`)
}

/* Start Script */
console.log('[Installer] \x1b[32m[OK]\x1b[0m',`Running Plugin installer...`)

/* Create .env file if not exists */
if(!fs.existsSync(`${rootPath}.env`)) {
    const Vorlage = fs.readFileSync(`${rootPath}.env.example`).toString();
    fs.writeFile(`${rootPath}.env`, Vorlage, (err) => {if (err) console.log(err);
        console.log('[Installer] \x1b[36m[WA]\x1b[0m',`.env file was created`)
        Start();
    });
}else{
    Start();
}