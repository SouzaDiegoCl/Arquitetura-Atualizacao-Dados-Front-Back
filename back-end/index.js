import express from "express";
import cors from "cors";

//Config padrão
const app = express();
app.use(cors());

// Lista de conexões abertas exemplo
let clients = [];
// Lista de conexões abertas sobre o evento interno
let clientsInterno = [];

//Exemplo de funcionamento do SERVER SENT EVENTS
app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Adiciona o cliente na lista de conexões
  clients.push(res);

  setInterval(() => {
    res.write(
      `data: ${JSON.stringify({
        message: "Atualização do servidor!!!",
        timestamp: new Date(),
      })}\n\n`
    );
  }, 5000);

  // Quando o cliente se desconecta, removemos ele
  req.on("close", () => {
    clients = clients.filter((client) => client !== res);
  });
});

// Evento específico para o tipo "Interno"
//Ou seja o front abre uma conexão com essa rota se caso ele estiver aberto em uma tela de dash que seja de evento interno e esteja dentro da data de votação
//Armazenamos os clientes conectados
app.get("/events/Interno", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Adiciona o cliente na lista de conexões
  clientsInterno.push(res);
  // Quando o cliente se desconecta, removemos ele
  req.on("close", () => {});
});

//Após isso teríamos algo assim:

//Essa função para enviar uma mensagem para todos os clientes de votação Internos conectados
/* 
Esssa função deve ser chamada quando houver uma atualização de votos no evento interno no banco
A partir daí temos duas possibilidades:

1 - Deixamos o listener do banco no back-end de Integração e então eles enviam para nós o json seguindo o padrão que passamos para o front. Nós pegamos esse json e enviamos para o front-end pela conexão, o front-end a partir daí vai atualizar os dados da tela caso a tela que ele esteja bata com o json enviado tipo se a sala e o evento forem iguais ao que ele está no momento.

2 - Passamos o listener para cá e então a partir daí seguimos o mesmo fluxo descrito acima

- A única diferença agora é saber se o listener fica aqui ou deixa no webhook mesmo, não vejo problema em deixar para o time de Integração, mas teria que ser bem acordado o json que eles vão enviar para nós, para que possamos enviar para o front-end e ele consiga atualizar os dados da tela corretamente. 


*/

//Rota para requisição
/* 
/dash/Interno/20251/DSM2 → Funciona
/dash/Interno/20251 → Não funciona
/dash/Externo/20251 → Funciona
*/
let dadosSimulados ;

//Turma é opcional
app.get("/dash/:tipoEvento/:nomeEvento/{:turma}", (req, res) => {
  const { tipoEvento, nomeEvento, turma } = req.params;

  if (tipoEvento === "Interno" && !turma) {
    return res
      .status(400)
      .json({ error: "Turma é obrigatória para eventos internos." });
  }

  //Com isso a gente simula a busca no banco de dados
  //E o retorno seria algo como:
  /* if (dadosSimulados) {
    return res.json(dadosSimulados);
  } */
  return res.json(dadosSimulados);
});

const sendEvent = (message) => {
  clientsInterno.forEach((client) =>
    client.write(`data: ${JSON.stringify(message)}\n\n`)
  );
};

//Vou simular como se tivéssemos seguido a opção 1.

// É como se a cada 3 segundos houvesse um evento de voto
setInterval(() => {
  dadosSimulados = {
    id: 1,
    nome: "20251",
    tipoEvento: "Interno",
    descricao: "Descrição do evento vindo do banco",
    participantes: 120,
    votacao: {
      nomeSala: "DSM2",
      candidatos: [
        {
          id: 1,
          nome: "Ana",
          qtdVotos: Math.floor(Math.random() * 20) + 1,
        },
        {
          id: 2,
          nome: "Carlos",
          qtdVotos: Math.floor(Math.random() * 20) + 1,
        },
        {
          id: 3,
          nome: "Antonio",
          qtdVotos: Math.floor(Math.random() * 20) + 1,
        },
      ],
    },
  };

  sendEvent(dadosSimulados);
}, 9000); //A cada 3 segundos, só para simular o funcionamento do servidor

//Inicialização Padrão
app.get("/", (req, res) => {
  res.send("Servidor SSE rodando...");
});
app.listen(3001, () => {
  console.log("Servidor SSE rodando na porta 3001...");
});
