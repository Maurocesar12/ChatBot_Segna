
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const setores: Record<string, string> = {
  'cancelamento': 'dep_01',
  'boleto': 'dep_02',
  'suporte': 'dep_03',
  'vendas': 'dep_04'
};

export function detectarSetor(mensagem: string): string | null {
  const texto = mensagem.toLowerCase();
  for (const palavra in setores) {
    if (texto.includes(palavra)) {
      return setores[palavra];
    }
  }
  return null;
}

async function buscarContactIdPorNumero(numero: string): Promise<string | null> {
  const baseUrl = process.env.DIGISAC_URL;
  const token = process.env.DIGISAC_TOKEN;

  try {
    const response = await axios.get(`${baseUrl}/contacts?number=${numero}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data[0].id;
    }

    return null;
  } catch (error: any) {
    console.error("❌ Erro ao buscar contactId:", error.response?.data || error.message);
    return null;
  }
}

async function criarConversaTemporaria(numero: string, texto: string): Promise<boolean> {
  const baseUrl = process.env.DIGISAC_URL;
  const token = process.env.DIGISAC_TOKEN;
  const serviceId = process.env.DIGISAC_CONNECTION_ID;
  const userId = process.env.DIGISAC_USER_ID;
  const departamentoId = process.env.DIGISAC_DEPARTMENT_ID;

  try {
    const payload = {
      text: texto,
      type: "chat",
      serviceId,
      number: numero,
      userId,
      origin: "user",
      departmentId: departamentoId
    };

    const response = await axios.post(`${baseUrl}/messages`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log("📨 Mensagem enviada para criar conversa:", response.status);
    return true;
  } catch (error: any) {
    console.error("❌ Erro ao criar conversa temporária:", error.response?.data || error.message);
    return false;
  }
}

export async function transferirParaSetor(numero: string, departmentId: string, comentario: string): Promise<boolean> {
  let contactId = await buscarContactIdPorNumero(numero);

  if (!contactId) {
    console.warn("⚠️ Contato ainda não existe. Tentando criar conversa...");
    const criado = await criarConversaTemporaria(numero, comentario || "Iniciando atendimento automático");
    if (!criado) return false;

    // Espera breve para API atualizar contato
    await new Promise(resolve => setTimeout(resolve, 1000));

    contactId = await buscarContactIdPorNumero(numero);
    if (!contactId) {
      console.error("❌ Ainda não foi possível obter o contactId após criação da conversa.");
      return false;
    }
  }

  const baseUrl = process.env.DIGISAC_URL;
  const token = process.env.DIGISAC_TOKEN;
  const connectionId = process.env.DIGISAC_CONNECTION_ID;

  const url = `${baseUrl}/contacts/${contactId}/ticket/transfer`;
  console.log("📤 URL utilizada:", url);
  console.log("📦 JSON enviado:", {
    departmentId,
    connectionId,
    comments: comentario
  });

  try {
    await axios.post(
      url,
      {
        departmentId,
        connectionId,
        comments: comentario
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Atendimento transferido para o setor:', departmentId);
    return true;
  } catch (error: any) {
    if (error.response) {
      console.error('❌ Erro ao transferir atendimento:');
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('❌ Erro ao transferir atendimento:', error.message);
    }
    return false;
  }
}
