import { Cliente } from '../models/cliente';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const buscarClientePorDocumento = async (documento: string) => {
  try {
    return await Cliente.findOne({ cpf_cnpj: documento });
  } catch (error) {
    console.error('Erro ao buscar cliente por documento:', error);
    return null;
  }
};