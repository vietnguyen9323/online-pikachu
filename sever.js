const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static('public'));

let rooms = {};

io.on('connection', (socket) => {
    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        if (!rooms[roomId]) {
            // Tạo bàn chơi 6x8 ngẫu nhiên
            let board = [];
            let icons = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24];
            icons.sort(() => Math.random() - 0.5);
            for (let r = 0; r < 6; r++) {
                board.push(icons.slice(r * 8, (r + 1) * 8));
            }
            rooms[roomId] = { board, score: {} };
        }
        rooms[roomId].score[socket.id] = 0;
        io.to(roomId).emit('init_game', { board: rooms[roomId].board, score: rooms[roomId].score });
    });

    socket.on('match_tiles', ({ roomId, p1, p2 }) => {
        if (rooms[roomId]) {
            rooms[roomId].board[p1.r][p1.c] = 0;
            rooms[roomId].board[p2.r][p2.c] = 0;
            rooms[roomId].score[socket.id] = (rooms[roomId].score[socket.id] || 0) + 10;
            io.to(roomId).emit('update_board', { p1, p2, score: rooms[roomId].score });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
