import wppconnect from '@wppconnect-team/wppconnect';
import dotenv from 'dotenv';
import { initializeNewAIChatSession, mainOpenAI } from './service/openai';
import { splitMessages, sendMessagesWithDelay } from './util';
import { mainGoogle } from './service/google';
import { detectarSetor, transferirParaSetor } from './service/router';

dotenv.config();
type AIOption = 'GPT' | 'GEMINI';

const messageBufferPerChatId = new Map();
const messageTimeouts = new Map();
const AI_SELECTED: AIOption = (process.env.AI_SELECTED as AIOption) || 'GEMINI';
const MAX_RETRIES = 3;

if (AI_SELECTED === 'GEMINI' && !process.env.GEMINI_KEY) {
  throw Error(
    'Você precisa colocar uma key do Gemini no .env! Crie uma gratuitamente em https://aistudio.google.com/app/apikey?hl=pt-br'
  );
}

if (
  AI_SELECTED === 'GPT' &&
  (!process.env.OPENAI_KEY || !process.env.OPENAI_ASSISTANT)
) {
  throw Error(
    'Para utilizar o GPT você precisa colocar no .env a sua key da openai e o id do seu assistante.'
  );
}

wppconnect
  .create({
    session: 'sessionName',
    catchQR: (base64Qrimg, asciiQR, attempts, urlCode) => {
      console.log('Terminal qrcode: ', asciiQR);
    },
    statusFind: (statusSession, session) => {
      console.log('Status Session: ', statusSession);
      console.log('Session name: ', session);
    },
    headless: false,
  })
  .then((client) => {
    start(client);
  })
  .catch((erro) => {
    console.log(erro);
  });

async function start(client: wppconnect.Whatsapp): Promise<void> {
  client.onMessage((message) => {
    (async () => {  
      if (
        message.type === 'chat' &&
        !message.isGroupMsg &&
        message.chatId !== 'status@broadcast' &&
        typeof message.body === 'string'
      ) {
          const chatId: string =
          typeof message.chatId === 'string'
            ? message.chatId
            : message.chatId._serialized;

        const blacklist = ['atendente, cancelar'];
        const isBlocked = blacklist.some(palavra =>
          message.body!.toLowerCase().includes(palavra.toLowerCase())
        );
        if (isBlocked) {
          console.log(`🔕 Mensagem bloqueada por palavra-chave: "${message.body}"`);
          return;
        };

        // NOVO: Verificar e transferir para setor no Digisac
        const departmentId = detectarSetor(message.body);
        if (departmentId) {
          await transferirParaSetor(chatId, departmentId, message.body);
          console.log(`🔁 Mensagem direcionada ao setor ${departmentId} via Digisac.`);
          return;
      }


        console.log('Mensagem recebida:', message.body);
        if (AI_SELECTED === 'GPT') {
          await initializeNewAIChatSession(chatId);
        };

        if (!messageBufferPerChatId.has(chatId)) {
          messageBufferPerChatId.set(chatId, [message.body]);
        } else {
          messageBufferPerChatId.set(chatId, [
            ...messageBufferPerChatId.get(chatId),
            message.body,
          ]);
        };

        if (messageTimeouts.has(chatId)) {
          clearTimeout(messageTimeouts.get(chatId));
        };
        console.log('Aguardando novas mensagens...');
        messageTimeouts.set(
          chatId,
          setTimeout(() => {
            (async () => {
              const mensagens = messageBufferPerChatId.get(chatId);
              const currentMessage: string = mensagens?.length
                ? mensagens.join('')
                : message.body;

              let answer = '';
              for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                try {
                  if (AI_SELECTED === 'GPT') {
                    answer = await mainOpenAI({
                      currentMessage,
                      chatId,
                    });
                  } else {
                    answer = await mainGoogle({
                      currentMessage,
                      chatId,
                    });
                  }
                  break;
                } catch (error) {
                  if (attempt === MAX_RETRIES) {
                    throw error;
                  }
                }
              }
              const messages = splitMessages(answer);
              console.log('Enviando mensagens...');
              await sendMessagesWithDelay({
                client,
                messages,
                targetNumber: message.from,
              });
              messageBufferPerChatId.delete(chatId);
              messageTimeouts.delete(chatId);
            })();
          }, 15000)
        );
      }
    })();
  });
}
