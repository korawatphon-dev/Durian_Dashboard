const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serving static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Mock Database for GAP/DOA Certificates
const mockCertificates = [
  { id: "GAP-21-00123", type: "GAP สวน", name: "สวนทุเรียนนายสมชาย ใจดี", province: "จันทบุรี", status: "ผ่านการรับรอง", expire: "2028-11-15", gacc: "พร้อมส่งออก" },
  { id: "GAP-22-00456", type: "GAP สวน", name: "สวนทุเรียนสมศักดิ์ นวัตกรรม", province: "ระยอง", status: "ผ่านการรับรอง", expire: "2027-05-20", gacc: "พร้อมส่งออก" },
  { id: "GMP-11-00890", type: "GMP โรงแพ็ค", name: "ล้งส่งออกทุเรียนทองคำ จันทบุรี", province: "จันทบุรี", status: "ผ่านการรับรอง", expire: "2026-12-01", gacc: "พร้อมส่งออก" },
  { id: "GAP-23-00999", type: "GAP สวน", name: "สวนวิจัยเกษตรพัฒนา", province: "ชุมพร", status: "รอต่ออายุ", expire: "2024-01-10", gacc: "ระงับชั่วคราว" }
];

// 1. Real-time / Mocked Weather API Endpoint
app.get('/api/weather', async (req, res) => {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (apiKey) {
      // Chanthaburi coordinates
      const lat = 12.6112, lon = 102.1038;
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=th`);
      return res.json({
        temp: Math.round(response.data.main.temp),
        humidity: response.data.main.humidity,
        description: response.data.weather[0].description,
        location: response.data.name,
        source: 'OpenWeather Live API'
      });
    }

    // Default Fallback Realtime Simulation
    res.json({
      temp: 31,
      humidity: 78,
      description: "เมฆบางส่วน เหมาะแก่การทำดอก",
      location: "โซนภาคตะวันออก (จันทบุรี/ระยอง)",
      source: "ระบบจำลองสภาพอากาศภูมิภาค"
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// 2. GAP / DOA Certificate Search API
app.get('/api/certificates', (req, res) => {
  const query = (req.query.q || '').toLowerCase().trim();
  if (!query) {
    return res.json(mockCertificates);
  }

  const results = mockCertificates.filter(cert => 
    cert.id.toLowerCase().includes(query) ||
    cert.name.toLowerCase().includes(query) ||
    cert.province.toLowerCase().includes(query) ||
    cert.type.toLowerCase().includes(query)
  );

  res.json(results);
});

// 3. GISTDA Satellite Plot Scanner API
app.post('/api/gistda/scan', (req, res) => {
  const { plotId } = req.body;
  const targetId = plotId || 'PLOT-TH-12894';

  // Satellite analytical data simulation
  res.json({
    plotId: targetId,
    ndvi: (0.75 + Math.random() * 0.15).toFixed(2),
    treeCount: Math.floor(480 + Math.random() * 80),
    ndwi: (-0.15 + Math.random() * 0.08).toFixed(2),
    estimatedYieldTons: (28 + Math.random() * 8).toFixed(1),
    healthStatus: "สมบูรณ์สูง (High Vigour)",
    scanTimestamp: new Date().toISOString(),
    aiRecommendation: "แปลงนี้มีดัชนีคลอโรฟิลล์สูง ทรงพุ่มหนาแน่นสมบูรณ์ พร้อมสำหรับการทำดอก ควรควบคุมระดับความชื้นดินให้คงที่ก่อนเริ่มระยะแทงช่อดอก"
  });
});

// Default Fallback Route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Express Server for Local Execution
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`Durian Intelligence Server is running!`);
    console.log(`Open Dashboard: http://localhost:${PORT}`);
    console.log(`=================================================`);
  });
}

module.exports = app;