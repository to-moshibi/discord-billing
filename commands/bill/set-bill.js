const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-bill')
        .setDescription('定期的な支払いを登録します')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('支払い名')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('金額(円)')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('month')
                .setDescription('前回の支払い月')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(12))

        .addIntegerOption(option =>
            option.setName('interval')
                .setDescription('支払い間隔(月)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(12))
        .addStringOption(option =>
            option.setName('note')
                .setDescription('メモ')
                .setRequired(false)),
    async execute(interaction) {
        const guildId =interaction.guildId

        const name = interaction.options.getString('name');
        const note = interaction.options.getString('note');
        const amount = interaction.options.getInteger('amount');
        const month = interaction.options.getInteger('month');
        const interval = interaction.options.getInteger('interval');
        const message = `支払い名: ${name}\n金額: ${amount}円\n支払い月: ${month}月\n支払い間隔: ${interval}か月ごと\n次回支払い: ${(month+interval)%12}月\nメモ: ${note}\n\n登録しますか？`;

        const confirm = new ButtonBuilder()
            .setCustomId('confirm')
            .setLabel('登録する')
            .setStyle(ButtonStyle.Success);

        const cancel = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('キャンセル')
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
            .addComponents(cancel, confirm);
        const response = await interaction.reply({
            content: message,
            components: [row],
        });
        const collectorFilter = i => i.user.id === interaction.user.id;

        try {
            const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 120_000 });
            if (confirmation.customId === 'confirm') {
                //登録処理
                const path = `./bills/${interaction.user.id}`;
                if (!fs.existsSync(path)) {
                    fs.mkdirSync(path);
                }
                fs.writeFileSync(`./bills/${interaction.user.id}/${interaction.id}.json`, JSON.stringify({
                    name: name,
                    amount: amount,
                    month: month,
                    interval: interval,
                    note: note,
                    paid : false,
                    guildId: guildId
                }));
                await confirmation.update({ content: `定期的な支払いを登録しました\n支払いの月にリマインダーを送信します\n今回分をすでに支払っている場合は、続けて\n/pay-bill\nを実行してください`, components: [] });
            } else if (confirmation.customId === 'cancel') {
                await confirmation.update({ content: 'Action cancelled', components: [] });
            }
        } catch (e) {
            await interaction.editReply({ content: '2分以内に応答がなかったため、登録をキャンセルしました', components: [] });
        }
    }
};