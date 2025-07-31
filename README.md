# 🚀 IoT MQTT Dashboard

Dashboard em tempo real para monitoramento de sensores IoT usando MQTT, n8n, MySQL e Node.js.

## 📋 Funcionalidades

- ✅ **Dashboard em Tempo Real** - Interface moderna e responsiva
- ✅ **Integração MQTT** - Recebe dados de sensores IoT
- ✅ **Processamento n8n** - Workflow automatizado para processar dados
- ✅ **Banco de Dados MySQL** - Armazenamento persistente de dados
- ✅ **APIs REST** - Endpoints para consulta de dados
- ✅ **Gráficos Interativos** - Visualização de temperatura e umidade
- ✅ **Sistema de Alertas** - Notificações automáticas
- ✅ **Atualização Automática** - Dados atualizados a cada 10 segundos

## 🏗️ Arquitetura

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Sensores  │───▶│   Broker    │───▶│     n8n     │───▶│    MySQL    │
│    IoT      │    │    MQTT     │    │  Workflow   │    │  Database   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                              │
                                                              ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Dashboard  │◀───│   Express   │◀───│     API     │◀───│   Dados     │
│    Web      │    │   Server    │    │   REST      │    │  Processados│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript, Chart.js
- **Backend**: Node.js, Express.js
- **Banco de Dados**: MySQL (XAMPP)
- **Automação**: n8n
- **Protocolo**: MQTT
- **Visualização**: Chart.js, Font Awesome

## 📦 Instalação

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v14 ou superior)
- [XAMPP](https://www.apachefriends.org/) (MySQL)
- [n8n](https://n8n.io/) (instalação local ou cloud)

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/iot-mqtt-dashboard.git
cd iot-mqtt-dashboard
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o banco de dados

1. Inicie o XAMPP (Apache e MySQL)
2. Acesse phpMyAdmin: `http://localhost/phpmyadmin`
3. Crie o banco de dados `mqtt_data`
4. Execute o SQL para criar a tabela:

```sql
CREATE TABLE readings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sensor_id VARCHAR(50),
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    timestamp DATETIME,
    processed_at DATETIME,
    original_topic VARCHAR(100),
    raw_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Configure o n8n

1. Instale o n8n: `npm install -g n8n`
2. Inicie o n8n: `n8n start`
3. Configure o workflow conforme o guia em `n8n-mqtt-workflow-guide.md`

### 5. Inicie o servidor

```bash
node server.js
```

### 6. Acesse o dashboard

Abra o navegador e acesse: `http://localhost:3000`

## 🧪 Testando o Sistema

### Enviar dados de teste

```bash
npm run test
```

Este comando enviará dados simulados de sensores para o broker MQTT.

## 📊 Estrutura do Projeto

```
iot-mqtt-dashboard/
├── dashboard.html          # Interface do dashboard
├── server.js              # Servidor Express com APIs
├── test-database-integration.js  # Script de teste
├── package.json           # Dependências do projeto
├── README.md             # Este arquivo
└── docs/                 # Documentação adicional
```

## 🔧 APIs Disponíveis

### GET /api/sensors
Retorna dados mais recentes de todos os sensores.

**Resposta:**
```json
[
  {
    "sensor_id": "sensor-001",
    "temperature": "30.77",
    "humidity": "78.45",
    "timestamp": "2025-07-31T04:03:40.000Z",
    "created_at": "2025-07-31T01:03:40.000Z"
  }
]
```

### GET /api/stats
Retorna estatísticas gerais e alertas.

**Resposta:**
```json
{
  "stats": {
    "total_sensors": 3,
    "total_readings": 32,
    "avg_temperature": "29.57",
    "avg_humidity": "61.81"
  },
  "alerts": [...]
}
```

### GET /api/history/:sensorId
Retorna histórico de um sensor específico.

## 🎯 Funcionalidades do Dashboard

### 📈 Estatísticas em Tempo Real
- Total de sensores ativos
- Temperatura média
- Umidade média
- Total de leituras

### 🌡️ Cards dos Sensores
- Temperatura atual
- Umidade atual
- Última atualização
- Status de conectividade

### 📊 Gráficos Interativos
- Histórico de temperatura
- Histórico de umidade
- Atualização automática

### ⚠️ Sistema de Alertas
- Temperatura alta (>30°C)
- Temperatura baixa (<15°C)
- Umidade alta (>80%)
- Umidade baixa (<30%)

## 🔄 Workflow n8n

O workflow processa dados MQTT através de:

1. **MQTT Trigger** - Recebe dados do tópico `sensor/data`
2. **Code Node** - Processa e modifica os dados
3. **MySQL Node** - Insere dados no banco
4. **MQTT Publisher** - Publica dados processados

## 🚨 Troubleshooting

### Erro: "Cannot find module 'mysql2/promise'"
```bash
npm install
```

### Erro: "Unknown column in field list"
Verifique se a tabela `readings` foi criada corretamente no MySQL.

### Dashboard não carrega dados
1. Verifique se o servidor está rodando: `node server.js`
2. Teste as APIs: `curl http://localhost:3000/api/sensors`
3. Limpe o cache do navegador: `Ctrl + F5`

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Se você encontrar algum problema ou tiver dúvidas, abra uma issue no GitHub.

---

**Desenvolvido com ❤️ para monitoramento IoT** 