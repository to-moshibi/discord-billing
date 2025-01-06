const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits,EmbedBuilder } = require('discord.js');
const { token } = require('./config.json');
const http = require('http');
const server = http.createServer();

const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
});
server.listen(3001);



// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    setInterval(() => {
        client.guilds.resolve('1279810417400615004')?.channels?.cache?.find?.(ch => ch?.name === '定期支払管理_bot')?.send('メッセージ')
    }, 5000);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
});

client.on('guildCreate', guild => {
    console.log(`Joined a new guild: ${guild.name}`);
    guild.channels.create({
        name: '定期支払管理_bot'
    }).then(channel => {
        //enbedを送信
        const embed = new EmbedBuilder()
            .setTitle('定期支払管理_bot')
            .setDescription('このチャンネルは定期支払管理_bot用のチャンネルです\n/help-billでコマンド一覧を表示します\nこのチャンネルを削除するとbotが動作しなくなります')
            .setColor(0x00FF00); // 緑色の16進数コード
        channel.send({ embeds: [embed] });
    }).catch(console.error);
});

// Log in to Discord with your client's token
client.login(token);



io.sockets.on('connection', function(socket) {
    console.log('connected');
    socket.on('message', function(data) {
        console.log(data);
        client.guilds.resolve(data.guildId)?.channels?.cache?.find?.(ch => ch?.name === '定期支払管理_bot')?.send(data.message);
    });
});