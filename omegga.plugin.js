const prettyMilliseconds = require('pretty-ms');
class kPlaytime {

    constructor(omegga, config, store) {
    this.omegga = omegga;
    this.config = config;
    this.store = store;
    }

    async init() {
        let players = await this.store.get("playertimes") || {};
        console.log(players)

        this.omegga.on("join", async (player) => {
            if (players[player.name] != undefined) {
                console.log("returning player")
                let date = Date.now();
                players[player.name].lastJoin = date;
                this.omegga.broadcast(`${player.name} last joined <color="ffaa77">${prettyMilliseconds(players[player.name].lastJoin - players[player.name].lastLeave)}</> ago`);
                console.log(players[player.name]);
                await this.store.set('playertimes', players);
            } else {
                console.log("new player")
                let date = Date.now();
                const plr = ({firstJoin:date, lastJoin:date, lastLeave:0, totaltime:0});
                players[player.name] = plr;
                this.omegga.broadcast(`${player.name} added to playtime tracking.`);
                await this.store.set('playertimes', players);
            }
        });
        this.omegga.on("leave", async (player) => {
            if (players[player.name] != undefined) {
                let date = Date.now();
                players[player.name].lastLeave = date;
                let diff = (players[player.name].lastLeave - players[player.name].lastJoin);
                players[player.name].totaltime += diff;
                await this.store.set('playertimes', players);
            }
        });
        this.omegga.on("chatcmd:test", () => {
            console.log(players);
        });
        this.omegga.on("chatcmd:playtime", (name, othername) => {
            if(othername != undefined) {
                if (players[othername] == undefined) {
                    this.omegga.whisper(name, `No player found named '${othername}'`)
                } else {
                    let date = Date.now() - players[othername].lastJoin;
                    this.omegga.whisper(name, `${othername} has played on this server for <color="ffaa77">${prettyMilliseconds(players[othername].totaltime + date)}</>`)
                }
            } else {
                let date = Date.now() - players[name].lastJoin;
                this.omegga.whisper(name, `You have played on this server for <color="ffaa77">${prettyMilliseconds(players[name].totaltime + date)}</>`)
            }
        });
        this.omegga.on ('chatcmd:plytime:clearstore', async (name, confirm) => {
            if (this.config['authorized-users'].find(c => c.name == name)) {
                if (confirm == "confirm"){
                    await this.store.wipe;
                    players = {};
                    this.omegga.whisper(name, 'Playertimes cleared.');
                } else {
                    this.omegga.whisper(name, "Type '!plytime:clearstore confirm' to confirm this action.");
                };
            } else {
                this.omegga.whisper(name, '<color="ff9999">You are not authorized.</>');
            }
        }); 
    }
  
    async stop() {  
    }
}
module.exports = kPlaytime;
