const prettyMilliseconds = require('pretty-ms');
class kPlaytime {

    constructor(omegga, config, store) {
    this.omegga = omegga;
    this.config = config;
    this.store = store;
    }

    async init() {
        // players is just one player but im too lazy to change all references
        this.omegga.on("join", async (player) => {
            let players = await this.store.get("playertime:" + player.name) || undefined;
            if (players != undefined) {
                let date = Date.now();
                players.lastJoin = date;
                this.omegga.broadcast(`<color="aaa"><b><color="5a7">${player.name}</></> last joined <color="c85"><b>${prettyMilliseconds(players.lastJoin - players.lastLeave)}</></> ago</>`);
                await this.store.set("playertime:" + player.name, players);
            } else {    
                let date = Date.now();
                const plr = ({firstJoin:date, lastJoin:date, lastLeave:0, totaltime:0});
                players = plr;
                this.omegga.broadcast(`<color="aaa"><b><color="5a7">${player.name}</></> added to playtime tracking</>`);
                await this.store.set("playertime:" + player.name, players);
            }
        });
        this.omegga.on("leave", async (player) => {
            let players = await this.store.get("playertime:" + player.name) || undefined;
            if (players != undefined) {
                let date = Date.now();
                players.lastLeave = date;
                let diff = (players.lastLeave - players.lastJoin);
                players.totaltime += diff;
                await this.store.set("playertime:" + player.name, players);
            } else {          
            }
        });
        this.omegga.on("chatcmd:playtime", async (name, othername) => {
            let players = await this.store.get("playertime:" + name) || undefined;
            let players2 = await this.store.get("playertime:" + othername) || undefined;
            if(othername != undefined) {
                if (players2 == undefined) {
                    this.omegga.whisper(name, `<color="aaa">No player found named '<b><color="5a7">${othername}</></>'</>`)
                } else {
                    let date = Date.now() - players2.lastJoin;
                    this.omegga.whisper(name, `<color="5a7"><b>${othername}</></><color="aaa"> has played on this server for <color="c85"><b>${prettyMilliseconds(players2.totaltime + date)}</></></>`)
                }
            } else {
                let date = Date.now() - players.lastJoin;
                this.omegga.whisper(name, `<color="aaa">You have played on this server for <color="c85"><b>${prettyMilliseconds(players.totaltime + date)}</></></>`)
            }
        });
        this.omegga.on("chatcmd:firstjoin", async (name, othername) => {
            let players = await this.store.get("playertime:" + name) || undefined;
            let players2 = await this.store.get("playertime:" + othername) || undefined;
            if(othername != undefined) {
                if (players2 == undefined) {
                    this.omegga.whisper(name, `<color="aaa">No player found named '<b><color="5a7">${othername}</></>'</>`)
                } else {
                    let date = Date.now() - players2.firstJoin;
                    let date2 = new Date(players2.firstJoin);
                    this.omegga.whisper(name, `<b><color="5a7">${othername}</></><color="aaa"> first joined <color="c85"><b>${prettyMilliseconds(date)}</></> ago, or on <color="c85"><b>${date2}</></></>`);
                }
            } else {
                let date = Date.now() - players.firstJoin;
                let date2 = new Date(players.firstJoin);
                this.omegga.whisper(name, `<color="aaa">You first joined <color="c85"><b>${prettyMilliseconds(date)}</></> ago, or on <color="c85"><b>${date2}</></></>`);
            }
        });
<<<<<<< HEAD

        this.omegga.on ('chatcmd:createcmdhelp', (name) => {
            this.omegga.whisper(name, '!createcmd <color="99bbff">(name)</> <color="80ffcc">(Broadcast? true or false)</> <color="ffcc99">(command content)</>');
            this.omegga.whisper(name, '<b><color="ff6fff">Example:</></> !createcmd Burger true This is a <code>broadcast</> <link="https://google.com">command</> named <i>burger!</>');
        });

        this.omegga.on ('chatcmd:txtcmd:clearstoreandcommands', async (name, confirm) => {
=======
        this.omegga.on ('chatcmd:plytime:clearstore', async (name, confirm, othername) => {
>>>>>>> 80fdbe0272a6cd786635480f4cbdff7234a908ab
            if (this.config['authorized-users'].find(c => c.name == name)) {
                if (confirm == "confirm"){
                    if (othername != undefined){
                        await this.store.delete("playertime:" + othername);
                        this.omegga.whisper(name, `<color="f33">${othername}'s Playertime cleared.</>`);
                    } else {
                        for (const key of await this.store.keys()) await this.store.delete(key);
                        this.omegga.whisper(name, '<color="f33">Playertimes cleared.</>');
                    }
                } else {
                    this.omegga.whisper(name, `<color="aaa">Type <b><color="f99">'!plytime:clearstore confirm'</></> to confirm this action.</>`);
                };
            } else {
                this.omegga.whisper(name, '<color="f99">You are not authorized.</>');
            }
        }); 
        this.omegga.on("chatcmd:plytime:test", async (name, othername) => {
            if (othername != undefined) {
                console.log(await this.store.get("playertime:" + othername));
            } else {
                console.log(await this.store.get("playertime:" + name));
            }
        }); 
    }
  
    async stop() {  
    }
}
module.exports = kPlaytime;
