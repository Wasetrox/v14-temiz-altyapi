const { ActivityType } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const conf = require('../../config.json');

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`${client.user.tag} aktif!`);

        client.user.setPresence({
            activities: [{ name: '🤍 Made In Wasetrox', type: ActivityType.Streaming, url: 'https://twitch.tv/wasetrox' }],
            status: 'dnd'
        });

        const channelId = conf.sesKanalId;
        const channel = client.channels.cache.get(channelId);

        if (channel && channel.isVoiceBased()) {
            try {
                const connection = joinVoiceChannel({
                    channelId: channel.id,
                    guildId: channel.guild.id,
                    adapterCreator: channel.guild.voiceAdapterCreator,
                });
                console.log(`${channel.name} ses kanalına bağlanıldı!`);
            } catch (error) {
                console.error('Ses kanalına bağlanılamadı:', error);
            }
        } else {
            console.log('Ses kanalı bulunamadı veya geçerli bir ses kanalı değil!');
        }
    }
};