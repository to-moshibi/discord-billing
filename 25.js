const { guildId } = require('./config.json');
const socket = require('socket.io-client')('ws://localhost:3001');
const fs = require('fs');
socket.on('connect', () => {
    console.log('Connected to the socket server');
    socket.emit('message', { guildId: guildId, message: '毎月25日の自動実行を開始します' });
    const billsPath = './bills';
    const bills = fs.readdirSync(billsPath);
    for (const bill of bills) {
        const files = fs.readdirSync(`${billsPath}/${bill}`);
        for (const file of files) {
            const data = JSON.parse(fs.readFileSync(`${billsPath}/${bill}/${file}`));
            if ((data.month + data.interval) % 12 == new Date().getMonth() + 1 && !data.paid) {
                
                socket.emit('message', { guildId: data.guildId, message: `今月の支払い「${data.name}」 ${data.amount}円の支払いがまだ行われていません\n支払いが完了したら /pay-bill を実行してください` });
                
            }
        }
    }
});