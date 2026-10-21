const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_TOKEN });

module.exports = async (req, res) => {
  try {
    // 查詢 A 資料庫（商品資料庫）
    const response = await notion.databases.query({
      database_id: process.env.PRODUCT_DB_ID, 
    });

    const products = response.results.map(page => {
      return {
        id: page.id,
        // 請確認您的商品名稱欄位名稱，預設為 Title
        name: page.properties['商品名稱']?.title[0]?.plain_text || '未命名商品',
        price: page.properties['價格']?.number || 0
      };
    });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
