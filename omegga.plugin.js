const { chat: { sanitize } } = OMEGGA_UTIL;

class kTextCommandCreator {

    constructor(omegga, config, store) {
    this.omegga = omegga;
    this.config = config;
    this.store = store;
    }
    // <b>bold</> <i>italic</> <color="hex">color</> <link="url">link</> <code>code text</>
    async init() {
        let cmds = [];
        cmds = await this.store.get('commands');
        
        this.omegga.on ('chatcmd:createcmd', async (name, cmdname, announce, ...string) => {
            if (this.config['authorized-users'].find(c => c.name == name)) {
                let newcmd = {};

                if (cmds.find(c => c.cmdname == cmdname) != undefined) {
                    this.omegga.broadcast('<color="ff9999">Command name already used.</>');
                } else {
                    // make commas not delete
                    var newstring = [];
                    for(const piece of string) {
                        let words = piece.replace(/,/g,"\u2485");
                        newstring.push(words);
                    };
                    let newerstring = newstring.toString().replace(/,/g," ");
                    let neweststring = newerstring.replace(/\u2485/g,",");
                    string = neweststring;

                    if (announce == "true") {
                        announce = true;
                        cmdname = cmdname.toLowerCase();
                        cmdname = sanitize(cmdname);
                        newcmd = {cmdname, announce, string};
                        cmds.push(newcmd);
                        this.omegga.broadcast(`<color="99ff66">Broadcast command created named <color="ffffff">!${cmdname}</></>`);
                        await this.store.set('commands', cmds);
                    } else if (announce == "false") {
                        announce = false;
                        cmdname = cmdname.toLowerCase();
                        cmdname = sanitize(cmdname);
                        newcmd = {cmdname, announce, string};
                        cmds.push(newcmd);
                        this.omegga.broadcast(`<color="99ff66">Whisper command created named <color="ffffff">!${cmdname}</></>`);
                        await this.store.set('commands', cmds);
                    } else {
                        this.omegga.broadcast('<color="ff9999">Only true or false accepted after name.</>');
                    }
                }
            } else {
                this.omegga.whisper(name, '<color="ff9999">You are not authorized.</>');
            }
        });

        this.omegga.on ('chatcmd:removecmd', async (name, cmdnam) => {
            if (this.config['authorized-users'].find(c => c.name == name)) {
                if (cmds.find(c => c.cmdname == cmdnam) != undefined) {
                    const namee = cmds.find(c => c.cmdname == cmdnam);
                    let trash = cmds.splice(cmds.indexOf(namee),1);
                    await this.store.set('commands', cmds);
                    this.omegga.whisper(name, `Command ${cmdnam} removed.`);
                    return;
                } else {
                    this.omegga.whisper(name, '<color="ff9999">Remove requires valid command name</>.');
                }
            } else {
                this.omegga.whisper(name, '<color="ff9999">You are not authorized.</>');
            }
        });

        this.omegga.on ('chatcmd:createcmdhelp', (name) => {
            this.omegga.whisper(name, '!createcmd <color="99bbff">(name)</> <color="80ffcc">(Broadcast? true or false)</> <color="ffcc99">(command content)</>');
            this.omegga.whisper(name, '<b><color="ff6fff">Example:</></> !createcmd Burger true This is a <code>broadcast</> <link="https://google.com">command</> named <i>burger!</>');
        });

        this.omegga.on ('chatcmd:clearstoreandcommands', async (name, confirm) => {
            if (this.config['authorized-users'].find(c => c.name == name)) {
                if (confirm == "confirm"){
                    await this.store.wipe;
                    cmds = [];
                    this.omegga.whisper(name, 'Commands and command store cleared.');
                } else {
                    this.omegga.whisper(name, "Type '!clearstoreandcommands confirm' to confirm this action.");
                };
            } else {
                this.omegga.whisper(name, '<color="ff9999">You are not authorized.</>');
            }
        }); 

        this.omegga.on ('chatcmd:viewcmds', (name) => {
            let cmdlist = [];
            for (const eachcmd of cmds) {
                cmdlist.push(`| <color="99bbff">${eachcmd.cmdname}</> <color="80ffcc">${eachcmd.announce ? "Broadcast" : "Whisper"}</>`);
            };
            let augbf = cmdlist.toString().replace(/,/g," ");
            if (augbf.includes("|")) {
                this.omegga.broadcast(augbf);
            } else {
                this.omegga.broadcast('No commands exist.');
            }
        });

        this.omegga.on('chat', (name, message)=> {
            if (message.startsWith(`!`)) {
                for (const comand of cmds) {
                    if (message == `!${comand.cmdname}`) {
                        if (cmds.announce == true) {
                            this.omegga.broadcast(comand.string);
                        } else {
                            this.omegga.whisper(name, comand.string);
                        }
                    return;
                    }
                } 
            }
        }); 
        
    }
  
    async stop() {  
    }
}
module.exports = kTextCommandCreator;
