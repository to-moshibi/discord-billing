const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ls-billing')
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

        let message = '';
        for (const bill of billData) {
            message += `- 支払い名: ${bill.name} 金額: ${bill.amount}円 支払い月: ${bill.month}月 支払い間隔: ${bill.interval}月ごと メモ: ${(bill.note ? bill.note : 'なし')}\n`;
        }
        await interaction.reply(message);
    },
};