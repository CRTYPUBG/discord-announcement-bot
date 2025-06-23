const { Client, IntentsBitField, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildPresences
    ]
});

const prefix = process.env.PREFIX || '.';
const statuses = JSON.parse(process.env.STATUSES || '["Senle", "Kalbimle", "Hayatımla"]');
const timer = parseInt(process.env.TIMER || '10') * 1000;
const owners = JSON.parse(process.env.OWNERS || '["1339667070916366462"]');

client.on('ready', () => {
    console.log(`Giriş Yapıldı: ${client.user.tag}`);
    client.user.setStatus('dnd');
    setInterval(() => {
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        client.user.setActivity(randomStatus, { type: 'PLAYING' });
    }, timer);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const content = message.content.toLowerCase();

    if (content.startsWith(prefix + 'help')) {
        message.react('💖');
        const helpEmbed = new EmbedBuilder()
            .setTimestamp()
            .setAuthor({
                name: message.author.username,
                iconURL: message.author.displayAvatarURL({ dynamic: true })
            })
            .setThumbnail(client.user.displayAvatarURL())
            .setDescription(`> Prefix: \`${prefix}\``)
            .addFields({
                name: 'Komutlar',
                value: `**\`${prefix}dm\`** Sunucudaki herkese DM atar.\n**\`${prefix}odm\`** Aktif üyelere DM atar.\n**\`${prefix}ping\`** Botun pingini gösterir.`
            });
        message.channel.send({ embeds: [helpEmbed] });
    }

    if (content.startsWith(prefix + 'odm')) {
        if (!message.member.permissions.has('Administrator') && !owners.includes(message.author.id)) {
            return message.reply('Bu komutu kullanmak için yönetici izniniz veya bot sahibi olmanız gerekiyor!');
        }

        await message.delete();
        const args = message.content.slice(prefix.length + 3).trim();
        if (!args) {
            const noArgsEmbed = new EmbedBuilder()
                .setAuthor({
                    name: message.author.username,
                    iconURL: message.author.displayAvatarURL({ dynamic: true })
                })
                .addFields({ name: 'Hata :x:', value: 'Lütfen duyurmak istediğiniz mesajı yazınız!' })
                .setTimestamp();
            return message.channel.send({ embeds: [noArgsEmbed] });
        }

        const initialMessage = await message.channel.send('Online üyelere mesaj gönderiliyor... (biraz zaman alabilir)');
        let sentCount = 0, failedCount = 0, botCount = 0;

        const members = await message.guild.members.fetch();
        const sendPromises = members
            .filter(m => m.presence?.status !== 'offline')
            .map(async m => {
                if (m.user.bot) {
                    botCount++;
                    return;
                }
                const dmEmbed = new EmbedBuilder()
                    .setTitle('Şu Sunucudan Yeni Duyurun Var')
                    .setDescription(args)
                    .setFooter({ text: `Sunucu: ${message.guild.name}`, iconURL: message.guild.iconURL() })
                    .setTimestamp();
                try {
                    await m.send({ embeds: [dmEmbed] });
                    sentCount++;
                    console.log(`Gönderildi: ${m.user.tag} ✅`);
                } catch {
                    failedCount++;
                    console.log(`Gönderilemedi: ${m.user.tag} ❌`);
                }
                await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit prevention
            });

        await Promise.all(sendPromises);
        await initialMessage.delete();

        const resultEmbed = new EmbedBuilder()
            .setAuthor({
                name: message.author.username,
                iconURL: message.author.displayAvatarURL({ dynamic: true })
            })
            .setDescription(
                `📬 Mesajınız toplam **${sentCount}** online kişiye gönderildi!\n` +
                `🛑 **${failedCount}** kişiye gönderilemedi.\n` +
                `🤖 **${botCount}** bota gönderilmedi!`
            )
            .setTimestamp();
        await message.channel.send({ embeds: [resultEmbed] });
    }

    if (content.startsWith(prefix + 'dm')) {
        if (!message.member.permissions.has('Administrator') && !owners.includes(message.author.id)) {
            return message.reply('Bu komutu kullanmak için yönetici izniniz veya bot sahibi olmanız gerekiyor!');
        }

        await message.delete();
        const args = message.content.slice(prefix.length + 2).trim();
        if (!args) {
            const noArgsEmbed = new EmbedBuilder()
                .setAuthor({
                    name: message.author.username,
                    iconURL: message.author.displayAvatarURL({ dynamic: true })
                })
                .addFields({ name: 'Hata :x:', value: 'Lütfen duyurmak istediğiniz mesajı yazınız!' })
                .setTimestamp();
            return message.channel.send({ embeds: [noArgsEmbed] });
        }

        const infoMessage = await message.channel.send('Mesaj tüm üyelere gönderiliyor... (biraz zaman alabilir)');
        let sentCount = 0, failedCount = 0, botCount = 0;

        const members = await message.guild.members.fetch();
        const sendPromises = members.map(async m => {
            if (m.user.bot) {
                botCount++;
                return;
            }
            const dmEmbed = new EmbedBuilder()
                .setTitle('Yeni Duyuru!')
                .setDescription(args)
                .setFooter({ text: `Sunucu: ${message.guild.name}`, iconURL: message.guild.iconURL() })
                .setTimestamp();
            try {
                await m.send({ embeds: [dmEmbed] });
                sentCount++;
                console.log(`Gönderildi: ${m.user.tag} ✅`);
            } catch {
                failedCount++;
                console.log(`Gönderilemedi: ${m.user.tag} ❌`);
            }
            await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit prevention
        });

        await Promise.all(sendPromises);
        await infoMessage.delete();

        const resultEmbed = new EmbedBuilder()
            .setAuthor({
                name: message.author.username,
                iconURL: message.author.displayAvatarURL({ dynamic: true })
            })
            .setDescription(
                `📬 Mesajınız toplam **${sentCount}** kişiye gönderildi!\n` +
                `🛑 **${failedCount}** kişiye gönderilemedi.\n` +
                `🤖 **${botCount}** bota gönderilmedi!`
            )
            .setTimestamp();
        await message.channel.send({ embeds: [resultEmbed] });
    }

    if (content.startsWith(prefix + 'ping')) {
        const msg = await message.channel.send('Pinging...');
        await msg.edit(`\`\`\`javascript\nDiscord Bot: ${Math.round(client.ws.ping)} ms\n\`\`\``);
    }
});

client.login(process.env.TOKEN);