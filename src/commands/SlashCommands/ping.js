const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Botun pingini gösterir'),
    type: 'slash',
    async execute(interaction) {
        await interaction.reply(`Pong! Botun pingi: ${interaction.client.ws.ping}ms`);
    }
};