//Modules
const {Client, Events, GatewayIntentBits} = require("discord.js")
const {token} = require("./config.json")

const fs = require("node:fs")
const path = require("node:path")


//Creates the client instance
const client = new Client({intents: [GatewayIntentBits.Guilds]})
client.commands = new Collection();


//Creates a path to commands and loads them all into the client's command collection
const commandsPath = path.join(__dirname,"commands")
const commandFiles = fs.readdirSync(commandsPath).filter(file=>file.endsWith(".js"))

for (const file of commandFiles){
    const filePath = path.join(commandsPath,file)
    const command = require(filePath)

    if ("data" in command && "execute" in command){
        client.commands.set(command.data.name, command)
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
    }
}


//Listener for Interactions that use the slash command
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return
    
    const command = client.commands.get(interaction.commandName)

    if (!command){
        console.error(`No command matching ${interaction.commandName} was found.`)
        return
    }

    try {
        await command.execute(interaction)
    } catch (error) {
        if (interaction.replied || interaction.deferred){
            await interaction.followUp({content: "There was an error while executing this command!",ephemeral: true})
        } else {
            await interaction.reply({content: "There was an error while executing this command!",ephemeral: true})
        }
    }
})



//Client is ready to be used
client.once(Events.ClientReady, c => {
    console.log(`Client's ready. Logged in as ${c.user.tag}`)
})


client.login(token)