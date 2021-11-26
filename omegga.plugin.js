const fs = require("fs"); // to be used in future for file saving
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
        cmds = await this.store.get('commands') || [];
        
        this.omegga.on ('chatcmd:createcmd', async (name, cmdName, announce, ...string) => {
            if (this.config['authorized-users'].find(c => c.name == name)) {

                let newcmd = {};
                
                if (cmds.find(c => c.cmdName == cmdName) != undefined) {
                    this.omegga.broadcast('<color="ff9999">Command name already used.</>');

                } else {
                    var newstring = [];

                    // this is to preserve original commas
                    for(const piece of string) {
                        let words = piece.replace(/,/g,"\u2485");
                        newstring.push(words);
                    };

                    // take out new commas then switch the old ones back
                    let noCommaString = newstring.toString().replace(/,/g," ");
                    let neweststring = noCommaString.replace(/\u2485/g,",");
                    string = neweststring;

                    if (announce == "true") {

                        announce = true;
                        cmdName = cmdName.toLowerCase();
                        cmdName = sanitize(cmdName);
                        newcmd = {cmdName, announce, string};
                        cmds.push(newcmd);
                        this.omegga.broadcast(`<color="99ff66">Broadcast command created named <color="ffffff">!${cmdName}</></>`);
                        await this.store.set('commands', cmds);

                    } else if (announce == "false") {

                        announce = false;
                        cmdName = cmdName.toLowerCase();
                        cmdName = sanitize(cmdName);
                        newcmd = {cmdName, announce, string};
                        cmds.push(newcmd);
                        this.omegga.broadcast(`<color="99ff66">Whisper command created named <color="ffffff">!${cmdName}</></>`);
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

                if (cmds.find(c => c.cmdName == cmdnam) != undefined) {
                    
                    // finds the index of the searched command in cmds and cuts it out
                    const namee = cmds.find(c => c.cmdName == cmdnam);
                    let trash = cmds.splice(cmds.indexOf(namee),1);
                    await this.store.set('commands', cmds);
                    this.omegga.whisper(name, `<color="ff9999">Command ${cmdnam} removed.</>`);
                    return;
                    
                } else {
                    this.omegga.whisper(name, '<color="ff9999">Remove requires valid command name</>.');
                }
            } else {
                this.omegga.whisper(name, '<color="ff9999">You are not authorized.</>');
            }
        });

        this.omegga.on ('chatcmd:createcmdhelp', (name) => {
            this.omegga.whisper(name, '!createcmd <color="99bbff">(name)</> <color="80ffcc">(Broadcast? true or false)</> <color="ffcc99">(commands output)</>');
            this.omegga.whisper(name, '<b><color="ff6fff">Example:</></> !createcmd Burger true This is a <code>broadcast</> <link="https://google.com">command</> named <i>burger!</>');
        });

        this.omegga.on ('chatcmd:txtcmd:clearstoreandcommands', async (name, confirm) => {
            
            if (this.config['authorized-users'].find(c => c.name == name)) {
                if (confirm == "confirm"){

                    await this.store.wipe();
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
                cmdlist.push(`| <color="99bbff">${eachcmd.cmdName}</> <color="80ffcc">${eachcmd.announce ? "Broadcast" : "Whisper"}</>`);
            };

            let stringlist = cmdlist.join(' ')

            if (stringlist.includes("|")) {
                this.omegga.broadcast(stringlist);
            } else {
                this.omegga.broadcast('No commands exist.');
            }
        });

        this.omegga.on('chat', (name, message)=> {
            if (message.startsWith(`!`)) {
                if (cmds != null) {
                    for (const command of cmds) {
                        if (message == `!${command.cmdName}`) {
                            if (cmds.announce == true) {
                                this.omegga.broadcast(command.string);
                            } else {
                                this.omegga.whisper(name, command.string);
                            }
                            break;
                        }
                    }
                }
            }
        }); 
    }
  
    async stop() {  
    }
}
module.exports = kTextCommandCreator;
