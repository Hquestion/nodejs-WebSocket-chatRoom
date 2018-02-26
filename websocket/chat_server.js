var WebSocket = require('ws');
var wss = null;
var rooms = [1, 2];
var userNames = {};
var userRooms = {};

function initSocketServer(server){
    if(server) {
        wss = new WebSocket.Server({
            server: server
        });
    }
    if(!wss) {
        throw new Error('初始化socket服务失败！');
    }
    wss.on('connection', function(ws, req){
        //分配id
        ws.id = Math.ceil(Math.random() * 1000000);
        var userCount = wss.clients.size;
        //分配用户昵称
        assignUserName(ws, userCount, userNames);

        ws.on('message', function(msg){
            handlerMessage(msg, ws);
        });

        ws.on('close', function() {
            console.log("client closed connection!");
        });

        ws.on('error', function(e) {
            console.log("error!: " + e);
        });
    });
}

function handlerMessage(message, ws){
    message = JSON.parse(message);
    console.log('接受到用户消息：', message.type);
    switch(message.type) {
        case 'JOIN':
            userJoinRoom(message, ws);
            break;
        case 'MSG':
            broadcast(message, ws);
            break;
        default:
            break;
    }
}

function assignUserName(ws, count, userNames){
    userNames[ws.id] = '访客' + count;
}

function userJoinRoom(data, ws){
    data = data.data;
    var beforeRoom = data.beforeRoom,
        toEnterRoom = data.room;
    if(beforeRoom) {
        var roomUsers = userRooms[beforeRoom];
        var beforeIndex = roomUsers.findIndex(function(item){
            return item.id === ws.id;
        });
        if(beforeIndex > -1) {
            roomUsers.splice(beforeIndex, 1);
        }
        userRooms[beforeRoom] = roomUsers;
    }
    userRooms[toEnterRoom] = (userRooms[toEnterRoom] || []);
    var isUserExist = !!userRooms[toEnterRoom].find(function(item){
        return item.id === ws.id;
    });
    if(!isUserExist) {
        userRooms[toEnterRoom].push(ws);
        var userName = userNames[ws.id];
        broadcast({
            type: 'INFO',
            data: {
                message: !!beforeRoom ? (userName + '离开了房间' + beforeRoom + ',进入了房间' + toEnterRoom) : (userName + '进入了房间' + toEnterRoom)
            }
        }, ws);
    }
}

function broadcast(message, ws){
    if(message.type === 'INFO') {
        ws.send(JSON.stringify(message));
    }else if(message.type === 'MSG'){
        var data = message.data;
        var roomId = data.room;
        var roomClients = userRooms[roomId] || [];
        var toSendData = {
            user: userNames[ws.id],
            content: data.content,
            type: data.type || 'TEXT',
            isSelf: data.user.id === ws.id
        };
        roomClients.forEach(function(client, index){
            client.send(JSON.stringify({
                type: 'USER_MSG',
                data: toSendData
            }));
        });
    }
}

exports.init = initSocketServer;