import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

// ✅ Inicializa o OpenAI uma única vez, já com o header da v2
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
  defaultHeaders: {
    'OpenAI-Beta': 'assistants=v2',
  },
});

let assistant: OpenAI.Beta.Assistants.Assistant;
const activeChats = new Map<string, OpenAI.Beta.Threads.Thread>();

// ✅ Inicializa o assistente uma vez (idealmente logo após startar)
(async () => {
  try {
    assistant = await openai.beta.assistants.retrieve(
      process.env.OPENAI_ASSISTANT!
    );
    console.log('✅ Assistente carregado:', assistant.id);
  } catch (err) {
    console.error('❌ Falha ao carregar assistente:', err);
  }
})();

export async function initializeNewAIChatSession(
  chatId: string
): Promise<void> {
  console.log('📥 Inicializando nova sessão para:', chatId);
  if (activeChats.has(chatId)) return;

  const thread = await openai.beta.threads.create();
  activeChats.set(chatId, thread);
  console.log('🧵 Thread criada:', thread.id);
}

export async function mainOpenAI({
  currentMessage,
  chatId,
}: {
  currentMessage: string;
  chatId: string;
}): Promise<string> {
  console.log('📥 Entrando no mainOpenAI');
  const thread = activeChats.get(chatId);
  if (!thread) return '❗ Sessão de chat não encontrada.';

  await openai.beta.threads.messages.create(thread.id, {
    role: 'user',
    content: currentMessage,
  });

  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistant.id,
    instructions: assistant.instructions,
  });

  const messages = await checkRunStatus({ threadId: thread.id, runId: run.id });
  const content = messages.data[0]?.content[0];

  if (content?.type === 'text') {
    return content.text.value;
  } else {
    console.warn('⚠️ Conteúdo da IA não é texto:', content);
    return '⚠️ A resposta da IA não pôde ser interpretada como texto.';
  }
}

async function checkRunStatus({
  threadId,
  runId,
}: {
  threadId: string;
  runId: string;
}): Promise<any> {
  return await new Promise((resolve, reject) => {
    const startTime = Date.now();
    const TIMEOUT_LIMIT = 15000; // 15 segundos

    const verify = async (): Promise<void> => {
      const elapsed = Date.now() - startTime;
      console.log(`⏳ Verificando status após ${elapsed / 1000}s`);

      if (elapsed > TIMEOUT_LIMIT) {
        console.error('⛔ Tempo limite excedido para resposta da OpenAI.');
        reject(new Error('Tempo limite excedido para resposta da IA.')); return;
      }

      try {
        const runStatus = await openai.beta.threads.runs.retrieve(runId, {
          thread_id: threadId,
        });

        if (runStatus.status === 'completed') {
          const messages = await openai.beta.threads.messages.list(threadId);
          resolve(messages); 
        } else {
          setTimeout(verify, 1000); // 1 segundo entre verificações
        }
      } catch (err) {
        console.error('❌ Erro ao verificar status do run:', err);
        reject(err);
      }
    };

    verify();
  });
}
