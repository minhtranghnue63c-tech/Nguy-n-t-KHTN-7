import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
    // Sử dụng process.cwd() thay cho '.' để lấy đường dẫn gốc chính xác hơn
    const env = loadEnv(mode, process.cwd(), '');

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Định nghĩa biến môi trường để code có thể đọc được (nếu dùng process.env)
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          // QUAN TRỌNG: Thay __dirname bằng process.cwd() để sửa lỗi
          '@': path.resolve(process.cwd(), '.'),
        }
      }
    };
});
