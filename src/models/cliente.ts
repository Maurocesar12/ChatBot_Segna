import { Schema, model } from 'mongoose';

const clienteSchema = new Schema({
  cpf: { type: String, required: true, unique: true },
  nome: String,
  seguros: [
    {
      tipo: String,
      apolice: String,
      vigencia: String,
      status: String
    }
  ]
});

export const Cliente = model('Cliente', clienteSchema, 'Clientes');
