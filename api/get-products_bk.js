const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_TOKEN });

module.exports = async (req, res) => {
  try {
    if (!process.env.PRODUCT_DB_ID) {
      throw new Error("缺少 PRODUCT_DB_ID 環境變數");
    }

    const response = await notion.databases.query({
      database_id: process.env.PRODUCT_DB_ID,
    });

    const products = response.results.map(page => {
      const props = page.properties;

      // 1. 抓取商品名稱
      const name = props['商品名稱']?.title[0]?.plain_text || '未命名商品';

      // 2. 抓取價格
      const price = props['價格']?.number || 0;

      // 3. 抓取規格選項
      let specs = [];
      if (props['規格']?.multi_select?.length > 0) {
        specs = props['規格'].multi_select.map(s => s.name);
      } else {
        specs = ['預設規格'];
      }

      return { id: page.id, name, price, specs };
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("GET Products 錯誤:", error.message);
    res.status(500).json({ error: error.message });
  }
};
