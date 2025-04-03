import { useEffect, useState } from "react";
import Dash from "./components/Dash";

function App() {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const eventSource = new EventSource("http://localhost:3001/events");

        eventSource.onmessage = (event) => {
            const newMessage = JSON.parse(event.data);
            setMessages(prev => [...prev, newMessage]);
        };

        return () => {
            eventSource.close(); // Fecha a conexão ao desmontar o componente
        };
    }, []);

    return (
        <div>
            <h1>Atualizações do Servidor</h1>
            <ul>
                {messages.map((msg, index) => (
                    <li key={index}>{msg.message} - {new Date(msg.timestamp).toLocaleTimeString()}</li>
                ))}
            </ul>
            <Dash tipoEventoProp={"Interno"} eventoNomeProp={"20251"} salaProp={"DSM2"}/>
        </div>
    );
}

export default App;
