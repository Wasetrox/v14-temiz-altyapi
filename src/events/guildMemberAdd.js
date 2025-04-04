const conf = require('../../config.json');

module.exports = {
    name: 'guildMemberAdd',
    execute(member, client) {
        const roleId = conf.otoRolId;
        const role = member.guild.roles.cache.get(roleId);
        if (role) {
            member.roles.add(role)
        }

        const channelId = conf.welcomKanali;
        const channel = member.guild.channels.cache.get(channelId);
        if (channel && channel.isTextBased()) {
            channel.send(`Hoş geldin ${member.user.tag}! Sunucumuza katıldığın için teşekkürler!`);
        }
    }
};