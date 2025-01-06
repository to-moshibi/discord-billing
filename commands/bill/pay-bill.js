const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('pay-bill')
        .setDescription('今回分の支払いを登録します'),
    async execute(interaction) {
        const path = `./bills/${interaction.user.id}`;
        if (!fs.existsSync(path)) {
            return await interaction.reply('定期的な支払いが登録されていません');
        }
        const files = fs.readdirSync(path);
        if (files.length === 0) {
            return await interaction.reply('定期的な支払いが登録されていません');
        }
        const options = [];
        for (const file of files) {
            const data = JSON.parse(fs.readFileSync(`${path}/${file}`));
            const option = new StringSelectMenuOptionBuilder()
                .setLabel(data.name + ' ' + data.amount + '円' + ' ' + data.month + '月' + ' ' + data.interval + 'ヶ月ごと' + ' ' + (data.note ? data.note : 'メモなし') + (data.paid? "支払済み": "未払い"))
                .setValue(file);
            options.push(option);
        }
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('paid-bill')
            .setPlaceholder('請求を選択してください')
            .addOptions(options);
        const row = new ActionRowBuilder()
            .addComponents(selectMenu);
            
        const response = await interaction.reply({
            content: '支払った請求を選択してください',
            components: [row],
        });
        const collectorFilter = i => i.user.id === interaction.user.id;

        try {
            const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 120_000 });
            const data = JSON.parse(fs.readFileSync(`${ path }/${ confirmation.values[0] }`));
            if (data.paid) {
                return await interaction.editReply({ content: `支払い「${ data.name }」は支払済みです`, components: [] });
            }
            data.paid = true;
            fs.writeFileSync(`${ path }/${ confirmation.values[0] }`, JSON.stringify(data));
            await interaction.editReply({ content: `支払い「${ data.name }」を支払い済みにしました}`, components: [] });
        } catch (e) {
            console.log(e)
            await interaction.editReply({ content: '2分以内に応答がなかったため、登録をキャンセルしました', components: [] });
        }
    }
};