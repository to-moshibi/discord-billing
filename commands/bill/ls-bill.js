const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ls-bill')
        .setDescription('登録されている支払いを表示します'),
    async execute(interaction) {
        const path = `./bills/${interaction.user.id}`;
        if (!fs.existsSync(path)) {
            return await interaction.reply('登録されている支払いはありません');
        }
        const files = fs.readdirSync(path);
        if (files.length === 0) {
            return await interaction.reply('登録されている支払いはありません');
        }
        const billData = [];
        for (const file of files) {
            const data = JSON.parse(fs.readFileSync(`${path}/${file}`));
            billData.push(data);
        }
        let embed = new EmbedBuilder()
            .setTitle('登録されている支払い')
            .setDescription('登録されている支払いです')
            .setColor(0x00FF00); // 緑色の16進数コード
        for (const data of billData) {
            embed.addFields({ name: data.name, value: `${data.amount}円 ${data.month}月 ${data.interval}ヶ月ごと ${data.note ? data.note : 'メモなし'} ${data.paid ? '支払済み' : '未払い'}` });
        }
        await interaction.reply({ embeds: [embed] });
    },
};