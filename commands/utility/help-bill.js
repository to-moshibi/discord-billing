//スラッシュコマンドのヘルプコマンド
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('help-bill')
        .setDescription('支払いに関するコマンドのヘルプを表示します'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('支払いに関するコマンドのヘルプ')
            .setDescription('支払いに関するコマンドのヘルプです。\n支払いを変更する場合は、一度消去して下さい')
            .addFields(
                { name: '/add-bill', value: '支払いを登録します。' },
                { name: '/ls-bill', value: '登録されている支払いを表示します。' },
                { name: '/rm-bill', value: '登録されている支払いを削除します。' },
                { name: '/pay-bill', value: '登録されている支払いを支払い済みにします。' }
            )
            .setColor(0x00FF00); // 緑色の16進数コード

        await interaction.reply({ embeds: [embed] });
    }
};