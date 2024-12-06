
document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    function promptForUsername() {
        Swal.fire({
            title: 'Bienvenido',
            input: 'text',
            inputLabel: 'Ingresa tu nombre',
            inputPlaceholder: 'Nombre',
            allowOutsideClick: false,
            inputValidator: (value) => {
                if (!value || !value.trim()) {
                    return 'El nombre de usuario no puede estar vacío.';
                }
                return null;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const username = result.value.trim();
                console.log('Nombre de usuario recibido en cliente:', username); 
                if (username) {
                    document.getElementById('username').innerText = username;
                    socket.emit('usuarioNuevoConectado', username);
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se ingresó ningún nombre de usuario.'
                    }).then(() => {
                        promptForUsername(); 
                    });
                }
            }
        });
    }

    promptForUsername();

    const sendMessageButton = document.getElementById('sendMessage');
    const chatboxInput = document.getElementById('chatbox');

    // enviar el mensaje
    const sendMessage = () => {
        const message = chatboxInput.value.trim();
        if (message) {
            socket.emit('message', { message });
            chatboxInput.value = '';
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'El mensaje no puede estar vacío.'
            });
        }
    };

    // evt clic en el botón de enviar
    if (sendMessageButton && chatboxInput) {
        sendMessageButton.addEventListener('click', sendMessage);
    }

    // evt tecla en el campo de entrada del mensaje
    if (chatboxInput) {
        chatboxInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });


        chatboxInput.addEventListener('input', () => {
            socket.emit('typing');
        });
    }

    socket.on('messageLogs', (messages) => {
        const messageLogs = document.getElementById('messageLogs');
        if (messageLogs) {
            messageLogs.innerHTML = '';
            messages.forEach(msg => {
                const messageElement = document.createElement('p');
                messageElement.innerHTML = `<strong>${msg.user}:</strong> ${msg.text}`;
                messageLogs.appendChild(messageElement);
            });
        }
    });

    socket.on('userDisconnected', (user) => {
        Swal.fire({
            icon: 'info',
            title: 'Usuario desconectado',
            text: `${user} se ha desconectado`,
            toast: true,
            position: 'top-right',
            showConfirmButton: false,
            timer: 5000
        });
        
    });
    

    socket.on('connect', () => {
        console.log('Conectado al servidor');
    });

    socket.on('disconnect', () => {
        console.log('Desconectado del servidor');
    });

    socket.on('newUserConnected', (data) => {
        Swal.fire({
            text: "Nuevo usuario conectado",
            toast: true,
            position: 'top-right',
            icon: 'info',
            title: `${data.user} se ha unido al chat.`,
            showConfirmButton: false,
            timer: 5000
        });
    });

    socket.on('usuarioEscribiendo', (data) => {
        let objectTyping = document.getElementById('typing');
        if (objectTyping) {
            objectTyping.innerHTML = `${data.user} está escribiendo...`;
            setTimeout(() => {
                objectTyping.innerHTML = '';
            }, 2000);
        }
    });

    socket.on('userList', (users) => {
        const userList = document.getElementById('userList');
         if (userList) {
             userList.innerHTML = '';
             users.forEach(user => {
                 const userElement = document.createElement('p');
                 userElement.innerText = user;
                 userList.appendChild(userElement);
             });
         }
     });


    socket.on('historialDelChat', (messages) => {
        const messageLogs = document.getElementById('messageLogs');
        if (messageLogs) {
            messageLogs.innerHTML = '';
            messages.forEach(msg => {
                const messageElement = document.createElement('p');
                messageElement.innerHTML = `<strong>${msg.user}:</strong> ${msg.text}`;
                messageLogs.appendChild(messageElement);
            });
        }
    });
 
});
