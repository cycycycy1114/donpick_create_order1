const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_TOKEN });

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send();

  const { nickname, product, price, quantity, totalPrice, spec, delivery } = req.body;

  try {
    await notion.pages.create({
      parent: { database_id: process.env.DATABASE_ID },
      properties: {
        'LINE 暱稱': { title: [{ text: { content: nickname } }] },
        '品項': { rich_text: [{ text: { content: product } }] },
        '單價': { number: Number(price || 0) },
        '數量': { number: Number(quantity) },
        '總金額': { number: Number(totalPrice || 0) },
        '規格': { select: { name: spec } },
        '取貨方式': { select: { name: delivery } },
        '狀態': { select: { name: '待處理' } }
      }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: error.message });
  }
};
