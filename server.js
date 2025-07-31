const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const app = express();
const port = 3000;

// Configuração do banco de dados
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mqtt_data',
  port: 3306
};

// Servir arquivos estáticos
app.use(express.static('.'));

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// API para buscar dados dos sensores
app.get('/api/sensors', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Buscar dados mais recentes de cada sensor
    const [rows] = await connection.execute(`
      SELECT 
        sensor_id,
        temperature,
        humidity,
        timestamp,
        processed_at,
        original_topic,
        raw_data,
        created_at
      FROM readings 
      WHERE id IN (
        SELECT MAX(id) 
        FROM readings 
        GROUP BY sensor_id
      )
      ORDER BY created_at DESC
    `);
    
    await connection.end();
    
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// API para buscar histórico de dados
app.get('/api/history/:sensorId', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const sensorId = req.params.sensorId;
    
    // Buscar últimos 50 registros do sensor
    const [rows] = await connection.execute(`
      SELECT 
        temperature,
        humidity,
        created_at
      FROM readings 
      WHERE sensor_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `, [sensorId]);
    
    await connection.end();
    
    res.json(rows.reverse()); // Inverter para ordem cronológica
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// API para buscar estatísticas
app.get('/api/stats', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Estatísticas gerais
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT sensor_id) as total_sensors,
        COUNT(*) as total_readings,
        AVG(temperature) as avg_temperature,
        AVG(humidity) as avg_humidity,
        MAX(created_at) as last_reading
      FROM readings
    `);
    
    // Alertas recentes (temperatura > 30 ou < 15, umidade > 80 ou < 30)
    const [alerts] = await connection.execute(`
      SELECT 
        sensor_id,
        temperature,
        humidity,
        created_at
      FROM readings 
      WHERE temperature > 30 OR temperature < 15 OR humidity > 80 OR humidity < 30
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    await connection.end();
    
    res.json({
      stats: stats[0],
      alerts: alerts
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
  console.log(`📊 Dashboard disponível em http://localhost:${port}`);
  console.log(`🔗 APIs disponíveis:`);
  console.log(`   - GET /api/sensors - Dados dos sensores`);
  console.log(`   - GET /api/history/:sensorId - Histórico do sensor`);
  console.log(`   - GET /api/stats - Estatísticas gerais`);
}); 