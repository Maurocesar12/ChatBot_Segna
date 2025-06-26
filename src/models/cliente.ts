import { Schema, model } from 'mongoose';

const clienteSchema = new Schema({
  cpf_cnpj: { type: String, required: true, unique: true },
  nome: String,
  seguros: [
    {
      apolice: String,
      produto: String,
      seguradora: String,
      vigencia_inicio: String,
      vigencia_final: String
    }
  ]
});

export const Cliente = model('Cliente', clienteSchema, 'Clientes');
