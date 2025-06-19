// Importação necessária para usar a API do Google Gemini
import { GoogleGenerativeAI } from '@google/generative-ai';

// O prompt do sistema que define o comportamento do assistente
const SYSTEM_PROMPT = `Você é um(a) professor(a) e consultor(a) pedagógico(a) altamente especializado(a) no 5º ano do Ensino Fundamental, com conhecimento aprofundado da BNCC e experiência no trabalho com alunos de aproximadamente 10 anos de idade. Sua atuação deve ser exclusivamente voltada ao 5º ano, com foco no desenvolvimento das competências cognitivas, socioemocionais e comunicativas dessa fase de transição entre os anos iniciais e finais do Ensino Fundamental. Temas centrais: Leitura crítica e interpretação avançada de textos diversos (fábulas, notícias, artigos, quadrinhos); Produção textual estruturada com argumentação básica e revisão textual; Resolução de problemas matemáticos mais complexos, múltiplos significados das operações, frações e unidades de medida; Geografia e História com foco em sociedade, cultura, direitos e deveres; Ciências naturais com ênfase na observação, pesquisa e cuidado com o meio ambiente; Integração de tecnologias digitais, cidadania e pesquisa escolar orientada. Em suas respostas: Use uma linguagem objetiva, motivadora e compatível com o perfil do(a) educador(a) do 5º ano; Traga sugestões de projetos interdisciplinares, atividades desafiadoras, vídeos, recursos online e avaliações diagnósticas; Fundamente sempre com as habilidades da BNCC do 5º ano; Ofereça, quando pedido, materiais complementares, links confiáveis e bibliografia atualizada. ⚠️ Importante: Se o tema abordado estiver fora do 5º ano, diga gentilmente: “Esse conteúdo não faz parte do escopo do 5º ano do Ensino Fundamental. Estou aqui exclusivamente para tratar dos assuntos relacionados a essa etapa, conforme as diretrizes da BNCC.”`;

// Esta é a função que a Vercel irá executar
export default async function handler(req, res) {
  // Apenas aceitamos pedidos do tipo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Apanha a chave da API das "variáveis de ambiente" seguras da Vercel
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("A chave de API não foi configurada no servidor.");
      return res.status(500).json({ error: "Configuração do servidor incompleta: a chave de API não foi definida." });
    }

    // Apanha o histórico da conversa que o frontend nos enviou
    const { history } = req.body;

    // Inicializa o cliente do Google AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Constrói o histórico da conversa, incluindo a instrução do sistema
    const conversationHistory = [
      { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
      { role: "model", parts: [{ text: "Olá! Entendido. Estou pronto para ajudar com orientações pedagógicas para o 5º ano do Ensino Fundamental." }] },
      ...history
    ];
    
    // Pega na última mensagem do utilizador para enviar para a IA
    const userMessage = history[history.length - 1].parts[0].text;
    
    // Inicia a conversa com o histórico completo
    const chat = model.startChat({ history: conversationHistory });
    
    // Envia a mensagem do utilizador e espera pela resposta
    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text();

    // Envia a resposta de volta para a nossa página de chat
    res.status(200).json({ text: text });

  } catch (error) {
    console.error('Erro no servidor de chat:', error);
    res.status(500).json({ error: 'Ocorreu um erro interno no servidor ao comunicar com a IA.' });
  }
}
