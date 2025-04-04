const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    conf: {
        aliases: ["help", "yardım"],
        name: "yardim",
        category: "genel",
        owner: false,
    },

    run: async (client, message, args) => {
        const commandsByCategory = {};
        const prefixCommands = client.commands.filter(cmd => cmd.conf && !cmd.data);
        prefixCommands.forEach(cmd => {
            const category = cmd.conf.category || 'Diğer';
            if (!commandsByCategory[category]) {
                commandsByCategory[category] = [];
            }
            commandsByCategory[category].push(`\`${client.prefix}${cmd.conf.name}\`: ${cmd.conf.description || 'Açıklama yok'}`);
        });

        const totalCommands = prefixCommands.size;

        const categoryOptions = Object.keys(commandsByCategory).map(category => ({
            label: category.charAt(0).toUpperCase() + category.slice(1),
            value: category,
            description: `${category} kategorisindeki komutlar`,
        }));

        const initialEmbed = new EmbedBuilder()
            .setTitle('Yardım Menüsü')
            .setDescription(`Merhaba! Botun komutlarını aşağıdan kategorilere göre görebilirsin.\n**Toplam Komut Sayısı:** ${totalCommands}\n\nLütfen bir kategori seç!`)
            .setColor('#0099ff')
            .setFooter({ text: 'Kategori seçmek için aşağıdaki menüyü kullanın!' });

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('yardim_kategori')
            .setPlaceholder('Bir kategori seçin')
            .addOptions(categoryOptions);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const helpMessage = await message.channel.send({
            embeds: [initialEmbed],
            components: [row],
        });

        const filter = i => i.user.id === message.author.id && i.customId === 'yardim_kategori';
        const collector = helpMessage.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async interaction => {
            const selectedCategory = interaction.values[0];
            const updatedEmbed = new EmbedBuilder()
                .setTitle('Yardım Menüsü')
                .setDescription(`Prefix: \`${client.prefix}\`\n\n**${selectedCategory} Komutları**\n${commandsByCategory[selectedCategory].join('\n')}`)
                .setColor('#0099ff')
                .setFooter({ text: 'Kategori seçmek için aşağıdaki menüyü kullanın!' });

            await interaction.update({ embeds: [updatedEmbed] });
        });

        collector.on('end', () => {
            helpMessage.edit({ components: [] }).catch(() => {});
        });
    },
};