const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-bill')
        .setDescription('定期的な支払いを消去します'),
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
                .setLabel(data.name + ' ' + data.amount + '円' + ' ' + data.month + '月' + ' ' + data.interval + 'ヶ月ごと' + ' ' + data.note)
                .setValue(file);
            options.push(option);
        }
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('remove-bill')
            .setPlaceholder('支払いを選択してください')
            .addOptions(options);
        const row = new ActionRowBuilder()
            .addComponents(selectMenu);
            
        const response = await interaction.reply({
            content: '消去する支払いを選択してください',
            components: [row],
        });
        const collectorFilter = i => i.user.id === interaction.user.id;

        try {
            const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 120_000 });
            const data = JSON.parse(fs.readFileSync(`${ path }/${ confirmation.values[0] }`));
            fs.unlinkSync(`${ path }/${ confirmation.values[0] }`);
            await interaction.editReply({ content: `支払い「${ data.name }」を消去しました`, components: [] });
        } catch (e) {
            console.log(e)
            await interaction.editReply({ content: '2分以内に応答がなかったため、登録をキャンセルしました', components: [] });
        }
    }
};