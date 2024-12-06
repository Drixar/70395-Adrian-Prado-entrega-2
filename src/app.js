
import express from 'express';
import handlebars from 'express-handlebars';
import __dirname from './utils.js';
import viewsRouter from './routes/views.router.js';
import { Server } from 'socket.io';
import { ChatManager } from './managers/chatManager.js';

const chatManager = new ChatManager;

const app = express();
const httpServer = app.listen(8080, () => {
    console.log('Escuchando en puerto 8080');
});
const io = new Server(httpServer);

app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));

app.use('/', viewsRouter);

let messages = chatManager.getMessages();
let users = {};


io.on('connection', socket => {
    socket.on('usuarioNuevoConectado', (username) => {
        // console.log('Nombre de usuario recibido:', username);
        console.log(`${username} se ha conectado`);
        if (typeof username === 'string' && username.trim()) {
            username = username.trim();
            users[socket.id] = username;
            io.emit('userList', Object.values(users));
            socket.emit('historialDelChat', messages);
            socket.broadcast.emit('newUserConnected', { user: username });
        } else {
            console.error('Error: nombre de usuario inválido', username);
            socket.emit('errorMessage', 'Nombre de usuario no proporcionado o inválido');
        }
    });

    socket.on('disconnect', () => {
        if (users[socket.id]) {
            const disconnectedUser = users[socket.id];
            delete users[socket.id];
            io.emit('userDisconnected', `${disconnectedUser} se ha desconectado`);
            io.emit('userList', Object.values(users));
            console.log(`${disconnectedUser} se ha desconectado`);
        }
    });


    socket.on('message', (data) => {
        if (data.message && data.message.trim() !== "") {
            const date = new Date();
            const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
            const messages = chatManager.addMessage({ user: users[socket.id], text: data.message, date: formattedDate });
            io.emit('messageLogs', messages);

        } else {
            socket.emit('errorMessage', 'El mensaje no puede estar vacío.');
        }
    });

    socket.on('typing', () => {
        socket.broadcast.emit('usuarioEscribiendo', { user: users[socket.id] });
    });

    socket.on('disconnect', () => {
        let user = users[socket.id];
        delete users[socket.id];
        io.emit('userList', Object.values(users));
        if (user) {
            io.emit('userDisconnected', `${user} se ha desconectado del chat`);
        }
    });

});
