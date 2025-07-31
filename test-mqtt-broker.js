const mqtt = require('mqtt');

// MQTT Broker configuration
const brokerConfig = {
  host: 'localhost',
  port: 1883,
  clientId: 'test-client-' + Math.random().toString(16).substr(2, 8)
};

console.log('Connecting to MQTT broker...');
console.log(`Broker: ${brokerConfig.host}:${brokerConfig.port}`);
console.log(`Client ID: ${brokerConfig.clientId}`);

// Connect to MQTT broker
const client = mqtt.connect(`mqtt://${brokerConfig.host}:${brokerConfig.port}`, {
  clientId: brokerConfig.clientId,
  clean: true
});

client.on('connect', () => {
  console.log('✅ Connected to MQTT broker successfully!');
  
  // Subscribe to processed data topic
  client.subscribe('processed/data', (err) => {
    if (err) {
      console.error('❌ Error subscribing to processed/data:', err);
    } else {
      console.log('✅ Subscribed to processed/data topic');
    }
  });
  
  // Publish test message to sensor/data topic
  const testMessage = {
    temperature: 45,
    humidity: 90,
    timestamp: new Date().toISOString(),
    sensorId: 'test-sensor-001',
    // Additional fields that will be processed by n8n
    originalTopic: 'sensor/data',
    processed: true,
    processedAt: new Date().toISOString()
  };
  
  console.log('📤 Publishing test message to sensor/data...');
  console.log('Message:', JSON.stringify(testMessage, null, 2));
  
  client.publish('sensor/data', JSON.stringify(testMessage), (err) => {
    if (err) {
      console.error('❌ Error publishing message:', err);
    } else {
      console.log('✅ Test message published successfully!');
      console.log('⏳ Waiting for processed message...');
    }
  });
});

client.on('message', (topic, message) => {
  console.log(`📥 Received message on topic ${topic}:`);
  try {
    const parsedMessage = JSON.parse(message.toString());
    console.log('Processed data:', JSON.stringify(parsedMessage, null, 2));
  } catch (e) {
    console.log('Raw message:', message.toString());
  }
});

client.on('error', (err) => {
  console.error('❌ MQTT connection error:', err);
});

client.on('close', () => {
  console.log('🔌 MQTT connection closed');
});

// Cleanup after 10 seconds
setTimeout(() => {
  console.log('🔄 Disconnecting from MQTT broker...');
  client.end();
  process.exit(0);
}, 10000); 