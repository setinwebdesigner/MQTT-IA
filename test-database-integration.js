const mqtt = require('mqtt');
const mysql = require('mysql2/promise');

// MQTT Broker configuration
const mqttConfig = {
  host: 'localhost',
  port: 1883,
  clientId: 'test-client-' + Math.random().toString(16).substr(2, 8)
};

// MySQL Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mqtt_data',
  port: 3306
};

console.log('🚀 Starting Database Integration Test...\n');

// Função para gerar dados aleatórios
function generateRandomData(sensorId) {
  return {
    temperature: Math.round((20 + Math.random() * 20) * 100) / 100, // 20-40°C
    humidity: Math.round((40 + Math.random() * 40) * 100) / 100, // 40-80%
    timestamp: new Date().toISOString(),
    sensorId: sensorId,
    // Apenas os campos que estavam faltando
    originalTopic: 'sensor/data',
    processed: true,
    processedAt: new Date().toISOString()
  };
}

async function testDatabaseIntegration() {
  let dbConnection;
  
  try {
    // Connect to MySQL database
    console.log('📊 Connecting to MySQL database...');
    dbConnection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL database successfully!');
    
    // Connect to MQTT broker
    console.log('�� Connecting to MQTT broker...');
    const client = mqtt.connect(`mqtt://${mqttConfig.host}:${mqttConfig.port}`, {
      clientId: mqttConfig.clientId,
      clean: true
    });
    
    return new Promise((resolve, reject) => {
      client.on('connect', async () => {
        console.log('✅ Connected to MQTT broker successfully!');
        
        // Subscribe to processed data topic
        client.subscribe('processed/data', (err) => {
          if (err) {
            console.error('❌ Error subscribing to processed/data:', err);
            reject(err);
          } else {
            console.log('✅ Subscribed to processed/data topic');
          }
        });
        
        // Sensores para testar
        const sensors = ['sensor-001', 'sensor-002', 'sensor-003'];
        let messageCount = 0;
        
        // Função para enviar mensagem
        function sendRandomMessage() {
          const randomSensor = sensors[Math.floor(Math.random() * sensors.length)];
          const testMessage = generateRandomData(randomSensor);
          
          console.log(`\n�� Publishing message ${++messageCount}:`);
          console.log('Message:', JSON.stringify(testMessage, null, 2));
          
          client.publish('sensor/data', JSON.stringify(testMessage), async (err) => {
            if (err) {
              console.error('❌ Error publishing message:', err);
            } else {
              console.log('✅ Message published successfully!');
              
              // Verificar se foi salvo no banco após 2 segundos
              setTimeout(async () => {
                try {
                  const [rows] = await dbConnection.execute(
                    'SELECT * FROM readings WHERE sensor_id = ? ORDER BY created_at DESC LIMIT 1',
                    [testMessage.sensorId]
                  );
                  
                  if (rows.length > 0) {
                    console.log('✅ Data found in database:');
                    console.log('   - ID:', rows[0].id);
                    console.log('   - Sensor ID:', rows[0].sensor_id);
                    console.log('   - Temperature:', rows[0].temperature);
                    console.log('   - Humidity:', rows[0].humidity);
                    console.log('   - Created at:', rows[0].created_at);
                  } else {
                    console.log('❌ Data not found in database for sensor:', testMessage.sensorId);
                  }
                } catch (dbError) {
                  console.error('❌ Database query error:', dbError.message);
                }
              }, 2000);
            }
          });
        }
        
        // Enviar primeira mensagem imediatamente
        sendRandomMessage();
        
        // Enviar mensagens a cada 10 segundos
        const interval = setInterval(sendRandomMessage, 10000);
        
        // Listen for processed messages
        client.on('message', (topic, message) => {
          console.log(`\n�� Received processed message on topic ${topic}:`);
          try {
            const parsedMessage = JSON.parse(message.toString());
            console.log('Processed data:', JSON.stringify(parsedMessage, null, 2));
          } catch (e) {
            console.log('Raw message:', message.toString());
          }
        });
        
        // Cleanup após 2 minutos (12 mensagens)
        setTimeout(async () => {
          console.log('\n�� Cleaning up...');
          clearInterval(interval);
          
          // Show final database summary
          try {
            const [rows] = await dbConnection.execute('SELECT COUNT(*) as total FROM readings');
            console.log(`📊 Total records in database: ${rows[0].total}`);
            
            const [sensorStats] = await dbConnection.execute(`
              SELECT sensor_id, COUNT(*) as count, 
                     AVG(temperature) as avg_temp, 
                     AVG(humidity) as avg_humidity 
              FROM readings 
              GROUP BY sensor_id
            `);
            
            console.log('\n�� Sensor Statistics:');
            sensorStats.forEach(stat => {
              console.log(`   - ${stat.sensor_id}: ${stat.count} readings, Avg Temp: ${stat.avg_temp.toFixed(1)}°C, Avg Humidity: ${stat.avg_humidity.toFixed(1)}%`);
            });
            
          } catch (dbError) {
            console.error('❌ Database summary error:', dbError.message);
          }
          
          client.end();
          if (dbConnection) {
            await dbConnection.end();
          }
          console.log('✅ Test completed!');
          resolve();
        }, 120000); // 2 minutos
      });
      
      client.on('error', (err) => {
        console.error('❌ MQTT connection error:', err);
        reject(err);
      });
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (dbConnection) {
      await dbConnection.end();
    }
    throw error;
  }
}

// Run the test
testDatabaseIntegration()
  .then(() => {
    console.log('\n🎉 Database integration test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  });