const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_TOKEN });

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send();

  const { nickname, product, quantity } = req.body;

  try {
    // 新增資料到 B 資料庫（訂單資料庫）
    await notion.pages.create({
      parent: { database_id: process.env.DATABASE_ID },
      properties: {
        'LINE 暱稱': { title: [{ text: { content: nickname } }] },
        '品項': { rich_text: [{ text: { content: product } }] },
        '數量': { number: Number(quantity) },
        '狀態': { select: { name: '待處理' } }
      }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
