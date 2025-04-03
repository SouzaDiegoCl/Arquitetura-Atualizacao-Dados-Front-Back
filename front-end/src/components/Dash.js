import { useEffect, useState } from "react";
function Dash({ tipoEventoProp, eventoNomeProp, salaProp }) {
  const [dadosDash, setDadosDash] = useState(null); // Estado para armazenar os dados

  tipoEventoProp = "Interno";
  eventoNomeProp = "20251";
  salaProp = "DSM2";

  async function fetchDados() {
    try {
      const response = await fetch(
        `http://localhost:3001/dash/${tipoEventoProp}/${eventoNomeProp}/${salaProp}`
      );
      if (!response.ok) {
        throw new Error("Erro ao buscar dados do evento");
      }
      const data = await response.json();
      setDadosDash(data);
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  }

  useEffect(() => {
    //Roda quando o componente é montado e caso os props mudem:

    //Aqui iriamos requisitar para o banco de dados
    //Por exemplo `http://localhost:4000/dash/${tipoEventoProp}/${salaProp}?nomeEvento=${eventoNomeProp}`que é igual a  "http://localhost:4000/dash/Interno/20251/DSM2"

    fetchDados();

    let eventSource = null;
    //A partir daqui iremos verificar se a data atual está dentro do intervalo de tempo do evento
    if (true) {
      //Se sim, então iremos abrir a conexão com o servidor para receber as mensagens do evento
      //Caso contrário, não abrir a conexão e mostrar uma mensagem de que o evento não está ativo
      //O código abaixo é apenas um exemplo de como abrir a conexão com o servidor para receber as mensagens do evento
      eventSource = new EventSource(
        `http://localhost:3001/events/${tipoEventoProp}`
      );

      //Toda vez que tiver um voto ele vai receber uma mensagem do servidor e atualizar o estado do dashboard com os dados mais recentes do evento
      eventSource.onmessage = (event) => {
        const newMessage = JSON.parse(event.data);

        if (
          newMessage.nome === eventoNomeProp &&
          newMessage.votacao.nomeSala === salaProp
        ) {
          //Aqui verificamos se a mensagem recebida é do evento e sala que estamos interessados
          //Caso contrário, não fazemos nada
          setDadosDash((prev) => (prev = newMessage)); //Atualiza os dados do dashboard com a nova mensagem recebida
        }
      };
    }

    return () => {
      eventSource.close(); // Fecha a conexão ao desmontar o componente
    };
  }, [eventoNomeProp, salaProp, tipoEventoProp]);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to the dashboard!</p>
      {/* Só mostra os dados após estarem carregados */}
      {dadosDash ? (
        <ul>
          {dadosDash.votacao.candidatos
            .sort((a, b) => b.qtdVotos - a.qtdVotos)
            .map((candiato, index) => (
              <li key={index}>
                {index + 1} - {candiato.nome} - {candiato.qtdVotos}
              </li>
            ))}
        </ul>
      ) : (
        <></>
      )}
    </div>
  );
}

export default Dash;
