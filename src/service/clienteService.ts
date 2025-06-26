import { Cliente } from '../models/cliente';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const buscarClientePorCPF = async (cpf: string) => {
  const cliente = await Cliente.findOne({ cpf });
  return cliente;
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const buscarClientePorCNPJ = async (cnpj: string) => {
  const cliente = await Cliente.findOne({cnpj});
  return cliente;
};
