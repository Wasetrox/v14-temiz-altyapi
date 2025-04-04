const conf = require('../../../config.json');

module.exports = {
    conf: {
        aliases: [],
        name: "eval",
        category: "sahip",
        owner: true,
    },

    run: async (client, message, args) => {
        const owners = conf.owners;
        let restrictToOwners = module.exports.conf.owner;

        if (!args[0]) return;

        let code = args.join(" ");

        if (code.toLowerCase() === 'owner true' && owners.includes(message.author.id)) {
            module.exports.conf.owner = true;
            return message.channel.send({ content: 'Eval komutu artık sadece owner\'lar için aktif!' });
        } else if (code.toLowerCase() === 'owner false' && owners.includes(message.author.id)) {
            module.exports.conf.owner = false;
            return message.channel.send({ content: 'Eval komutu artık herkes için aktif!' });
        }

        if (restrictToOwners && !owners.includes(message.author.id)) {
            return message.channel.send({ content: 'Bu komutu sadece bot owner\'ları kullanabilir!' });
        }

        try {
            var result = clean(await eval(code));
            if (result.includes(client.token)) {
                return message.channel.send({ content: "Tokeni yarramın başını yersen alırsın orospu evladı" });
            }
            message.channel.send({ content: `\`\`\`js\n${result}\n\`\`\`` });
        } catch (e) {
            return message.channel.send({ content: `\`\`\`js\n${e}\n\`\`\`` });
        }
    },
};

function clean(text) {
    if (typeof text !== "string") {
        text = require("util").inspect(text, { depth: 0 });
    }
    text = text
        .replace(/`/g, "`" + String.fromCharCode(8203))
        .replace(/@/g, "@" + String.fromCharCode(8203));
    return text;
}