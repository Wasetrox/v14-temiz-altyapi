const { Client, GatewayIntentBits, Collection, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const conf = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.commands = new Collection();
client.prefix = conf.prefix;

const prefixCommandPath = path.join(__dirname, 'src', 'commands', 'PrefixCommands');
if (fs.existsSync(prefixCommandPath)) {
    const prefixCommandFiles = fs.readdirSync(prefixCommandPath).filter(file => file.endsWith('.js'));
    for (const file of prefixCommandFiles) {
        const command = require(path.join(prefixCommandPath, file));
        client.commands.set(command.conf.name, command);
        console.log(`Loaded prefix command: ${command.conf.name}`);
        if (command.conf.aliases && Array.isArray(command.conf.aliases)) {
            command.conf.aliases.forEach(alias => {
                client.commands.set(alias, command);
                console.log(`Loaded alias for ${command.conf.name}: ${alias}`);
            });
        }
    }
}

const slashCommandPath = path.join(__dirname, 'src', 'commands', 'SlashCommands');
if (fs.existsSync(slashCommandPath)) {
    const slashCommandFiles = fs.readdirSync(slashCommandPath).filter(file => file.endsWith('.js'));
    const slashCommands = [];
    for (const file of slashCommandFiles) {
        const command = require(path.join(slashCommandPath, file));
        client.commands.set(command.data.name, command);
        console.log(`Loaded slash command: ${command.data.name}`);
        slashCommands.push(command.data.toJSON());
    }

    client.once('ready', async () => {
        try {
            await client.application.commands.set(slashCommands);
            console.log('Slash komutları yüklendi!');
            console.log(`Bot ${client.user.tag} olarak aktif!`);
        } catch (error) {
            console.error('Slash komutları yüklenirken hata:', error);
        }
    });
}

const eventPath = path.join(__dirname, 'src', 'events');
if (fs.existsSync(eventPath)) {
    const eventFiles = fs.readdirSync(eventPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const event = require(path.join(eventPath, file));
        client.on(event.name, (...args) => event.execute(...args, client));
        console.log(`Loaded event: ${event.name}`);
    }
}

client.on('messageCreate', async message => {
    if (!message.content.startsWith(client.prefix) || message.author.bot) {
        return;
    }

    const args = message.content.slice(client.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) {
        return;
    }

    if (command.data) {
        return;
    }

    try {
        await command.run(client, message, args);
    } catch (error) {
        console.error(`Prefix komut hatası (${commandName}):`, error);
        await message.reply('Komut çalıştırılırken bir hata oluştu!');
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`Slash komut bulunamadı: ${interaction.commandName}`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Slash komut hatası (${interaction.commandName}):`, error);
        await interaction.reply({ 
            content: 'Komut çalıştırılırken hata oluştu!', 
            ephemeral: true 
        });
    }
});

client.login(conf.token);