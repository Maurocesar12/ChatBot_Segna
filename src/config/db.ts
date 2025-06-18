import mongoose from 'mongoose';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI ?? '');
    console.log('✅ MongoDB conectado');
  } catch (error) {
    console.error('❌ Erro ao conectar no MongoDB:', error);
    process.exit(1);
  }
};