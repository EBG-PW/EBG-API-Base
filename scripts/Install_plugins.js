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

function updatePlugin(PL_ID){
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
}

/* Questions */
async function Start() {
    dowhat = await askQuestion("Do you want to install or update a Plugin?\n1: Install\n2: Update\n> ");
    plugin = await askQuestion("Please choose the plugin you want to install\n1: MSH-Config-Generator\n2: PPS (Pterodactyl-ServerStarter)\n2: TwitchMinecraft-Sync\n> ");
    if(dowhat === "1"){
        if(!fs.existsSync(`${rootPath}/${PluginsPath[plugin].Files[0].Path}`)) {
            installPlugin(plugin)
            console.log('[Installer] \x1b[31m[IO]\x1b[0m',`${PluginsPath[plugin].Done}`)
        }else{
            console.log('[Installer] \x1b[31m[IO]\x1b[0m',`This plugin is already installed!`)
        }
    }else if(dowhat === "2"){
        if(!fs.existsSync(`${rootPath}/${PluginsPath[plugin].Files[0].Path}`)) {
            console.log('[Installer] \x1b[31m[IO]\x1b[0m',`This plugin can't be updated, because its not intalled!`)
        }else{
            updatePlugin(plugin)
        }
    }else{
        console.log('[Installer] \x1b[31m[IO]\x1b[0m',`Unexpected Input ${dowhat}!`)
    }
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