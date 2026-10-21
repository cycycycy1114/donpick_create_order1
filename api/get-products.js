const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_TOKEN });

module.exports = async (req, res) => {
  try {
    if (!process.env.PRODUCT_DB_ID) {
      throw new Error("缺少 PRODUCT_DB_ID 環境變數");
    }

    // 查詢 A 資料庫（商品資料庫）
    const response = await notion.databases.query({
      database_id: process.env.PRODUCT_DB_ID,
    });

    const products = response.results.map(page => {
      // 1. 自動尋找標題欄位作為商品名稱
      const titlePropKey = Object.keys(page.properties).find(
        key => page.properties[key].type === 'title'
      );
      const name = titlePropKey ? page.properties[titlePropKey].title[0]?.plain_text : '未命名商品';

      // 2. 自動尋找數字欄位作為價格
      const pricePropKey = Object.keys(page.properties).find(
        key => page.properties[key].type === 'number'
      );
      const price = pricePropKey ? page.properties[pricePropKey].number : 0;

      // 3. 讀取 A 資料庫的「規格」欄位 (支援 Select / Multi-select / Rich text)
      let specs = ['預設規格'];
      const specProp = page.properties['規格'] || page.properties['Spec'];
      if (specProp) {
        if (specProp.type === 'select' && specProp.select) {
          specs = [specProp.select.name];
        } else if (specProp.type === 'multi_select' && specProp.multi_select) {
          specs = specProp.multi_select.map(s => s.name);
        } else if (specProp.type === 'rich_text' && specProp.rich_text.length > 0) {
          specs = specProp.rich_text.map(t => t.plain_text);
        }
      }

      return { id: page.id, name, price, specs };
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("GET Products 錯誤:", error.message);
    res.status(500).json({ error: error.message });
  }
};
