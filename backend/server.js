import { config } from 'dotenv';
import app from './app.js';

config(); // This should load your environment variables

console.log('MongoDB URI:', process.env.MONGO_URI); // Log to check if MONGO_URI is available



app.listen(process.env.PORT, () => {
  console.log(`Server listening at port ${process.env.PORT}`);
});
