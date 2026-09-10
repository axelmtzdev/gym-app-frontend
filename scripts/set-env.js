const fs = require('fs');
const path = require('path');

const apiUrl = process.env.API_URL;

if (!apiUrl) {
  console.error('Falta la variable de entorno API_URL (ej. https://gym-app-backend-0vv6.onrender.com).');
  process.exit(1);
}

const contenido = `export const environment = {\n  apiUrl: '${apiUrl}',\n};\n`;

fs.writeFileSync(path.join(__dirname, '../src/environments/environment.ts'), contenido);
console.log(`src/environments/environment.ts generado con apiUrl=${apiUrl}`);
