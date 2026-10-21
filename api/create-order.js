const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_TOKEN });

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const {
    nickname,
    contactType,
    contactInfo,
    product,
    price,
    quantity,
    totalPrice,
    spec,
    delivery
  } = req.body;

  try {
    if (!process.env.DATABASE_ID) {
      throw new Error("缺少 DATABASE_ID 環境變數");
    }

    // 新增資料至 B 資料庫（訂單資料庫）
    await notion.pages.create({
      parent: { database_id: process.env.DATABASE_ID },
      properties: {
        '買家暱稱': {
          title: [{ text: { content: nickname || '' } }]
        },
        '聯絡管道': {
          select: { name: contactType || 'LINE ID' }
        },
        '聯絡帳號': {
          rich_text: [{ text: { content: contactInfo || '' } }]
        },
        '品項': {
          rich_text: [{ text: { content: product || '' } }]
        },
        '單價': {
          number: Number(price || 0)
        },
        '數量': {
          number: Number(quantity || 1)
        },
        '總金額': {
          number: Number(totalPrice || 0)
        },
        '規格': {
          select: { name: spec || '預設規格' }
        },
        '取貨方式': {
          select: { name: delivery || '7-11 店到店' }
        },
        '狀態': {
          select: { name: '待處理' }
        }
      }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Create order error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
